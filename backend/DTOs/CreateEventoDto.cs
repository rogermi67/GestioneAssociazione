namespace AssociazioneETS.API.DTOs;

public class CreateEventoDto
{
    public string Titolo { get; set; } = string.Empty;
    public string? Descrizione { get; set; }
    public DateTime DataInizio { get; set; }
    public DateTime? DataFine { get; set; }
    public string? Luogo { get; set; }
    public string TipoEvento { get; set; } = "Evento";
    public string Stato { get; set; } = "Pianificato";
    public decimal? Budget { get; set; }
    public string? Note { get; set; }
    public bool Pubblicato { get; set; }
}

public class UpdateEventoDto
{
    public string Titolo { get; set; } = string.Empty;
    public string? Descrizione { get; set; }
    public DateTime DataInizio { get; set; }
    public DateTime? DataFine { get; set; }
    public string? Luogo { get; set; }
    public string TipoEvento { get; set; } = "Evento";
    public string Stato { get; set; } = "Pianificato";
    public decimal? Budget { get; set; }
    public string? Note { get; set; }
    public bool Pubblicato { get; set; }
}

public class AggiungiPartecinanteEventoDto
{
    public string? Ruolo { get; set; }
}
