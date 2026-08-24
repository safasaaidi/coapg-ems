using COPAG.EMS.Domain.Common;
using COPAG.EMS.Domain.Enums;

namespace COPAG.EMS.Domain.Entities;

public class Equipment : BaseEntity
{
    // --- Identification ---
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public string SerialNumber { get; set; } = string.Empty;

    // --- Localisation précise (texte libre, en plus du Site/Department) ---
    public string Location { get; set; } = string.Empty;

    // --- Rattachement au département (qui lui-même rattache au site) ---
    public Guid DepartmentId { get; set; }
    public Department? Department { get; set; }

    // --- Catégorie structurée (remplace l'ancien "Category" en texte libre) ---
    public Guid EquipmentTypeId { get; set; }
    public EquipmentType? EquipmentType { get; set; }

    // --- Responsable de l'équipement ---
    public Guid? ResponsibleUserId { get; set; }
    public User? ResponsibleUser { get; set; }

    // --- Statut et criticité ---
    public EquipmentStatus Status { get; set; } = EquipmentStatus.Operational;
    public PriorityLevel Criticality { get; set; } = PriorityLevel.Low;

    // --- Dates ---
    public DateTime? AcquisitionDate { get; set; }
    public DateTime InstallationDate { get; set; }
    public DateTime? WarrantyExpirationDate { get; set; }

    // --- Valeur facultative ---
    public decimal? Value { get; set; }

    // --- Historique des demandes liées à cet équipement ---
    public ICollection<WorkOrder> WorkOrders { get; set; } = new List<WorkOrder>();
}