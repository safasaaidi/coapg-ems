using COPAG.EMS.Application.DTOs;
using COPAG.EMS.Domain.Entities;
using COPAG.EMS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace COPAG.EMS.Application.Services;

public class DepartmentService
{
    private readonly ApplicationDbContext _context;

    public DepartmentService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<DepartmentDto>> GetAllAsync()
    {
        return await _context.Departments
            .Select(d => new DepartmentDto { Id = d.Id, Name = d.Name, SiteId = d.SiteId })
            .ToListAsync();
    }

    public async Task<DepartmentDto> CreateAsync(string name, Guid siteId)
    {
        var entity = new Department
        {
            Id = Guid.NewGuid(),
            Name = name,
            SiteId = siteId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Departments.Add(entity);
        await _context.SaveChangesAsync();

        return new DepartmentDto { Id = entity.Id, Name = entity.Name, SiteId = entity.SiteId };
    }
}