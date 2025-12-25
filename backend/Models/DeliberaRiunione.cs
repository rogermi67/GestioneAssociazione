using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AssociazioneETS.API.Models;

[Table("delibere_riunioni")]
public class DeliberaRiunione
{
    [Key]
    [Column("delibera_id")]
    public int DeliberaId { get; set; }

    [Required]
    [Column("riunione_id")]
    public int RiunioneId { get; set; }

    [Column("argomento_id")]
    public int? ArgomentoId { get; set; }

    [Required]
    [Column("numero_delibera")]
    [MaxLength(50)]
    public string NumeroDelibera { get; set; } = string.Empty;

    [Required]
    [Column("oggetto")]
    [MaxLength(500)]
    public string Oggetto { get; set; } = string.Empty;

    [Column("testo")]
    public string? Testo { get; set; }

    [Column("esito")]
    [MaxLength(50)]
    public string? Esito { get; set; }

    [Column("voti_favorevoli")]
    public int? VotiFavorevoli { get; set; }

    [Column("voti_contrari")]
    public int? VotiContrari { get; set; }

    [Column("voti_astenuti")]
    public int? VotiAstenuti { get; set; }

    // Navigation Properties
    public Riunione Riunione { get; set; } = null!;
    public ArgomentoRiunione? Argomento { get; set; }
}