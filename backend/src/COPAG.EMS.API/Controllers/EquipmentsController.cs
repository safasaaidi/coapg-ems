using COPAG.EMS.Application.DTOs;
using COPAG.EMS.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace COPAG.EMS.API.Controllers;

[ApiController]
[Route("api/equipment")]
public class EquipmentsController : ControllerBase
{
    private readonly EquipmentService _service;

    public EquipmentsController(EquipmentService service)
    {
        _service = service;
    }
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] EquipmentFilterRequest filter)
    {
        return Ok(await _service.GetAllAsync(filter));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _service.GetByIdAsync(id);
        if (result == null) return NotFound(new { message = "Équipement introuvable." });
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateEquipmentRequest request)
    {
        var (result, error) = await _service.CreateAsync(request);
        if (error != null) return BadRequest(new { message = error });
        return CreatedAtAction(nameof(GetById), new { id = result!.Id }, result);
    }

    [HttpGet("export")]
    [Authorize(Roles = "Admin,ResponsableMaintenance")]
    public async Task<IActionResult> ExportCsv([FromServices] CsvExportService csvService)
    {
        var equipments = await _service.GetAllAsync();
        var bytes = csvService.ExportToCsv(equipments);
        return File(bytes, "text/csv", $"equipements_{DateTime.UtcNow:yyyyMMdd}.csv");
    }
}