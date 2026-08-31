namespace COPAG.EMS.Application.DTOs;

public class PreventivePlanDto
{
    public Guid Id { get; set; }
    public Guid EquipmentId { get; set; }
    public string EquipmentName { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Checklist { get; set; } = string.Empty;
    public int FrequencyInDays { get; set; }
    public DateTime NextDueDate { get; set; }
    public bool IsActive { get; set; }
}

public class CreatePreventivePlanRequest
{
    public Guid EquipmentId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Checklist { get; set; } = string.Empty;
    public int FrequencyInDays { get; set; }
    public int EstimatedDurationMinutes { get; set; }
    public DateTime NextDueDate { get; set; }
}