using COPAG.EMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace COPAG.EMS.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) 
        : base(options)
    {
    }

    // --- Toutes les entités ---
    public DbSet<Equipment> Equipments => Set<Equipment>();
    public DbSet<WorkOrder> WorkOrders => Set<WorkOrder>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Site> Sites => Set<Site>();
    public DbSet<Department> Departments => Set<Department>();
    public DbSet<EquipmentType> EquipmentTypes => Set<EquipmentType>();
    public DbSet<Intervention> Interventions => Set<Intervention>();
    public DbSet<StatusHistory> StatusHistories => Set<StatusHistory>();
    public DbSet<PreventivePlan> PreventivePlans => Set<PreventivePlan>();
    public DbSet<PreventiveTask> PreventiveTasks => Set<PreventiveTask>();
    public DbSet<Attachment> Attachments => Set<Attachment>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // --- Soft Delete (RG-08) sur toutes les entités ---
        modelBuilder.Entity<Equipment>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<WorkOrder>().HasQueryFilter(w => !w.IsDeleted);
        modelBuilder.Entity<User>().HasQueryFilter(u => !u.IsDeleted);
        modelBuilder.Entity<Site>().HasQueryFilter(s => !s.IsDeleted);
        modelBuilder.Entity<Department>().HasQueryFilter(d => !d.IsDeleted);
        modelBuilder.Entity<EquipmentType>().HasQueryFilter(t => !t.IsDeleted);
        modelBuilder.Entity<Intervention>().HasQueryFilter(i => !i.IsDeleted);
        modelBuilder.Entity<StatusHistory>().HasQueryFilter(h => !h.IsDeleted);
        modelBuilder.Entity<PreventivePlan>().HasQueryFilter(p => !p.IsDeleted);
        modelBuilder.Entity<PreventiveTask>().HasQueryFilter(t => !t.IsDeleted);
        modelBuilder.Entity<Attachment>().HasQueryFilter(a => !a.IsDeleted);
        modelBuilder.Entity<AuditLog>().HasQueryFilter(l => !l.IsDeleted);

        // --- Relations déjà vues (Site, Department, Equipment, WorkOrder, Intervention, StatusHistory) ---
        modelBuilder.Entity<Department>()
            .HasOne(d => d.Site).WithMany(s => s.Departments)
            .HasForeignKey(d => d.SiteId).OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Equipment>()
            .HasOne(e => e.Department).WithMany()
            .HasForeignKey(e => e.DepartmentId).OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Equipment>()
            .HasOne(e => e.EquipmentType).WithMany()
            .HasForeignKey(e => e.EquipmentTypeId).OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Equipment>()
            .HasOne(e => e.ResponsibleUser).WithMany()
            .HasForeignKey(e => e.ResponsibleUserId).OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<WorkOrder>()
            .HasOne(w => w.Equipment).WithMany(e => e.WorkOrders)
            .HasForeignKey(w => w.EquipmentId).OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<WorkOrder>()
            .HasOne(w => w.Requester).WithMany()
            .HasForeignKey(w => w.RequesterId).OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<WorkOrder>()
            .HasOne(w => w.AssignedTechnician).WithMany()
            .HasForeignKey(w => w.AssignedTechnicianId).OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Intervention>()
            .HasOne(i => i.WorkOrder).WithMany(w => w.Interventions)
            .HasForeignKey(i => i.WorkOrderId).OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Intervention>()
            .HasOne(i => i.Technician).WithMany()
            .HasForeignKey(i => i.TechnicianId).OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<StatusHistory>()
            .HasOne(h => h.WorkOrder).WithMany()
            .HasForeignKey(h => h.WorkOrderId).OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<StatusHistory>()
            .HasOne(h => h.ChangedByUser).WithMany()
            .HasForeignKey(h => h.ChangedByUserId).OnDelete(DeleteBehavior.Restrict);

        // --- Nouvelles relations : Preventive ---
        modelBuilder.Entity<PreventivePlan>()
            .HasOne(p => p.Equipment).WithMany()
            .HasForeignKey(p => p.EquipmentId).OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<PreventiveTask>()
            .HasOne(t => t.PreventivePlan).WithMany(p => p.Tasks)
            .HasForeignKey(t => t.PreventivePlanId).OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<PreventiveTask>()
            .HasOne(t => t.AssignedTechnician).WithMany()
            .HasForeignKey(t => t.AssignedTechnicianId).OnDelete(DeleteBehavior.Restrict);

        // --- Attachment et AuditLog : SEULEMENT la relation vers User (classique) ---
        // Pas de HasOne/WithMany sur EntityType/EntityId — comme expliqué juste avant
        modelBuilder.Entity<Attachment>()
            .HasOne(a => a.UploadedByUser).WithMany()
            .HasForeignKey(a => a.UploadedByUserId).OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<AuditLog>()
            .HasOne(l => l.PerformedByUser).WithMany()
            .HasForeignKey(l => l.PerformedByUserId).OnDelete(DeleteBehavior.Restrict);
        // --- Contraintes d'unicité (CDC section 8.2) ---
        modelBuilder.Entity<Equipment>().HasIndex(e => e.Code).IsUnique();
        modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();
        modelBuilder.Entity<WorkOrder>().HasIndex(w => w.TicketNumber).IsUnique();
    
        modelBuilder.Entity<Equipment>()
            .Property(e => e.Value)
            .HasPrecision(18, 2); // 18 chiffres au total, dont 2 après la virgule}
}
}