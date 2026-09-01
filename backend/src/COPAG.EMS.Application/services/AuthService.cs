using COPAG.EMS.Domain.Entities;
using COPAG.EMS.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace COPAG.EMS.Application.Services;

public class AuthService
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _config;
    private readonly PasswordHasher<User> _passwordHasher = new();

    public AuthService(ApplicationDbContext context, IConfiguration config)
    {
        _context = context;
        _config = config;
    }

    public async Task<string?> LoginAsync(string email, string password)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email && u.IsActive);
        if (user == null) return null;

        var result = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, password);
        if (result == PasswordVerificationResult.Failed) return null;

        return GenerateToken(user);
    }

    private string GenerateToken(User user)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role.ToString()),
            new Claim(ClaimTypes.GivenName, user.FirstName),
            new Claim(ClaimTypes.Surname, user.LastName)
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(double.Parse(_config["Jwt:ExpiryMinutes"]!)),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
    public async Task<(string? Token, string? Error)> RegisterAsync(string fullName, string email, string password, string role)
{
    var exists = await _context.Users.AnyAsync(u => u.Email == email);
    if (exists) return (null, "Cet email est déjà utilisé.");

    if (!Enum.TryParse<Domain.Enums.UserRole>(role, true, out var userRole))
        userRole = Domain.Enums.UserRole.Demandeur; // valeur de repli si le rôle envoyé ne correspond à rien

    var parts = fullName.Trim().Split(' ', 2);
    var firstName = parts[0];
    var lastName = parts.Length > 1 ? parts[1] : parts[0];

    var user = new User
    {
        Id = Guid.NewGuid(),
        FirstName = firstName,
        LastName = lastName,
        Email = email,
        Role = userRole,
        IsActive = true, // activé immédiatement, comme demandé
        CreatedAt = DateTime.UtcNow
    };
    user.PasswordHash = _passwordHasher.HashPassword(user, password);

    _context.Users.Add(user);
    await _context.SaveChangesAsync();

    // Connecte directement l'utilisateur après inscription
    return (GenerateToken(user), null);
}
}