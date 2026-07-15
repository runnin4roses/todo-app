using System.ComponentModel.DataAnnotations;

namespace TodoApi.DTOs;

public record CreateTodoRequest
{
    [Required]
    [MinLength(1)]
    [MaxLength(200)]
    public required string Title { get; init; }

    [MaxLength(2000)]
    public string? Description { get; init; }

    public DateTime? DueDate { get; init; }
}

public record PatchTodoRequest
{
    [MinLength(1)]
    [MaxLength(200)]
    public string? Title { get; init; }

    [MaxLength(2000)]
    public string? Description { get; init; }

    public DateTime? DueDate { get; init; }

    public bool? IsCompleted { get; init; }

    public bool? ClearDueDate { get; init; }
}

public record TodoResponse
{
    public int Id { get; init; }
    public required string Title { get; init; }
    public string? Description { get; init; }
    public DateTime? DueDate { get; init; }
    public bool IsCompleted { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
}
