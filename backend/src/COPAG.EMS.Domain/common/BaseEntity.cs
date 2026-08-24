namespace COPAG.EMS.Domain.Common;

public abstract class BaseEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    
    // Règle RG-08 : Soft Delete (conservation de l'historique)
    public bool IsDeleted { get; set; } = false;
}