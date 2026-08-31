namespace COPAG.EMS.Application.DTOs;

public class CreateInterventionRequest
{
    public Guid WorkOrderId { get; set; }
    public Guid TechnicianId { get; set; }
    public string DiagnosticDetails { get; set; } = string.Empty;
    public string ActionsTaken { get; set; } = string.Empty;
    public string? ResultNotes { get; set; }
    public string? Comment { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime? EndedAt { get; set; }
    public int? DowntimeMinutes { get; set; }
    public List<PartUsageRequest> Parts { get; set; } = new();
}

public class PartUsageRequest
{
    public string Name { get; set; } = string.Empty;
    public int Quantity { get; set; }
}
