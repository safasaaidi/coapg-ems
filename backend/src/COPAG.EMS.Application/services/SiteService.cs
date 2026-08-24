using COPAG.EMS.Application.DTOs;
using COPAG.EMS.Domain.Entities;
using COPAG.EMS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace COPAG.EMS.Application.Services;

public class SiteService
{
    private readonly ApplicationDbContext _context;

    public SiteService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<SiteDto>> GetAllAsync()
    {
        return await _context.Sites
            .Select(s => new SiteDto { Id = s.Id, Name = s.Name, Address = s.Address, City = s.City })
            .ToListAsync();
    }

    public async Task<SiteDto> CreateAsync(string name, string address, string city)
    {
        var entity = new Site
        {
            Id = Guid.NewGuid(),
            Name = name,
            Address = address,
            City = city,
            CreatedAt = DateTime.UtcNow
        };

        _context.Sites.Add(entity);
        await _context.SaveChangesAsync();

        return new SiteDto { Id = entity.Id, Name = entity.Name, Address = entity.Address, City = entity.City };
    }
}