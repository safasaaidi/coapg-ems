using System.Text;

namespace COPAG.EMS.Application.Services;

public class CsvExportService
{
    public byte[] ExportToCsv<T>(IEnumerable<T> items)
    {
        var sb = new StringBuilder();
        var properties = typeof(T).GetProperties();

        // En-têtes CSV
        sb.AppendLine(string.Join(",", properties.Select(p => $"\"{p.Name}\"")));

        // Lignes de données
        foreach (var item in items)
        {
            var values = properties.Select(p =>
            {
                var val = p.GetValue(item, null)?.ToString() ?? "";
                return $"\"{val.Replace("\"", "\"\"")}\"";
            });
            sb.AppendLine(string.Join(",", values));
        }

        return Encoding.UTF8.GetPreamble().Concat(Encoding.UTF8.GetBytes(sb.ToString())).ToArray();    }
}