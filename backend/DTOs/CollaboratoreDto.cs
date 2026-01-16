namespace AssociazioneETS.API.DTOs;

public class CreateCollaboratoreDto
{
    public string Nome { get; set; } = string.Empty;
    public string Cognome { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Telefono { get; set; }
    public string? Azienda { get; set; }
    public string? Note { get; set; }
}

public class UpdateCollaboratoreDto
{
    public string Nome { get; set; } = string.Empty;
    public string Cognome { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Telefono { get; set; }
    public string? Azienda { get; set; }
    public string? Note { get; set; }
}