using COPAG.EMS.Application.DTOs;
using COPAG.EMS.Domain.Entities;
using COPAG.EMS.Domain.Enums;
using COPAG.EMS.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace COPAG.EMS.Application.Services;

public class UserService
{
    private readonly ApplicationDbContext _context;
    private readonly PasswordHasher<User> _passwordHasher = new();

    public UserService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<UserDto>> GetAllAsync()
    {
        return await _context.Users
            .Select(u => new UserDto
            {
                Id = u.Id,
                FirstName = u.FirstName,
                LastName = u.LastName,
                Email = u.Email,
                Role = u.Role.ToString()
            })
            .ToListAsync();
    }

    public async Task<UserDto> CreateAsync(string firstName, string lastName, string email, string password, UserRole role)
    {
        var entity = new User
        {
            Id = Guid.NewGuid(),
            FirstName = firstName,
            LastName = lastName,
            Email = email,
            Role = role,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        entity.PasswordHash = _passwordHasher.HashPassword(entity, password);

        _context.Users.Add(entity);
        await _context.SaveChangesAsync();

        return new UserDto { Id = entity.Id, FirstName = entity.FirstName, LastName = entity.LastName, Email = entity.Email, Role = entity.Role.ToString() };
    }
}