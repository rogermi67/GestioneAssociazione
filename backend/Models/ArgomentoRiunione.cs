using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AssociazioneETS.API.Models;

[Table("argomenti_riunione")]
public class ArgomentoRiunione
{
    [Key]
    [Column("argomento_id")]
    public int ArgomentoId { get; set; }

    [Required]
    [Column("riunione_id")]
    public int RiunioneId { get; set; }

    [Required]
    [Column("titolo")]
    [MaxLength(255)]
    public string Titolo { get; set; } = string.Empty;

    [Column("descrizione")]
    public string? Descrizione { get; set; }

    [Required]
    [Column("ordine")]
    public int Ordine { get; set; }

    // Navigation Properties
    public Riunione Riunione { get; set; } = null!;
    public ICollection<DeliberaRiunione> Delibere { get; set; } = new List<DeliberaRiunione>();
}