using COPAG.EMS.Application.DTOs;
using COPAG.EMS.Domain.Entities;
using COPAG.EMS.Domain.Enums;
using COPAG.EMS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace COPAG.EMS.Application.Services;

public class PreventivePlanService
{
    private readonly ApplicationDbContext _context;

    public PreventivePlanService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<PreventivePlanDto>> GetAllAsync()
    {
        return await _context.PreventivePlans
            .Include(p => p.Equipment)
            .Select(p => ToDto(p))
            .ToListAsync();
    }

    public async Task<(PreventivePlanDto? Result, string? Error)> CreateAsync(CreatePreventivePlanRequest request)
    {
        var equipmentExists = await _context.Equipments.AnyAsync(e => e.Id == request.EquipmentId);
        if (!equipmentExists) return (null, "Équipement introuvable.");

        var entity = new PreventivePlan
        {
            Id = Guid.NewGuid(),
            EquipmentId = request.EquipmentId,
            Name = request.Name,
            Checklist = request.Checklist,
            FrequencyInDays = request.FrequencyInDays,
            EstimatedDurationMinutes = request.EstimatedDurationMinutes,
            NextDueDate = request.NextDueDate,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.PreventivePlans.Add(entity);
        await _context.SaveChangesAsync();
        await _context.Entry(entity).Reference(p => p.Equipment).LoadAsync();

        return (ToDto(entity), null);
    }

    private static PreventivePlanDto ToDto(PreventivePlan p) => new()
    {
        Id = p.Id,
        EquipmentId = p.EquipmentId,
        EquipmentName = p.Equipment?.Name ?? "",
        Name = p.Name,
        Checklist = p.Checklist,
        FrequencyInDays = p.FrequencyInDays,
        NextDueDate = p.NextDueDate,
        IsActive = p.IsActive
    };

    public async Task<int> GeneratePreventiveTasksAsync()
    {
        var activePlans = await _context.PreventivePlans
            .Where(p => p.IsActive && p.NextDueDate <= DateTime.UtcNow)
            .ToListAsync();

        var count = 0;
        foreach (var plan in activePlans)
        {
            var task = new PreventiveTask
            {
                Id = Guid.NewGuid(),
                PreventivePlanId = plan.Id,
                DueDate = plan.NextDueDate,
                Status = WorkOrderStatus.New,
                CreatedAt = DateTime.UtcNow
            };

            _context.PreventiveTasks.Add(task);
            plan.NextDueDate = plan.NextDueDate.AddDays(Math.Max(1, plan.FrequencyInDays));
            count++;
        }

        if (count > 0) await _context.SaveChangesAsync();
        return count;
    }
    public async Task<List<object>> GetUpcomingTasksAsync()
{
    return await _context.PreventiveTasks
        .Include(t => t.PreventivePlan)
        .ThenInclude(p => p!.Equipment)
        .Where(t => t.Status != Domain.Enums.WorkOrderStatus.Completed)
        .OrderBy(t => t.DueDate)
        .Select(t => new
        {
            t.Id,
            t.DueDate,
            PlanName = t.PreventivePlan!.Name,
            EquipmentName = t.PreventivePlan.Equipment!.Name,
            Status = t.Status.ToString()
        })
        .ToListAsync<object>();
}
}