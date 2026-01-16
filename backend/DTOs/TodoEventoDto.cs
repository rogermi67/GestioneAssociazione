namespace AssociazioneETS.API.DTOs;

public class CreateTodoEventoDto
{
    public int EventoId { get; set; }
    public string Titolo { get; set; } = string.Empty;
    public string? Descrizione { get; set; }
    public DateTime? Scadenza { get; set; }
    public string? Priorita { get; set; }
}

public class UpdateTodoEventoDto
{
    public string Titolo { get; set; } = string.Empty;
    public string? Descrizione { get; set; }
    public DateTime? Scadenza { get; set; }
    public string Stato { get; set; } = "Da fare";
    public string? Priorita { get; set; }
}

public class AssegnaTodoDto
{
    public int TodoEventoId { get; set; }
    public int? SocioId { get; set; }
    public int? CollaboratoreId { get; set; }
}
