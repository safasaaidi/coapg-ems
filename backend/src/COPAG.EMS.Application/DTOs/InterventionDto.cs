namespace COPAG.EMS.Application.DTOs;

public class InterventionDto
{
    public Guid Id { get; set; }
    public Guid WorkOrderId { get; set; }
    public string WorkOrderTicketNumber { get; set; } = string.Empty;
    public Guid TechnicianId { get; set; }
    public string TechnicianName { get; set; } = string.Empty;
    public string DiagnosticDetails { get; set; } = string.Empty;
    public string ActionsTaken { get; set; } = string.Empty;
    public string? ResultNotes { get; set; }
    public string? Comment { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime? EndedAt { get; set; }
    public int? DowntimeMinutes { get; set; }
}