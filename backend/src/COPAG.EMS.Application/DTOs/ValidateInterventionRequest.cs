namespace COPAG.EMS.Application.DTOs
{
    public class ValidateInterventionRequest
    {
        public string Observations { get; set; } = string.Empty;
        public double RealDurationHours { get; set; }
        public DateTime EndDate { get; set; } = DateTime.UtcNow;
    }
}