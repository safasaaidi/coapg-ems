using Microsoft.EntityFrameworkCore;
using COPAG.EMS.Application.DTOs;
using COPAG.EMS.Domain.Enums;
using COPAG.EMS.Infrastructure.Persistence;

namespace COPAG.EMS.Application.Services;

public class DashboardService
{
    private readonly ApplicationDbContext _context;

    // Seuil de retard : une demande non résolue au-delà de ce nombre de jours est considérée en retard.
    private const int OverdueThresholdDays = 3;

    // Fenêtre d'observation utilisée pour approximer le MTBF (30 jours), faute d'historique complet de disponibilité.
    private const double ObservationWindowHours = 720;

    public DashboardService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<DashboardKpiDto> GetKpisAsync()
    {
        var now = DateTime.UtcNow;

        var requests = await _context.WorkOrders.AsNoTracking().ToListAsync();
        var interventions = await _context.Interventions.AsNoTracking().Where(i => i.EndedAt.HasValue).ToListAsync();

        int total = requests.Count;
        int pending = requests.Count(r => r.Status is WorkOrderStatus.New or WorkOrderStatus.PendingValidation or WorkOrderStatus.Approved);
        int inProgress = requests.Count(r => r.Status == WorkOrderStatus.InProgress);
        int completed = requests.Count(r => r.Status is WorkOrderStatus.Completed or WorkOrderStatus.Closed);

        // Retard réel : demande toujours ouverte (pas Closed/Completed) et déclarée il y a plus de OverdueThresholdDays jours.
        int overdue = requests.Count(r =>
            r.Status is not (WorkOrderStatus.Closed or WorkOrderStatus.Completed or WorkOrderStatus.Rejected)
            && r.ReportedAt < now.AddDays(-OverdueThresholdDays));

        // MTTR (RG-11) : temps total de réparation / nombre de réparations clôturées.
        double totalRepairHours = interventions.Sum(i => (i.EndedAt!.Value - i.StartedAt).TotalHours);
        double mttr = interventions.Count > 0 ? totalRepairHours / interventions.Count : 0;

        // MTBF (RG-12), approximé par équipement : fenêtre d'observation / nombre de pannes distinctes par équipement,
        // puis moyenne sur l'ensemble des équipements ayant eu au moins une panne.
        var failuresByEquipment = requests
            .Where(r => !string.IsNullOrWhiteSpace(r.FailureCategory))
            .GroupBy(r => r.EquipmentId)
            .Select(g => g.Count())
            .ToList();

        double mtbf = failuresByEquipment.Count > 0
            ? failuresByEquipment.Average(failureCount => ObservationWindowHours / failureCount)
            : ObservationWindowHours;

        double availability = (mtbf + mttr) > 0 ? (mtbf / (mtbf + mttr)) * 100 : 100;

        return new DashboardKpiDto
        {
            TotalRequests = total,
            PendingRequests = pending,
            InProgressRequests = inProgress,
            CompletedRequests = completed,
            OverdueRequests = overdue,
            MttrHours = Math.Round(mttr, 2),
            MtbfHours = Math.Round(mtbf, 2),
            AvailabilityRate = Math.Round(availability, 2)
        };
    }
    public async Task<List<object>> GetFailuresByDepartmentAsync()
{
    return await _context.WorkOrders
        .Include(w => w.Equipment).ThenInclude(e => e!.Department)
        .GroupBy(w => w.Equipment!.Department!.Name)
        .Select(g => new { Label = g.Key, Value = g.Count() })
        .ToListAsync<object>();
}

public async Task<List<object>> GetEquipmentStatusDistributionAsync()
{
    var equipments = await _context.Equipments.AsNoTracking().ToListAsync();
    var total = equipments.Count;
    if (total == 0) return new List<object>();

    return equipments
        .GroupBy(e => e.Status)
        .Select(g => (object)new
        {
            Label = g.Key.ToString(),
            Value = Math.Round((double)g.Count() / total * 100, 1)
        })
        .ToList();
}
}