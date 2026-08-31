using COPAG.EMS.Application.DTOs;
using COPAG.EMS.Domain.Entities;
using COPAG.EMS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace COPAG.EMS.Application.Services;

public class InterventionService
{
    private readonly ApplicationDbContext _context;

    public InterventionService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<InterventionDto>> GetByWorkOrderIdAsync(Guid workOrderId)
    {
        return await _context.Interventions
            .Include(i => i.WorkOrder)
            .Include(i => i.Technician)
            .Where(i => i.WorkOrderId == workOrderId)
            .Select(i => ToDto(i))
            .ToListAsync();
    }

    public async Task<(InterventionDto? Result, string? Error)> CreateAsync(CreateInterventionRequest request)
{
    var workOrder = await _context.WorkOrders.FindAsync(request.WorkOrderId);
    if (workOrder == null) return (null, "Demande de maintenance introuvable.");

    var technicianExists = await _context.Users.AnyAsync(u => u.Id == request.TechnicianId);
    if (!technicianExists) return (null, "Technicien introuvable.");

    if (request.EndedAt.HasValue && request.EndedAt.Value < request.StartedAt)
        return (null, "La date de fin ne peut pas être antérieure à la date de début.");

    var entity = new Intervention
    {
        Id = Guid.NewGuid(),
        WorkOrderId = request.WorkOrderId,
        TechnicianId = request.TechnicianId,
        DiagnosticDetails = request.DiagnosticDetails,
        ActionsTaken = request.ActionsTaken,
        ResultNotes = request.ResultNotes,
        Comment = request.Comment,
        StartedAt = request.StartedAt,
        EndedAt = request.EndedAt,
        DowntimeMinutes = request.DowntimeMinutes,
        CreatedAt = DateTime.UtcNow
    };

    foreach (var part in request.Parts.Where(p => !string.IsNullOrWhiteSpace(p.Name)))
    {
        entity.Parts.Add(new InterventionPart
        {
            Id = Guid.NewGuid(),
            Name = part.Name,
            Quantity = part.Quantity,
            CreatedAt = DateTime.UtcNow
        });
    }

    _context.Interventions.Add(entity);
    await _context.SaveChangesAsync();

    await _context.Entry(entity).Reference(i => i.WorkOrder).LoadAsync();
    await _context.Entry(entity).Reference(i => i.Technician).LoadAsync();

    return (ToDto(entity), null);
}
    private static InterventionDto ToDto(Intervention i) => new()
    {
        Id = i.Id,
        WorkOrderId = i.WorkOrderId,
        WorkOrderTicketNumber = i.WorkOrder?.TicketNumber ?? "",
        TechnicianId = i.TechnicianId,
        TechnicianName = i.Technician != null ? $"{i.Technician.FirstName} {i.Technician.LastName}" : "",
        DiagnosticDetails = i.DiagnosticDetails,
        ActionsTaken = i.ActionsTaken,
        ResultNotes = i.ResultNotes,
        Comment = i.Comment,
        StartedAt = i.StartedAt,
        EndedAt = i.EndedAt,
        DowntimeMinutes = i.DowntimeMinutes
    };
    public async Task<(InterventionDto? Result, string? Error)> ValidateAsync(Guid interventionId, ValidateInterventionRequest request)
    {
        var intervention = await _context.Interventions
            .Include(i => i.WorkOrder)
            .Include(i => i.Technician)
            .FirstOrDefaultAsync(i => i.Id == interventionId);

        if (intervention == null) return (null, "Intervention introuvable.");

        intervention.Comment = string.IsNullOrWhiteSpace(intervention.Comment)
            ? request.Observations
            : $"{intervention.Comment} | Validation : {request.Observations}";
        intervention.EndedAt = request.EndDate;
        intervention.DowntimeMinutes = (int)(request.RealDurationHours * 60);
        intervention.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return (ToDto(intervention), null);
    }
}