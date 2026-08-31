namespace COPAG.EMS.Application.DTOs;

public class WorkOrderDto
{
    public Guid Id { get; set; }
    public string TicketNumber { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string FailureCategory { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public Guid EquipmentId { get; set; }
    public string EquipmentName { get; set; } = string.Empty;
    public Guid RequesterId { get; set; }
    public string RequesterName { get; set; } = string.Empty;
    public Guid? AssignedTechnicianId { get; set; }
    public string? AssignedTechnicianName { get; set; }
    public DateTime ReportedAt { get; set; }
    public DateTime? StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime? ClosedAt { get; set; }
    public string? MaintenanceType { get; set; }
public DateTime? DueDate { get; set; }
public string? Instructions { get; set; }
}