namespace AssociazioneETS.API.DTOs;

public class UploadDocumentoDto
{
    public int EventoId { get; set; }
    public string NomeFile { get; set; } = string.Empty;
    public string TipoFile { get; set; } = string.Empty;
    public string Base64Content { get; set; } = string.Empty;
}