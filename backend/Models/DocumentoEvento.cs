namespace AssociazioneETS.API.Models;

public class DocumentoEvento
{
    public int DocumentoEventoId { get; set; }
    public int EventoId { get; set; }
    public string NomeFile { get; set; } = string.Empty;
    public string TipoFile { get; set; } = string.Empty; // image/jpeg, application/pdf, etc
    public string PathFile { get; set; } = string.Empty;
    public long Dimensione { get; set; }
    public int? UploadedBy { get; set; }
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation
    public Evento Evento { get; set; } = null!;
}