using COPAG.EMS.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace COPAG.EMS.API.Controllers;

[ApiController]
[Route("api/equipment-types")]
public class EquipmentTypesController : ControllerBase
{
    private readonly EquipmentTypeService _service;

    public EquipmentTypesController(EquipmentTypeService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _service.GetAllAsync();
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateEquipmentTypeRequest request)
    {
        var result = await _service.CreateAsync(request.Name, request.Description);
        return CreatedAtAction(nameof(GetAll), new { id = result.Id }, result);
    }
}

public class CreateEquipmentTypeRequest
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}