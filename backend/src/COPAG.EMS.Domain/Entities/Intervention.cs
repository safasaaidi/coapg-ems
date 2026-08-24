using COPAG.EMS.Domain.Common;

namespace COPAG.EMS.Domain.Entities;

public class Intervention : BaseEntity
{
    // Une intervention est toujours liée à UNE demande précise (WorkOrder)
    public Guid WorkOrderId { get; set; }
    public WorkOrder? WorkOrder { get; set; }

    // Le technicien qui a réalisé cette intervention
    public Guid TechnicianId { get; set; }
    public User? Technician { get; set; }

    public string DiagnosticDetails { get; set; } = string.Empty;
    public string ActionsTaken { get; set; } = string.Empty;
    public string? ResultNotes { get; set; }
    public string? Comment { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime? EndedAt { get; set; }
    public int? DowntimeMinutes { get; set; } // durée d'arrêt, utile pour le calcul du MTTR
}