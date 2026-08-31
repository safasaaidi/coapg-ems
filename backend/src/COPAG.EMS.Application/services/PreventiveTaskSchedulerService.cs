using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using COPAG.EMS.Application.Services;

namespace COPAG.EMS.Infrastructure.Services;

public class PreventiveTaskSchedulerService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<PreventiveTaskSchedulerService> _logger;

    public PreventiveTaskSchedulerService(IServiceProvider serviceProvider, ILogger<PreventiveTaskSchedulerService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            _logger.LogInformation("Génération automatique des tâches préventives...");
            using (var scope = _serviceProvider.CreateScope())
            {
                var preventiveService = scope.ServiceProvider.GetRequiredService<PreventivePlanService>();
                await preventiveService.GeneratePreventiveTasksAsync();
            }
            await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
        }
    }
}