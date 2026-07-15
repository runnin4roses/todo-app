using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TodoApi.Data;
using TodoApi.DTOs;
using TodoApi.Models;

namespace TodoApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TodosController(AppDbContext db) : ControllerBase
{
    private int CurrentUserId =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new UnauthorizedAccessException("User is not authenticated."));

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TodoResponse>>> GetAll(
        [FromQuery] string? filter = null)
    {
        var query = db.TodoItems
            .Where(t => t.UserId == CurrentUserId)
            .AsQueryable();

        query = filter?.ToLowerInvariant() switch
        {
            "active" => query.Where(t => !t.IsCompleted),
            "completed" => query.Where(t => t.IsCompleted),
            _ => query
        };

        var todos = await query
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => ToResponse(t))
            .ToListAsync();

        return Ok(todos);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<TodoResponse>> GetById(int id)
    {
        var todo = await FindOwnedTodo(id);
        if (todo is null)
        {
            return NotFound(new { message = "Todo not found." });
        }

        return Ok(ToResponse(todo));
    }

    [HttpPost]
    public async Task<ActionResult<TodoResponse>> Create(CreateTodoRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Title))
        {
            return BadRequest(new { message = "Title is required." });
        }

        if (request.DueDate.HasValue && request.DueDate.Value.Date < DateTime.UtcNow.Date)
        {
            return BadRequest(new { message = "Due date cannot be in the past." });
        }

        var now = DateTime.UtcNow;
        var todo = new TodoItem
        {
            Title = request.Title.Trim(),
            Description = string.IsNullOrWhiteSpace(request.Description)
                ? null
                : request.Description.Trim(),
            DueDate = request.DueDate,
            IsCompleted = false,
            CreatedAt = now,
            UpdatedAt = now,
            UserId = CurrentUserId
        };

        db.TodoItems.Add(todo);
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = todo.Id }, ToResponse(todo));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<TodoResponse>> Update(int id, UpdateTodoRequest request)
    {
        var todo = await FindOwnedTodo(id);
        if (todo is null)
        {
            return NotFound(new { message = "Todo not found." });
        }

        if (string.IsNullOrWhiteSpace(request.Title))
        {
            return BadRequest(new { message = "Title is required." });
        }

        if (request.DueDate.HasValue && request.DueDate.Value.Date < DateTime.UtcNow.Date)
        {
            return BadRequest(new { message = "Due date cannot be in the past." });
        }

        todo.Title = request.Title.Trim();
        todo.Description = string.IsNullOrWhiteSpace(request.Description)
            ? null
            : request.Description.Trim();
        todo.DueDate = request.DueDate;
        todo.IsCompleted = request.IsCompleted;
        todo.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();
        return Ok(ToResponse(todo));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var todo = await FindOwnedTodo(id);
        if (todo is null)
        {
            return NotFound(new { message = "Todo not found." });
        }

        db.TodoItems.Remove(todo);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private async Task<TodoItem?> FindOwnedTodo(int id) =>
        await db.TodoItems.FirstOrDefaultAsync(t => t.Id == id && t.UserId == CurrentUserId);

    private static TodoResponse ToResponse(TodoItem todo) => new()
    {
        Id = todo.Id,
        Title = todo.Title,
        Description = todo.Description,
        DueDate = todo.DueDate,
        IsCompleted = todo.IsCompleted,
        CreatedAt = todo.CreatedAt,
        UpdatedAt = todo.UpdatedAt
    };
}
