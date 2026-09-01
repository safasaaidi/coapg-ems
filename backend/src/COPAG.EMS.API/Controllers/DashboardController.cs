using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using COPAG.EMS.Application.Services;
using COPAG.EMS.Application.DTOs;

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

    /// <summary>
    /// Récupère les indicateurs clés de performance (KPIs) du tableau de bord.
    /// </summary>
    [HttpGet("kpis")]
    [ProducesResponseType(typeof(DashboardKpiDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<DashboardKpiDto>> GetKpis()
    {
        var kpis = await _dashboardService.GetKpisAsync();
        return Ok(kpis);
    }

    /// <summary>
    /// Récupère la répartition du nombre de pannes par département.
    /// </summary>
    [HttpGet("failures-by-department")]
    [ProducesResponseType(typeof(List<ChartDataDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<ChartDataDto>>> GetFailuresByDepartment()
    {
        var data = await _dashboardService.GetFailuresByDepartmentAsync();
        return Ok(data);
    }

    /// <summary>
    /// Récupère la distribution en pourcentage du statut des équipements.
    /// </summary>
    [HttpGet("equipment-status")]
    [ProducesResponseType(typeof(List<ChartDataDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<ChartDataDto>>> GetEquipmentStatus()
    {
        var data = await _dashboardService.GetEquipmentStatusDistributionAsync();
        return Ok(data);
    }
}