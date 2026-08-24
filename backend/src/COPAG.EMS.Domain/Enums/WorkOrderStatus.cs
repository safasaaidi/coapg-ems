namespace COPAG.EMS.Domain.Enums;

public enum WorkOrderStatus
{
    New = 1,              // Nouvelle demande de panne
    PendingValidation = 2,// En attente de validation
    Approved = 3,         // Approuvée / Assignée
    InProgress = 4,       // En cours d'intervention
    OnHold = 5,           // En attente (pièces / prestataire)
    Completed = 6,        // Réparée / En attente de clôture
    Closed = 7,           // Clôturée définitivement
    Rejected = 8          // Rejetée
}