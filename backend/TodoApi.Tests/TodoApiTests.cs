using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using TodoApi.Data;
using TodoApi.DTOs;
using Xunit;

namespace TodoApi.Tests;

public class TodoApiWebApplicationFactory : WebApplicationFactory<Program>
{
    private readonly string _databaseName = Guid.NewGuid().ToString();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        builder.ConfigureServices(services =>
        {
            services.AddDbContext<AppDbContext>(options =>
                options.UseInMemoryDatabase(_databaseName));
        });
    }
}

public class TodoApiTestBase : IClassFixture<TodoApiWebApplicationFactory>
{
    protected readonly HttpClient Client;
    protected readonly JsonSerializerOptions JsonOptions = new() { PropertyNameCaseInsensitive = true };

    protected TodoApiTestBase(TodoApiWebApplicationFactory factory)
    {
        Client = factory.CreateClient();
    }

    protected async Task<string> RegisterAndGetTokenAsync(string email, string password = "password123")
    {
        var response = await Client.PostAsJsonAsync("/api/auth/register", new RegisterRequest
        {
            Email = email,
            Password = password
        });

        response.EnsureSuccessStatusCode();
        var auth = await response.Content.ReadFromJsonAsync<AuthResponse>(JsonOptions);
        return auth!.Token;
    }

    protected void SetBearerToken(string token) =>
        Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
}

public class OwnershipTests(TodoApiWebApplicationFactory factory) : TodoApiTestBase(factory)
{
    [Fact]
    public async Task User_cannot_access_another_users_todo()
    {
        var userAToken = await RegisterAndGetTokenAsync("user-a@example.com");
        SetBearerToken(userAToken);

        var createResponse = await Client.PostAsJsonAsync("/api/todos", new CreateTodoRequest
        {
            Title = "User A task"
        });
        createResponse.EnsureSuccessStatusCode();

        var created = await createResponse.Content.ReadFromJsonAsync<TodoResponse>(JsonOptions);
        var todoId = created!.Id;

        var userBToken = await RegisterAndGetTokenAsync("user-b@example.com");
        SetBearerToken(userBToken);

        var getResponse = await Client.GetAsync($"/api/todos/{todoId}");
        Assert.Equal(HttpStatusCode.NotFound, getResponse.StatusCode);

        var updateResponse = await Client.PatchAsJsonAsync($"/api/todos/{todoId}", new PatchTodoRequest
        {
            Title = "Hijacked",
            IsCompleted = true
        });
        Assert.Equal(HttpStatusCode.NotFound, updateResponse.StatusCode);

        var deleteResponse = await Client.DeleteAsync($"/api/todos/{todoId}");
        Assert.Equal(HttpStatusCode.NotFound, deleteResponse.StatusCode);
    }

    [Fact]
    public async Task User_only_sees_their_own_todos_in_list()
    {
        var userAToken = await RegisterAndGetTokenAsync("list-a@example.com");
        SetBearerToken(userAToken);
        await Client.PostAsJsonAsync("/api/todos", new CreateTodoRequest { Title = "A task" });

        var userBToken = await RegisterAndGetTokenAsync("list-b@example.com");
        SetBearerToken(userBToken);
        await Client.PostAsJsonAsync("/api/todos", new CreateTodoRequest { Title = "B task" });

        var listResponse = await Client.GetAsync("/api/todos");
        listResponse.EnsureSuccessStatusCode();

        var todos = await listResponse.Content.ReadFromJsonAsync<List<TodoResponse>>(JsonOptions);
        Assert.Single(todos!);
        Assert.Equal("B task", todos![0].Title);
    }
}

public class ValidationTests(TodoApiWebApplicationFactory factory) : TodoApiTestBase(factory)
{
    [Fact]
    public async Task Create_rejects_empty_title()
    {
        var token = await RegisterAndGetTokenAsync("validation@example.com");
        SetBearerToken(token);

        var response = await Client.PostAsJsonAsync("/api/todos", new CreateTodoRequest
        {
            Title = ""
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Create_rejects_whitespace_only_title()
    {
        var token = await RegisterAndGetTokenAsync("whitespace@example.com");
        SetBearerToken(token);

        var response = await Client.PostAsJsonAsync("/api/todos", new CreateTodoRequest
        {
            Title = "   "
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Create_rejects_past_due_date()
    {
        var token = await RegisterAndGetTokenAsync("duedate@example.com");
        SetBearerToken(token);

        var response = await Client.PostAsJsonAsync("/api/todos", new CreateTodoRequest
        {
            Title = "Valid title",
            DueDate = DateTime.UtcNow.AddDays(-1)
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var body = await response.Content.ReadAsStringAsync();
        Assert.Contains("Due date cannot be in the past", body);
    }

    [Fact]
    public async Task Unauthenticated_requests_are_rejected()
    {
        var response = await Client.GetAsync("/api/todos");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}

public class AuthTests(TodoApiWebApplicationFactory factory) : TodoApiTestBase(factory)
{
    [Fact]
    public async Task Register_returns_token_and_201()
    {
        var response = await Client.PostAsJsonAsync("/api/auth/register", new RegisterRequest
        {
            Email = "new-user@example.com",
            Password = "password123"
        });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var auth = await response.Content.ReadFromJsonAsync<AuthResponse>(JsonOptions);
        Assert.NotNull(auth);
        Assert.False(string.IsNullOrWhiteSpace(auth!.Token));
        Assert.Equal("new-user@example.com", auth.Email);
    }

    [Fact]
    public async Task Login_with_wrong_password_returns_401()
    {
        await RegisterAndGetTokenAsync("login-test@example.com");

        var response = await Client.PostAsJsonAsync("/api/auth/login", new LoginRequest
        {
            Email = "login-test@example.com",
            Password = "wrongpassword"
        });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Duplicate_register_returns_409()
    {
        await RegisterAndGetTokenAsync("duplicate@example.com");

        var response = await Client.PostAsJsonAsync("/api/auth/register", new RegisterRequest
        {
            Email = "duplicate@example.com",
            Password = "password123"
        });

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task Me_returns_current_user()
    {
        var token = await RegisterAndGetTokenAsync("me-test@example.com");
        SetBearerToken(token);

        var response = await Client.GetAsync("/api/auth/me");
        response.EnsureSuccessStatusCode();

        var body = await response.Content.ReadFromJsonAsync<MeResponse>(JsonOptions);
        Assert.NotNull(body);
        Assert.Equal("me-test@example.com", body!.Email);
        Assert.False(string.IsNullOrWhiteSpace(body.Id));
    }
}

public class CrudTests(TodoApiWebApplicationFactory factory) : TodoApiTestBase(factory)
{
    [Fact]
    public async Task Create_todo_returns_201()
    {
        var token = await RegisterAndGetTokenAsync("create@example.com");
        SetBearerToken(token);

        var response = await Client.PostAsJsonAsync("/api/todos", new CreateTodoRequest
        {
            Title = "New task",
            Description = "Details"
        });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var todo = await response.Content.ReadFromJsonAsync<TodoResponse>(JsonOptions);
        Assert.NotNull(todo);
        Assert.Equal("New task", todo!.Title);
        Assert.Equal("Details", todo.Description);
        Assert.False(todo.IsCompleted);
    }

    [Fact]
    public async Task Filter_active_excludes_completed()
    {
        var token = await RegisterAndGetTokenAsync("filter@example.com");
        SetBearerToken(token);

        var activeResponse = await Client.PostAsJsonAsync("/api/todos", new CreateTodoRequest
        {
            Title = "Active task"
        });
        activeResponse.EnsureSuccessStatusCode();
        var activeTodo = await activeResponse.Content.ReadFromJsonAsync<TodoResponse>(JsonOptions);

        var completedResponse = await Client.PostAsJsonAsync("/api/todos", new CreateTodoRequest
        {
            Title = "Completed task"
        });
        completedResponse.EnsureSuccessStatusCode();
        var completedTodo = await completedResponse.Content.ReadFromJsonAsync<TodoResponse>(JsonOptions);

        await Client.PatchAsJsonAsync($"/api/todos/{completedTodo!.Id}", new PatchTodoRequest
        {
            IsCompleted = true
        });

        var listResponse = await Client.GetAsync("/api/todos?filter=active");
        listResponse.EnsureSuccessStatusCode();

        var todos = await listResponse.Content.ReadFromJsonAsync<List<TodoResponse>>(JsonOptions);
        Assert.Single(todos!);
        Assert.Equal(activeTodo!.Id, todos![0].Id);
        Assert.False(todos[0].IsCompleted);
    }

    [Fact]
    public async Task Patch_clearDueDate_removes_due_date()
    {
        var token = await RegisterAndGetTokenAsync("patch@example.com");
        SetBearerToken(token);

        var createResponse = await Client.PostAsJsonAsync("/api/todos", new CreateTodoRequest
        {
            Title = "Task with due date",
            DueDate = DateTime.UtcNow.AddDays(3)
        });
        createResponse.EnsureSuccessStatusCode();

        var created = await createResponse.Content.ReadFromJsonAsync<TodoResponse>(JsonOptions);
        Assert.NotNull(created!.DueDate);

        var patchResponse = await Client.PatchAsJsonAsync($"/api/todos/{created.Id}", new PatchTodoRequest
        {
            ClearDueDate = true
        });
        patchResponse.EnsureSuccessStatusCode();

        var updated = await patchResponse.Content.ReadFromJsonAsync<TodoResponse>(JsonOptions);
        Assert.NotNull(updated);
        Assert.Null(updated!.DueDate);
    }
}

file record MeResponse(string Id, string Email);
