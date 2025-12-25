using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AssociazioneETS.API.Models;

[Table("eventi")]
public class Evento
{
    [Key]
    [Column("evento_id")]
    public int EventoId { get; set; }

    [Required]
    [MaxLength(200)]
    [Column("titolo")]
    public string Titolo { get; set; } = string.Empty;

    [Column("descrizione")]
    public string? Descrizione { get; set; }

    [Required]
    [Column("data_inizio")]
    public DateTime DataInizio { get; set; }

    [Column("data_fine")]
    public DateTime? DataFine { get; set; }

    [MaxLength(200)]
    [Column("luogo")]
    public string? Luogo { get; set; }

    [MaxLength(50)]
    [Column("tipo_evento")]
    public string TipoEvento { get; set; } = "Evento"; // Evento, Festa, Rievocazione, Corso

    [MaxLength(20)]
    [Column("stato")]
    public string Stato { get; set; } = "Pianificato"; // Pianificato, In corso, Concluso, Annullato

    [Column("budget", TypeName = "decimal(10,2)")]
public decimal? Budget { get; set; }

[Column("spese_effettive", TypeName = "decimal(10,2)")]
public decimal? SpeseEffettive { get; set; }

[Column("incassi", TypeName = "decimal(10,2)")]
public decimal? Incassi { get; set; }

    [Column("note")]
    public string? Note { get; set; }

    [Column("immagine_url")]
    public string? ImmagineUrl { get; set; }

    [Column("pubblicato")]
    public bool Pubblicato { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual ICollection<PartecipazioneEvento> Partecipazioni { get; set; } = new List<PartecipazioneEvento>();

    [NotMapped]
    public int NumeroPartecipanti => Partecipazioni.Count;

    [NotMapped]
    public decimal? SaldoFinale => (Incassi ?? 0) - (SpeseEffettive ?? 0);

    [NotMapped]
    public bool IsInCorso => 
        DataInizio <= DateTime.Now && 
        (DataFine == null || DataFine >= DateTime.Now);

    [NotMapped]
    public bool IsTerminato => 
        DataFine != null && DataFine < DateTime.Now;
}

[Table("partecipazioni_eventi")]
public class PartecipazioneEvento
{
    [Key]
    [Column("partecipazione_evento_id")]
    public int PartecipazioneEventoId { get; set; }

    [Column("evento_id")]
    public int EventoId { get; set; }

    [Column("socio_id")]
    public int SocioId { get; set; }

    [MaxLength(50)]
    [Column("ruolo")]
    public string? Ruolo { get; set; } // Organizzatore, Volontario, Partecipante

    [Column("note")]
    public string? Note { get; set; }

    [Column("data_iscrizione")]
    public DateTime DataIscrizione { get; set; } = DateTime.UtcNow;

    [Column("confermato")]
    public bool Confermato { get; set; } = true;

    // Navigation properties
    public virtual Evento Evento { get; set; } = null!;
    public virtual Socio Socio { get; set; } = null!;
}
