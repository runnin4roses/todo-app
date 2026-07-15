using System.ComponentModel.DataAnnotations;

namespace TodoApi.DTOs;

public record RegisterRequest
{
    [Required]
    [EmailAddress]
    [MaxLength(256)]
    public required string Email { get; init; }

    [Required]
    [MinLength(8)]
    [MaxLength(100)]
    public required string Password { get; init; }
}

public record LoginRequest
{
    [Required]
    [EmailAddress]
    public required string Email { get; init; }

    [Required]
    public required string Password { get; init; }
}

public record AuthResponse
{
    public required string Token { get; init; }
    public required string Email { get; init; }
}
