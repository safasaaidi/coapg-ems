using COPAG.EMS.Domain.Common;
using COPAG.EMS.Domain.Enums;

namespace COPAG.EMS.Domain.Entities;

public class PreventiveTask : BaseEntity
{
    public Guid PreventivePlanId { get; set; }
    public PreventivePlan? PreventivePlan { get; set; }

    public Guid? AssignedTechnicianId { get; set; }
    public User? AssignedTechnician { get; set; }

    public DateTime DueDate { get; set; }
    public WorkOrderStatus Status { get; set; } = WorkOrderStatus.New; // réutilise le même enum que WorkOrder

    public DateTime? CompletedAt { get; set; }
    public string? CompletionNotes { get; set; }
}