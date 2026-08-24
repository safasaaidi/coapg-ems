using COPAG.EMS.Domain.Common;
using COPAG.EMS.Domain.Enums;

namespace COPAG.EMS.Domain.Entities;

public class User : BaseEntity
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty; // jamais le mot de passe en clair (ENF-01)
    public UserRole Role { get; set; } = UserRole.Requester;
    public bool IsActive { get; set; } = true;

    // Rattachement optionnel à un site/département (ex: un technicien travaille sur un site précis)
    public Guid? SiteId { get; set; }
    public Site? Site { get; set; }

    public Guid? DepartmentId { get; set; }
    public Department? Department { get; set; }
}