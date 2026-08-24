using COPAG.EMS.Domain.Common;

namespace COPAG.EMS.Domain.Entities;

public class Attachment : BaseEntity
{
    public string FileName { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty; // ex: "image/jpeg", "application/pdf"
    public long FileSizeBytes { get; set; }

    // Système générique : dit "à quel type d'entité" et "à quel Id précis"
    // cette pièce jointe est rattachée (ex: "Equipment" + l'Id d'un équipement précis,
    // ou "WorkOrder" + l'Id d'une demande précise)
    public string EntityType { get; set; } = string.Empty; // ex: "Equipment", "WorkOrder"
    public Guid EntityId { get; set; }

    public Guid UploadedByUserId { get; set; }
    public User? UploadedByUser { get; set; }
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
}