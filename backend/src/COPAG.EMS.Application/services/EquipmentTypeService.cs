using COPAG.EMS.Application.DTOs;
using COPAG.EMS.Domain.Entities;
using COPAG.EMS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace COPAG.EMS.Application.Services;

public class EquipmentTypeService
{
    private readonly ApplicationDbContext _context;

    public EquipmentTypeService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<EquipmentTypeDto>> GetAllAsync()
    {
        return await _context.EquipmentTypes
            .Select(e => new EquipmentTypeDto
            {
                Id = e.Id,
                Name = e.Name,
                Description = e.Description
            })
            .ToListAsync();
    }

    public async Task<EquipmentTypeDto> CreateAsync(string name, string description)
    {
        var entity = new EquipmentType
        {
            Id = Guid.NewGuid(),
            Name = name,
            Description = description,
            CreatedAt = DateTime.UtcNow
        };

        _context.EquipmentTypes.Add(entity);
        await _context.SaveChangesAsync();

        return new EquipmentTypeDto { Id = entity.Id, Name = entity.Name, Description = entity.Description };
    }
}