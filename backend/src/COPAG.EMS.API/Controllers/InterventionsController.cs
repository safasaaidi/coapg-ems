using COPAG.EMS.Application.DTOs;
using COPAG.EMS.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace COPAG.EMS.API.Controllers;

[ApiController]
[Route("api")]
public class InterventionsController : ControllerBase
{
    private readonly InterventionService _service;

    public InterventionsController(InterventionService service)
    {
        _service = service;
    }

    [HttpGet("maintenance-requests/{workOrderId}/interventions")]
    public async Task<IActionResult> GetByWorkOrder(Guid workOrderId)
    {
        return Ok(await _service.GetByWorkOrderIdAsync(workOrderId));
    }

    [HttpPost("maintenance-requests/{workOrderId}/interventions")]
    public async Task<IActionResult> Create(Guid workOrderId, [FromBody] CreateInterventionRequest request)
    {
        request.WorkOrderId = workOrderId; // on force l'id de l'URL, pas celui du body (cohérence)
        var (result, error) = await _service.CreateAsync(request);
        if (error != null) return BadRequest(new { message = error });
        return CreatedAtAction(nameof(GetByWorkOrder), new { workOrderId }, result);
    }

    [HttpPatch("interventions/{id}/validate")]
    [Authorize(Roles = "Admin,ResponsableMaintenance,Technicien")]
    public async Task<IActionResult> Validate(Guid id, [FromBody] ValidateInterventionRequest request)
    {
        var (result, error) = await _service.ValidateAsync(id, request);
        if (error != null) return BadRequest(new { message = error });
        return Ok(result);
    }
}