namespace COPAG.EMS.Application.DTOs;

public class CreateWorkOrderRequest
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string FailureCategory { get; set; } = string.Empty;
    public Guid EquipmentId { get; set; }
    public Guid RequesterId { get; set; }
    public int Priority { get; set; }
}

public class AssignWorkOrderRequest
{
    public Guid TechnicianId { get; set; }
    public DateTime DueDate { get; set; }
    public int MaintenanceType { get; set; } // 0=Corrective,1=Preventive,2=Amelioration,3=Inspection
    public string? Instructions { get; set; }
}
public class ChangeStatusRequest
{
    public string NewStatus { get; set; } = string.Empty;
    public Guid ChangedByUserId { get; set; }
}