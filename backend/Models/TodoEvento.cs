namespace AssociazioneETS.API.Models;

public class TodoEvento
{
    public int TodoEventoId { get; set; }
    public int EventoId { get; set; }
    public string Titolo { get; set; } = string.Empty;
    public string? Descrizione { get; set; }
    public DateTime? Scadenza { get; set; }
    public string Stato { get; set; } = "Da fare"; // Da fare, In corso, Completato
    public string? Priorita { get; set; } // Bassa, Media, Alta
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
    
    // Navigation
    public Evento Evento { get; set; } = null!;
    public ICollection<AssegnazioneTodo> Assegnazioni { get; set; } = new List<AssegnazioneTodo>();
}