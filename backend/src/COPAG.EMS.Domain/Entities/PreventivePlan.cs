using COPAG.EMS.Domain.Common;

namespace COPAG.EMS.Domain.Entities;

public class PreventivePlan : BaseEntity
{
    public Guid EquipmentId { get; set; }
    public Equipment? Equipment { get; set; }

    public string Name { get; set; } = string.Empty;       // ex: "Vidange trimestrielle"
    public string Checklist { get; set; } = string.Empty;  // liste des points à vérifier
    public int FrequencyInDays { get; set; }                // ex: 90 pour "tous les 3 mois"
    public int EstimatedDurationMinutes { get; set; }

    public DateTime NextDueDate { get; set; }               // calculée et recalculée après chaque tâche exécutée
    public bool IsActive { get; set; } = true;

    public ICollection<PreventiveTask> Tasks { get; set; } = new List<PreventiveTask>();
}