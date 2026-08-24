using COPAG.EMS.Domain.Common;

namespace COPAG.EMS.Domain.Entities;

public class Site : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;       // ex: "Kénitra" — ajout
    // Un site contient plusieurs départements (relation "un vers plusieurs")
    public ICollection<Department> Departments { get; set; } = new List<Department>();
}