using COPAG.EMS.Domain.Common;
using COPAG.EMS.Domain.Enums;

namespace COPAG.EMS.Domain.Entities;

public class WorkOrder : BaseEntity
{
    // --- Identification ---
    public string TicketNumber { get; set; } = string.Empty; // ex: WO-2026-0001
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string FailureCategory { get; set; } = string.Empty;

    // --- Classification ---
    public WorkOrderStatus Status { get; set; } = WorkOrderStatus.New;
    public PriorityLevel Priority { get; set; } = PriorityLevel.Medium;

    // --- Rapprochement avec l'Équipement ---
    public Guid EquipmentId { get; set; }
    public Equipment? Equipment { get; set; }

    // --- Demandeur et technicien : activés maintenant que User existe ---
    public Guid RequesterId { get; set; }
    public User? Requester { get; set; }

    public Guid? AssignedTechnicianId { get; set; }
    public User? AssignedTechnician { get; set; }

    // --- Suivi temporel pour les KPIs (MTTR / MTBF) ---
    public DateTime ReportedAt { get; set; } = DateTime.UtcNow;
    public DateTime? StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime? ClosedAt { get; set; }

    // --- Historique des interventions liées à cette demande ---
    // Retiré : DiagnosticDetails, ActionsTaken, ResolutionDetails
    // (ces infos vivent maintenant dans Intervention, car il peut y en avoir plusieurs)
    public ICollection<Intervention> Interventions { get; set; } = new List<Intervention>();
}