namespace COPAG.EMS.Application.DTOs;

public class EquipmentDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public string SerialNumber { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public Guid DepartmentId { get; set; }
    public string DepartmentName { get; set; } = string.Empty;
    public Guid EquipmentTypeId { get; set; }
    public string EquipmentTypeName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Criticality { get; set; } = string.Empty;
    public DateTime InstallationDate { get; set; }
}