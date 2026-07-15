using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TodoApi.Data;
using TodoApi.DTOs;
using TodoApi.Models;
using TodoApi.Services;

namespace TodoApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(
    AppDbContext db,
    PasswordService passwordService,
    JwtTokenService jwtTokenService) : ControllerBase
{
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();

        if (await db.Users.AnyAsync(u => u.Email == normalizedEmail))
        {
            return Conflict(new { message = "An account with this email already exists." });
        }

        var user = new User
        {
            Email = normalizedEmail,
            PasswordHash = string.Empty,
            CreatedAt = DateTime.UtcNow
        };

        user.PasswordHash = passwordService.HashPassword(user, request.Password);
        db.Users.Add(user);
        await db.SaveChangesAsync();

        return Ok(new AuthResponse
        {
            Token = jwtTokenService.GenerateToken(user),
            Email = user.Email
        });
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail);

        if (user is null || !passwordService.VerifyPassword(user, request.Password))
        {
            return Unauthorized(new { message = "Invalid email or password." });
        }

        return Ok(new AuthResponse
        {
            Token = jwtTokenService.GenerateToken(user),
            Email = user.Email
        });
    }

    [Authorize]
    [HttpGet("me")]
    public ActionResult<object> Me()
    {
        var email = User.FindFirstValue(ClaimTypes.Email);
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Ok(new { id = userId, email });
    }
}
