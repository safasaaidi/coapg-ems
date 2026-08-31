using COPAG.EMS.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace COPAG.EMS.API.Controllers;

[ApiController]
[Route("api/departments")]
public class DepartmentsController : ControllerBase
{
    private readonly DepartmentService _service;

    public DepartmentsController(DepartmentService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _service.GetAllAsync());

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateDepartmentRequest request)
    {
        var result = await _service.CreateAsync(request.Name, request.SiteId);
        return CreatedAtAction(nameof(GetAll), new { id = result.Id }, result);
    }

    [HttpGet("export")]
    [Authorize(Roles = "Admin,ResponsableMaintenance")]
    public async Task<IActionResult> ExportCsv([FromServices] CsvExportService csvService)
    {
        var departments = await _service.GetAllAsync();
        var bytes = csvService.ExportToCsv(departments);
        return File(bytes, "text/csv", $"departements_{DateTime.UtcNow:yyyyMMdd}.csv");
    }
}

public class CreateDepartmentRequest
{
    public string Name { get; set; } = string.Empty;
    public Guid SiteId { get; set; }
}