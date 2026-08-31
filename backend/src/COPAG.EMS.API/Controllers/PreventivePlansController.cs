using COPAG.EMS.Application.DTOs;
using COPAG.EMS.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace COPAG.EMS.API.Controllers;

[ApiController]
[Route("api/preventive-plans")]
public class PreventivePlansController : ControllerBase
{
    private readonly PreventivePlanService _service;

    public PreventivePlansController(PreventivePlanService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _service.GetAllAsync());

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePreventivePlanRequest request)
    {
        var (result, error) = await _service.CreateAsync(request);
        if (error != null) return BadRequest(new { message = error });
        return CreatedAtAction(nameof(GetAll), new { id = result!.Id }, result);
    }

    [HttpPost("generate-tasks")]
    [Authorize(Roles = "Admin,ResponsableMaintenance")]
    public async Task<IActionResult> GenerateTasks()
    {
        var count = await _service.GeneratePreventiveTasksAsync();
        return Ok(new { Count = count, Message = $"{count} tâches préventives générées." });
    }
    [HttpGet("upcoming-tasks")]
public async Task<IActionResult> GetUpcomingTasks() => Ok(await _service.GetUpcomingTasksAsync());
}