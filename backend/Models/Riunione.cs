using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AssociazioneETS.API.Models;

[Table("riunioni")]
public class Riunione
{
    [Key]
    [Column("riunione_id")]
    public int RiunioneId { get; set; }

    [Required]
    [Column("data_riunione")]
    public DateTime DataRiunione { get; set; }

    [Required]
    [Column("ora_inizio")]
    public TimeSpan OraInizio { get; set; }

    [Column("ora_fine")]
    public TimeSpan? OraFine { get; set; }

    [Column("luogo")]
    [MaxLength(255)]
    public string? Luogo { get; set; }

    [Required]
    [Column("tipo_riunione")]
    [MaxLength(100)]
    public string TipoRiunione { get; set; } = string.Empty;

    [Column("note")]
    public string? Note { get; set; }

    [Column("verbale")]
    public string? Verbale { get; set; }

    [Column("numero_verbale")]
    [MaxLength(50)]
    public string? NumeroVerbale { get; set; }

    [Required]
    [Column("stato_verbale")]
    [MaxLength(50)]
    public string StatoVerbale { get; set; } = "Bozza";

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; }

    // Navigation Properties
    public ICollection<PartecipazioneRiunione> Partecipazioni { get; set; } = new List<PartecipazioneRiunione>();
    public ICollection<ArgomentoRiunione> Argomenti { get; set; } = new List<ArgomentoRiunione>();
    public ICollection<DeliberaRiunione> Delibere { get; set; } = new List<DeliberaRiunione>();
}