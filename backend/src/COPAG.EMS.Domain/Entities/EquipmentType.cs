using COPAG.EMS.Domain.Common;

namespace COPAG.EMS.Domain.Entities;

public class EquipmentType : BaseEntity
{
    public string Name { get; set; } = string.Empty;        // ex: "Presse hydraulique"
    public string Description { get; set; } = string.Empty;
}