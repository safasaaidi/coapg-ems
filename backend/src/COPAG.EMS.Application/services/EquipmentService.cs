using COPAG.EMS.Application.DTOs;
using COPAG.EMS.Domain.Entities;
using COPAG.EMS.Domain.Enums;
using COPAG.EMS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace COPAG.EMS.Application.Services;

public class EquipmentService
{
    private readonly ApplicationDbContext _context;

    public EquipmentService(ApplicationDbContext context)
    {
        _context = context;
    }

    // EF-05 : recherche/filtrage
    public async Task<List<EquipmentDto>> GetAllAsync(EquipmentFilterRequest? filter = null)
    {
        var query = _context.Equipments
            .Include(e => e.Department)
            .Include(e => e.EquipmentType)
            .AsQueryable();

        if (filter?.DepartmentId != null)
            query = query.Where(e => e.DepartmentId == filter.DepartmentId);

        if (!string.IsNullOrEmpty(filter?.Status) && Enum.TryParse<EquipmentStatus>(filter.Status, out var statusEnum))
            query = query.Where(e => e.Status == statusEnum);

        if (!string.IsNullOrEmpty(filter?.Criticality) && Enum.TryParse<PriorityLevel>(filter.Criticality, out var critEnum))
            query = query.Where(e => e.Criticality == critEnum);

        return await query.Select(e => ToDto(e)).ToListAsync();
    }

    // EF-04 : consulter une fiche précise
    public async Task<EquipmentDto?> GetByIdAsync(Guid id)
    {
        var entity = await _context.Equipments
            .Include(e => e.Department)
            .Include(e => e.EquipmentType)
            .FirstOrDefaultAsync(e => e.Id == id);

        return entity == null ? null : ToDto(entity);
    }

    public async Task<(EquipmentDto? Result, string? Error)> CreateAsync(CreateEquipmentRequest request)
    {
        // Validation métier : vérifier que Department et EquipmentType existent (RG-03, même logique)
        var departmentExists = await _context.Departments.AnyAsync(d => d.Id == request.DepartmentId);
        if (!departmentExists) return (null, "Le département spécifié n'existe pas.");

        var typeExists = await _context.EquipmentTypes.AnyAsync(t => t.Id == request.EquipmentTypeId);
        if (!typeExists) return (null, "Le type d'équipement spécifié n'existe pas.");

        var codeExists = await _context.Equipments.AnyAsync(e => e.Code == request.Code);
        if (codeExists) return (null, "Ce code équipement existe déjà.");

        var entity = new Equipment
        {
            Id = Guid.NewGuid(),
            Code = request.Code,
            Name = request.Name,
            Type = request.Type,
            Brand = request.Brand,
            Model = request.Model,
            SerialNumber = request.SerialNumber,
            Location = request.Location,
            DepartmentId = request.DepartmentId,
            EquipmentTypeId = request.EquipmentTypeId,
            Criticality = (PriorityLevel)request.Criticality,
            Status = EquipmentStatus.Operational,
            InstallationDate = request.InstallationDate,
            CreatedAt = DateTime.UtcNow
        };

        _context.Equipments.Add(entity);
        await _context.SaveChangesAsync();

        await _context.Entry(entity).Reference(e => e.Department).LoadAsync();
        await _context.Entry(entity).Reference(e => e.EquipmentType).LoadAsync();

        return (ToDto(entity), null);
    }

    private static EquipmentDto ToDto(Equipment e) => new()
    {
        Id = e.Id,
        Code = e.Code,
        Name = e.Name,
        Type = e.Type,
        Brand = e.Brand,
        Model = e.Model,
        SerialNumber = e.SerialNumber,
        Location = e.Location,
        DepartmentId = e.DepartmentId,
        DepartmentName = e.Department?.Name ?? "",
        EquipmentTypeId = e.EquipmentTypeId,
        EquipmentTypeName = e.EquipmentType?.Name ?? "",
        Status = e.Status.ToString(),
        Criticality = e.Criticality.ToString(),
        InstallationDate = e.InstallationDate
    };
}