using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using COPAG.EMS.Application.Services;

namespace COPAG.EMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly DashboardService _dashboardService;

    public DashboardController(DashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet("kpis")]
    public async Task<IActionResult> GetKpis()
    {
        var kpis = await _dashboardService.GetKpisAsync();
        return Ok(kpis);
    }
    [HttpGet("failures-by-department")]
public async Task<IActionResult> GetFailuresByDepartment() => Ok(await _dashboardService.GetFailuresByDepartmentAsync());

[HttpGet("equipment-status")]
public async Task<IActionResult> GetEquipmentStatus() => Ok(await _dashboardService.GetEquipmentStatusDistributionAsync());
}