using COPAG.EMS.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace COPAG.EMS.API.Controllers;

[ApiController]
[Route("api/sites")]
public class SitesController : ControllerBase
{
    private readonly SiteService _service;

    public SitesController(SiteService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _service.GetAllAsync());

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateSiteRequest request)
    {
        var result = await _service.CreateAsync(request.Name, request.Address, request.City);
        return CreatedAtAction(nameof(GetAll), new { id = result.Id }, result);
    }
}

public class CreateSiteRequest
{
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
}