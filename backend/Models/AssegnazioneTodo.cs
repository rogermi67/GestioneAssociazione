using System.ComponentModel.DataAnnotations;

namespace AssociazioneETS.API.Models;

public class AssegnazioneTodo
{
    [Key]
    public int AssegnazioneId { get; set; }
    public int TodoEventoId { get; set; }
    public int? SocioId { get; set; }
    public int? CollaboratoreId { get; set; }
    public DateTime AssegnatoIl { get; set; } = DateTime.UtcNow;
    
    // Navigation
    public TodoEvento TodoEvento { get; set; } = null!;
    public Socio? Socio { get; set; }
    public Collaboratore? Collaboratore { get; set; }
}