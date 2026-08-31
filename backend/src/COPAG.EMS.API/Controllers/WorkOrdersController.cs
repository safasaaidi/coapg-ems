using System.Security.Claims;
using COPAG.EMS.Application.DTOs;
using COPAG.EMS.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace COPAG.EMS.API.Controllers;

[ApiController]
[Route("api/maintenance-requests")]
public class WorkOrdersController : ControllerBase
{
    private readonly WorkOrderService _service;

    public WorkOrdersController(WorkOrderService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? status,
        [FromQuery] string? priority,
        [FromQuery] Guid? technicianId,
        [FromQuery] Guid? equipmentId)
    {
        return Ok(await _service.GetFilteredWorkOrdersAsync(status, priority, technicianId, equipmentId));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateWorkOrderRequest request)
    {
        var (result, error) = await _service.CreateAsync(request);
        if (error != null) return BadRequest(new { message = error });
        return CreatedAtAction(nameof(GetAll), new { id = result!.Id }, result);
    }

    [HttpPatch("{id}/assign")]
    [Authorize(Roles = "Admin,ResponsableMaintenance")]
    public async Task<IActionResult> Assign(Guid id, [FromBody] AssignWorkOrderRequest request)
    {
        var (result, error) = await _service.AssignAsync(id, request);
        if (error != null) return BadRequest(new { message = error });
        return Ok(result);
    }

    [HttpPatch("{id}/status")]
    [Authorize]
    public async Task<IActionResult> ChangeStatus(Guid id, [FromBody] ChangeStatusRequest request)
    {
        var userRole = User.FindFirstValue(ClaimTypes.Role);
        var (result, error) = await _service.ChangeStatusAsync(id, request, userRole);
        if (error != null) return BadRequest(new { message = error });
        return Ok(result);
    }

    [HttpGet("{id}/history")]
    public async Task<IActionResult> GetHistory(Guid id)
    {
        return Ok(await _service.GetStatusHistoryAsync(id));
    }

    [HttpGet("export")]
    [Authorize(Roles = "Admin,ResponsableMaintenance")]
    public async Task<IActionResult> ExportCsv([FromServices] CsvExportService csvService)
    {
        var requests = await _service.GetAllAsync();
        var bytes = csvService.ExportToCsv(requests);
        return File(bytes, "text/csv", $"demandes_maintenance_{DateTime.UtcNow:yyyyMMdd}.csv");
    }
}