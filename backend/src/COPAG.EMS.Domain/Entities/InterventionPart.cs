using COPAG.EMS.Domain.Common;

namespace COPAG.EMS.Domain.Entities;

public class InterventionPart : BaseEntity
{
    public Guid InterventionId { get; set; }
    public Intervention? Intervention { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Quantity { get; set; }
}