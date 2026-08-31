using COPAG.EMS.Application.DTOs;
using COPAG.EMS.Domain.Entities;
using COPAG.EMS.Domain.Enums;
using COPAG.EMS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace COPAG.EMS.Application.Services;

public class WorkOrderService
{
    private readonly ApplicationDbContext _context;

    public WorkOrderService(ApplicationDbContext context)
    {
        _context = context;
    }

    private static readonly Dictionary<WorkOrderStatus, WorkOrderStatus[]> AllowedTransitions = new()
    {
        [WorkOrderStatus.New] = new[] { WorkOrderStatus.PendingValidation, WorkOrderStatus.Rejected },
        [WorkOrderStatus.PendingValidation] = new[] { WorkOrderStatus.Approved, WorkOrderStatus.Rejected },
        [WorkOrderStatus.Approved] = new[] { WorkOrderStatus.InProgress },
        [WorkOrderStatus.InProgress] = new[] { WorkOrderStatus.OnHold, WorkOrderStatus.Completed },
        [WorkOrderStatus.OnHold] = new[] { WorkOrderStatus.InProgress },
        [WorkOrderStatus.Completed] = new[] { WorkOrderStatus.Closed },
    };

    public async Task<List<WorkOrderDto>> GetAllAsync()
    {
        return await _context.WorkOrders
            .Include(w => w.Equipment)
            .Include(w => w.Requester)
            .Include(w => w.AssignedTechnician)
            .Select(w => ToDto(w))
            .ToListAsync();
    }

    public async Task<(WorkOrderDto? Result, string? Error)> CreateAsync(CreateWorkOrderRequest request)
    {
        var equipment = await _context.Equipments.FindAsync(request.EquipmentId);
        if (equipment == null || equipment.IsDeleted)
            return (null, "Équipement introuvable ou inactif.");

        var requesterExists = await _context.Users.AnyAsync(u => u.Id == request.RequesterId);
        if (!requesterExists)
            return (null, "Demandeur introuvable.");

        var entity = new WorkOrder
        {
            Id = Guid.NewGuid(),
            TicketNumber = $"WO-{DateTime.UtcNow:yyyy}-{Random.Shared.Next(1000, 9999)}",
            Title = request.Title,
            Description = request.Description,
            FailureCategory = request.FailureCategory,
            EquipmentId = request.EquipmentId,
            RequesterId = request.RequesterId,
            Priority = (PriorityLevel)request.Priority,
            Status = WorkOrderStatus.New,
            ReportedAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow
        };

        _context.WorkOrders.Add(entity);
        await _context.SaveChangesAsync();

        await _context.Entry(entity).Reference(w => w.Equipment).LoadAsync();
        await _context.Entry(entity).Reference(w => w.Requester).LoadAsync();

        return (ToDto(entity), null);
    }

    public async Task<(WorkOrderDto? Result, string? Error)> AssignAsync(Guid workOrderId, AssignWorkOrderRequest request)
    {
        var workOrder = await _context.WorkOrders.FindAsync(workOrderId);
        if (workOrder == null)
            return (null, "Demande introuvable.");

        var technicianExists = await _context.Users.AnyAsync(u => u.Id == request.TechnicianId);
        if (!technicianExists)
            return (null, "Technicien introuvable.");

        if (request.DueDate < DateTime.UtcNow.Date)
            return (null, "La date prévue ne peut pas être dans le passé.");

        var previousTechnicianId = workOrder.AssignedTechnicianId;

        workOrder.AssignedTechnicianId = request.TechnicianId;
        workOrder.DueDate = request.DueDate;
        workOrder.MaintenanceType = (Domain.Enums.MaintenanceType)request.MaintenanceType;
        workOrder.Instructions = request.Instructions;
        workOrder.UpdatedAt = DateTime.UtcNow;

        _context.AuditLogs.Add(new AuditLog
        {
            Id = Guid.NewGuid(),
            EntityType = nameof(WorkOrder),
            EntityId = workOrder.Id,
            Action = "TechnicianAssigned",
            OldValue = previousTechnicianId?.ToString() ?? "none",
            NewValue = request.TechnicianId.ToString(),
            PerformedByUserId = request.TechnicianId,
            PerformedAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();

        await _context.Entry(workOrder).Reference(w => w.Equipment).LoadAsync();
        await _context.Entry(workOrder).Reference(w => w.Requester).LoadAsync();
        await _context.Entry(workOrder).Reference(w => w.AssignedTechnician).LoadAsync();

        return (ToDto(workOrder), null);
    }
public async Task<(WorkOrderDto? Result, string? Error)> ChangeStatusAsync(Guid workOrderId, ChangeStatusRequest request, string? userRole)
{
    var workOrder = await _context.WorkOrders
        .Include(w => w.Equipment)
        .Include(w => w.Requester)
        .Include(w => w.AssignedTechnician)
        .Include(w => w.Interventions)
        .FirstOrDefaultAsync(w => w.Id == workOrderId);

    if (workOrder == null)
        return (null, "Ordre de travail introuvable.");

    if (!Enum.TryParse<WorkOrderStatus>(request.NewStatus, true, out var newStatus))
        return (null, "Statut invalide.");

    if (newStatus == WorkOrderStatus.Closed)
    {
        var hasValidatedIntervention = workOrder.Interventions.Any(i => i.EndedAt != null);
        if (!hasValidatedIntervention)
        {
            return (null, "Règle RG-06 : Impossible de clôturer l'ordre de travail tant qu'aucune intervention n'a été terminée.");
        }

        workOrder.ClosedAt = DateTime.UtcNow;
    }

    if (newStatus == WorkOrderStatus.InProgress && workOrder.StartedAt == null)
    {
        workOrder.StartedAt = DateTime.UtcNow;
    }
    else if (newStatus == WorkOrderStatus.Completed)
    {
        workOrder.CompletedAt = DateTime.UtcNow;
    }

    var oldStatus = workOrder.Status;
    workOrder.Status = newStatus;
    workOrder.UpdatedAt = DateTime.UtcNow;

    _context.StatusHistories.Add(new StatusHistory
    {
        Id = Guid.NewGuid(),
        WorkOrderId = workOrder.Id,
        OldStatus = oldStatus,
        NewStatus = newStatus,
        ChangedByUserId = Guid.Empty,
        ChangedAt = DateTime.UtcNow,
        CreatedAt = DateTime.UtcNow
    });

    await _context.SaveChangesAsync();

    return (ToDto(workOrder), null);
}

    private static WorkOrderDto ToDto(WorkOrder w) => new()
    {
        Id = w.Id,
        TicketNumber = w.TicketNumber,
        Title = w.Title,
        Description = w.Description,
        FailureCategory = w.FailureCategory,
        Status = w.Status.ToString(),
        Priority = w.Priority.ToString(),
        EquipmentId = w.EquipmentId,
        EquipmentName = w.Equipment?.Name ?? "",
        RequesterId = w.RequesterId,
        RequesterName = w.Requester != null ? $"{w.Requester.FirstName} {w.Requester.LastName}" : "",
        AssignedTechnicianId = w.AssignedTechnicianId,
        AssignedTechnicianName = w.AssignedTechnician != null ? $"{w.AssignedTechnician.FirstName} {w.AssignedTechnician.LastName}" : null,
        ReportedAt = w.ReportedAt,
        StartedAt = w.StartedAt,
        CompletedAt = w.CompletedAt,
        ClosedAt = w.ClosedAt,
        MaintenanceType = w.MaintenanceType?.ToString(),
        DueDate = w.DueDate,
        Instructions = w.Instructions
    };

    public async Task<List<object>> GetStatusHistoryAsync(Guid workOrderId)
    {
        return await _context.StatusHistories
            .Where(h => h.WorkOrderId == workOrderId)
            .OrderBy(h => h.ChangedAt)
            .Select(h => (object)new
            {
                h.Id,
                OldStatus = h.OldStatus.ToString(),
                NewStatus = h.NewStatus.ToString(),
                h.ChangedByUserId,
                h.ChangedAt
            })
            .ToListAsync();
    }

    public async Task<List<WorkOrderDto>> GetFilteredWorkOrdersAsync(string? status, string? priority, Guid? technicianId, Guid? equipmentId)
    {
        var query = _context.WorkOrders
            .AsNoTracking()
            .Include(w => w.Equipment)
            .Include(w => w.Requester)
            .Include(w => w.AssignedTechnician)
            .AsQueryable();

        if (Enum.TryParse<WorkOrderStatus>(status, true, out var statusEnum))
            query = query.Where(w => w.Status == statusEnum);

        if (Enum.TryParse<PriorityLevel>(priority, true, out var priorityEnum))
            query = query.Where(w => w.Priority == priorityEnum);

        if (technicianId.HasValue)
            query = query.Where(w => w.AssignedTechnicianId == technicianId.Value);

        if (equipmentId.HasValue)
            query = query.Where(w => w.EquipmentId == equipmentId.Value);

        return await query.Select(w => ToDto(w)).ToListAsync();
    }
}