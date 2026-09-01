using COPAG.EMS.Application.Services;
using COPAG.EMS.Domain.Enums;
using Microsoft.AspNetCore.Mvc;

namespace COPAG.EMS.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;
    private readonly UserService _userService;

    public AuthController(AuthService authService, UserService userService)
    {
        _authService = authService;
        _userService = userService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var token = await _authService.LoginAsync(request.Email, request.Password);
        if (token == null) return Unauthorized(new { message = "Email ou mot de passe incorrect" });

        return Ok(new { token });
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        try
        {
            // Séparation Prénom / Nom
            var names = (request.FullName ?? string.Empty).Trim().Split(' ', 2);
            var firstName = names[0];
            var lastName = names.Length > 1 ? names[1] : string.Empty;

            // Suppression des espaces dans le rôle (ex: "Responsable Maintenance" -> "ResponsableMaintenance")
            string roleCleaned = (request.Role ?? string.Empty).Replace(" ", "");

            if (!Enum.TryParse<UserRole>(roleCleaned, true, out var userRole))
            {
                userRole = UserRole.Technician;
            }

            // Création dans SQL Server via le UserService
            var result = await _userService.CreateAsync(firstName, lastName, request.Email, request.Password, userRole);
            
            return Ok(new { message = "Compte créé avec succès", userId = result.Id });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class RegisterRequest
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}