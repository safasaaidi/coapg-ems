namespace COPAG.EMS.Application.DTOs;

public class DashboardKpiDto
{
    public int TotalRequests { get; set; }
    public int PendingRequests { get; set; }
    public int InProgressRequests { get; set; }
    public int CompletedRequests { get; set; }
    public int OverdueRequests { get; set; }
    public double MttrHours { get; set; }
    public double MtbfHours { get; set; }
    public double AvailabilityRate { get; set; }
}