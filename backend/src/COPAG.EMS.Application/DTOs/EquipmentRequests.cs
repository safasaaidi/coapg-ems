namespace COPAG.EMS.Application.DTOs;

public class EquipmentFilterRequest
{
	public Guid? DepartmentId { get; set; }
	public string? Status { get; set; }
	public string? Criticality { get; set; }
}

public class CreateEquipmentRequest
{
	public string Code { get; set; } = string.Empty;
	public string Name { get; set; } = string.Empty;
	public string Type { get; set; } = string.Empty;
	public string Brand { get; set; } = string.Empty;
	public string Model { get; set; } = string.Empty;
	public string SerialNumber { get; set; } = string.Empty;
	public string Location { get; set; } = string.Empty;
	public Guid DepartmentId { get; set; }
	public Guid EquipmentTypeId { get; set; }
	public int Criticality { get; set; }
	public DateTime InstallationDate { get; set; }
}
