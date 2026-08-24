namespace COPAG.EMS.Application.DTOs;

public class DepartmentDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public Guid SiteId { get; set; }
}