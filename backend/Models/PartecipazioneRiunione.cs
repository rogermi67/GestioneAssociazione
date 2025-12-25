using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AssociazioneETS.API.Models;

[Table("partecipazioni_riunioni")]
public class PartecipazioneRiunione
{
    [Key]
    [Column("partecipazione_id")]
    public int PartecipazioneId { get; set; }

    [Required]
    [Column("riunione_id")]
    public int RiunioneId { get; set; }

    [Required]
    [Column("socio_id")]
    public int SocioId { get; set; }

    [Required]
    [Column("presente")]
    public bool Presente { get; set; }

    [Column("ruolo")]
    [MaxLength(100)]
    public string? Ruolo { get; set; }

    // Navigation Properties
    public Riunione Riunione { get; set; } = null!;
    public Socio Socio { get; set; } = null!;
}