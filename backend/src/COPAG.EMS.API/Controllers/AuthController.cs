using COPAG.EMS.Application.DTOs;
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
        var names = (request.FullName ?? string.Empty).Trim().Split(' ', 2);
        var firstName = names[0];
        var lastName = names.Length > 1 ? names[1] : string.Empty;

        // Normalisation et mapping des rôles (Français -> Enum C#)
        string inputRole = (request.Role ?? string.Empty).Trim();
        
        UserRole userRole = inputRole.ToLower() switch
        {
            "responsable maintenance" or "responsablemaintenance" or "supervisor" => UserRole.Supervisor,
            "administrateur" or "admin" => UserRole.admin,
            "technicien" or "technician" => UserRole.Technician,
            "demandeur" => UserRole.Demandeur,
            _ => throw new Exception($"Le rôle '{request.Role}' est invalide.")
        };

        var result = await _userService.CreateAsync(firstName, lastName, request.Email, request.Password, userRole);
        
        return Ok(new { message = "Compte créé avec succès", userId = result.Id });
    }
    catch (Exception ex)
    {
        return BadRequest(new { message = ex.Message });
    }
}
}