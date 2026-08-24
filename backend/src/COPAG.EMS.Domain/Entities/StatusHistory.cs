using COPAG.EMS.Domain.Common;
using COPAG.EMS.Domain.Enums;

namespace COPAG.EMS.Domain.Entities;

public class StatusHistory : BaseEntity
{
    // Chaque changement de statut d'un WorkOrder est tracé ici (RG-10 : audit)
    public Guid WorkOrderId { get; set; }
    public WorkOrder? WorkOrder { get; set; }

    public WorkOrderStatus OldStatus { get; set; }
    public WorkOrderStatus NewStatus { get; set; }

    public Guid ChangedByUserId { get; set; }
    public User? ChangedByUser { get; set; }

    public DateTime ChangedAt { get; set; } = DateTime.UtcNow;
}