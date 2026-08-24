using COPAG.EMS.Domain.Common;

namespace COPAG.EMS.Domain.Entities;

public class Department : BaseEntity
{
    public string Name { get; set; } = string.Empty;

    // Un département appartient obligatoirement à UN site (relation "plusieurs vers un")
    public Guid SiteId { get; set; }
    public Site? Site { get; set; }
}