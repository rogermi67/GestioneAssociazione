using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AssociazioneETS.API.Models;

[Table("soci")]
public class Socio
{
    [Key]
    [Column("socio_id")]
    public int SocioId { get; set; }

    [Required]
    [MaxLength(100)]
    [Column("nome")]
    public string Nome { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    [Column("cognome")]
    public string Cognome { get; set; } = string.Empty;

    [Required]
    [MaxLength(16)]
    [Column("codice_fiscale")]
    public string CodiceFiscale { get; set; } = string.Empty;

    [Column("data_nascita")]
    public DateTime DataNascita { get; set; }

    [MaxLength(200)]
    [Column("indirizzo")]
    public string? Indirizzo { get; set; }

    [MaxLength(20)]
    [Column("telefono")]
    public string? Telefono { get; set; }

    [MaxLength(100)]
    [Column("email")]
    public string? Email { get; set; }

    [Column("data_iscrizione")]
    public DateTime DataIscrizione { get; set; } = DateTime.UtcNow;

    [Column("carica_id")]
    public int? CaricaId { get; set; }

    [MaxLength(20)]
    [Column("stato_socio")]
    public string StatoSocio { get; set; } = "Attivo";

    [Column("data_cessazione")]
    public DateTime? DataCessazione { get; set; }

    [Column("note")]
    public string? Note { get; set; }

    [Column("foto_url")]
    public string? FotoUrl { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public virtual Carica? Carica { get; set; }
    public virtual ICollection<Documento> Documenti { get; set; } = new List<Documento>();
    public virtual ICollection<SocioCarica> SociCariche { get; set; } = new List<SocioCarica>();
    public virtual ICollection<PartecipazioneRiunione> PartecipazioniRiunioni { get; set; } = new List<PartecipazioneRiunione>();
    public virtual ICollection<PartecipazioneEvento> PartecipazioniEventi { get; set; } = new List<PartecipazioneEvento>();

    [NotMapped]
    public string NomeCompleto => $"{Nome} {Cognome}";

    [NotMapped]
    public int Eta => DateTime.Now.Year - DataNascita.Year - (DateTime.Now.DayOfYear < DataNascita.DayOfYear ? 1 : 0);
	
	
}

[Table("documenti")]
public class Documento
{
    [Key]
    [Column("documento_id")]
    public int DocumentoId { get; set; }

    [Column("socio_id")]
    public int SocioId { get; set; }

    [Required]
    [MaxLength(50)]
    [Column("tipo_documento")]
    public string TipoDocumento { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    [Column("nome_file")]
    public string NomeFile { get; set; } = string.Empty;

    [Required]
    [Column("path_file")]
    public string PathFile { get; set; } = string.Empty;

    [Column("data_caricamento")]
    public DateTime DataCaricamento { get; set; } = DateTime.UtcNow;

    [Column("data_scadenza")]
    public DateTime? DataScadenza { get; set; }

    public virtual Socio Socio { get; set; } = null!;
}

[Table("cariche")]
public class Carica
{
    [Key]
    [Column("carica_id")]
    public int CaricaId { get; set; }

    [Required]
    [MaxLength(100)]
    [Column("nome")]
    public string Nome { get; set; } = string.Empty;

    [Column("descrizione")]
    public string? Descrizione { get; set; }

    [Column("ordine")]
    public int Ordine { get; set; }

    public virtual ICollection<SocioCarica> SociCariche { get; set; } = new List<SocioCarica>();
    public virtual ICollection<Socio> Soci { get; set; } = new List<Socio>();
}

[Table("soci_cariche")]
public class SocioCarica
{
    [Key]
    [Column("socio_carica_id")]
    public int SocioCaricaId { get; set; }

    [Column("socio_id")]
    public int SocioId { get; set; }

    [Column("carica_id")]
    public int CaricaId { get; set; }

    [Column("data_inizio")]
    public DateTime DataInizio { get; set; }

    [Column("data_fine")]
    public DateTime? DataFine { get; set; }

    [Column("note")]
    public string? Note { get; set; }

    public virtual Socio Socio { get; set; } = null!;
    public virtual Carica Carica { get; set; } = null!;

    [NotMapped]
    public bool IsAttiva => DataFine == null || DataFine > DateTime.Now;
}
