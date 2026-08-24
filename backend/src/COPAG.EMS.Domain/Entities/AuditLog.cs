using COPAG.EMS.Domain.Common;

namespace COPAG.EMS.Domain.Entities;

public class AuditLog : BaseEntity
{
    public string EntityType { get; set; } = string.Empty; // ex: "WorkOrder", "Equipment"
    public Guid EntityId { get; set; }

    public string Action { get; set; } = string.Empty;      // ex: "StatusChanged", "Created", "Assigned"
    public string? OldValue { get; set; }
    public string? NewValue { get; set; }

    public Guid PerformedByUserId { get; set; }
    public User? PerformedByUser { get; set; }
    public DateTime PerformedAt { get; set; } = DateTime.UtcNow;
}