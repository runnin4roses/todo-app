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
