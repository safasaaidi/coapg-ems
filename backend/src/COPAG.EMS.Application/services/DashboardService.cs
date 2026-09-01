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

    // Fenêtre d'observation utilisée pour approximer le MTBF (30 jours = 720h).
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
        int completed = requests.Count(r => r.Status is WorkOrderStatus.Closed or WorkOrderStatus.Completed);

        // Retard réel : demande non clôturée et déclarée au-delà du seuil
        int overdue = requests.Count(r =>
            r.Status is not (WorkOrderStatus.Closed or WorkOrderStatus.Completed or WorkOrderStatus.Rejected)
            && r.ReportedAt < now.AddDays(-OverdueThresholdDays));

        // MTTR (RG-11) : Temps total de réparation / Nombre d'interventions
        double totalRepairHours = interventions.Sum(i => (i.EndedAt!.Value - i.StartedAt).TotalHours);
        double mttr = interventions.Count > 0 ? totalRepairHours / interventions.Count : 0;

        // MTBF (RG-12) : Moyenne du MTBF par équipement ayant subi au moins une panne
        var failuresByEquipment = requests
            .Where(r => !string.IsNullOrWhiteSpace(r.FailureCategory))
            .GroupBy(r => r.EquipmentId)
            .Select(g => g.Count())
            .ToList();

        double mtbf = failuresByEquipment.Count > 0
            ? failuresByEquipment.Average(failureCount => failureCount > 0 ? ObservationWindowHours / failureCount : ObservationWindowHours)
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

    public async Task<List<ChartDataDto>> GetFailuresByDepartmentAsync()
    {
        return await _context.WorkOrders
            .AsNoTracking()
            .Include(w => w.Equipment)
                .ThenInclude(e => e!.Department)
            .GroupBy(w => w.Equipment != null && w.Equipment.Department != null 
                ? w.Equipment.Department.Name 
                : "Non Défini")
            .Select(g => new ChartDataDto 
            { 
                Label = g.Key, 
                Value = g.Count() 
            })
            .ToListAsync();
    }

    public async Task<List<ChartDataDto>> GetEquipmentStatusDistributionAsync()
{
    var equipments = await _context.Equipments.AsNoTracking().ToListAsync();
    var total = equipments.Count;
    
    if (total == 0) 
        return new List<ChartDataDto>();

    return equipments
        .GroupBy(e => e.Status)
        .Select(g => new ChartDataDto
        {
            Label = g.Key switch
            {
                EquipmentStatus.Operational => "En Service",
                EquipmentStatus.InMaintenance => "En Maintenance",
                EquipmentStatus.Down => "En Panne",
                _ => g.Key.ToString()
            },
            Value = Math.Round((double)g.Count() / total * 100, 1)
        })
        .ToList();
}
}