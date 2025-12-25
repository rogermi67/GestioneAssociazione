using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AssociazioneETS.API.Models;

[Table("users")]
public class User
{
    [Key]
    [Column("user_id")]
    public int UserId { get; set; }

    [Required]
    [MaxLength(100)]
    [Column("username")]
    public string Username { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    [Column("email")]
    public string Email { get; set; } = string.Empty;

    [Required]
    [Column("password_hash")]
    public string PasswordHash { get; set; } = string.Empty;

    [MaxLength(100)]
    [Column("nome")]
    public string? Nome { get; set; }

    [MaxLength(100)]
    [Column("cognome")]
    public string? Cognome { get; set; }

    [Column("socio_id")]
    public int? SocioId { get; set; }

    [MaxLength(20)]
    [Column("ruolo")]
    public string Ruolo { get; set; } = "Utente"; // Admin, Segretario, Utente

    [Column("attivo")]
    public bool Attivo { get; set; } = true;

    [Column("ultimo_accesso")]
    public DateTime? UltimoAccesso { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    public virtual Socio? Socio { get; set; }

    [NotMapped]
    public string NomeCompleto => $"{Nome} {Cognome}".Trim();

    [NotMapped]
    public bool IsAdmin => Ruolo == "Admin";

    [NotMapped]
    public bool IsSegretario => Ruolo == "Segretario" || Ruolo == "Admin";
}

[Table("notifiche")]
public class Notifica
{
    [Key]
    [Column("notifica_id")]
    public int NotificaId { get; set; }

    [Column("user_id")]
    public int UserId { get; set; }

    [Required]
    [MaxLength(50)]
    [Column("tipo_notifica")]
    public string TipoNotifica { get; set; } = string.Empty; // Riunione, Evento, Scadenza, Sistema

    [Required]
    [MaxLength(200)]
    [Column("titolo")]
    public string Titolo { get; set; } = string.Empty;

    [Required]
    [Column("messaggio")]
    public string Messaggio { get; set; } = string.Empty;

    [Column("link")]
    public string? Link { get; set; }

    [Column("letta")]
    public bool Letta { get; set; }

    [Column("data_lettura")]
    public DateTime? DataLettura { get; set; }

    [Column("data_invio")]
    public DateTime DataInvio { get; set; } = DateTime.UtcNow;

    [Column("data_scadenza")]
    public DateTime? DataScadenza { get; set; }

    // Metadata per reference
    [Column("riferimento_id")]
    public int? RiferimentoId { get; set; }

    [MaxLength(50)]
    [Column("riferimento_tipo")]
    public string? RiferimentoTipo { get; set; } // Riunione, Evento, Socio

    // Navigation property
    public virtual User User { get; set; } = null!;

    [NotMapped]
    public bool IsScaduta => DataScadenza.HasValue && DataScadenza < DateTime.UtcNow;
}

[Table("impostazioni")]
public class Impostazione
{
    [Key]
    [MaxLength(100)]
    [Column("chiave")]
    public string Chiave { get; set; } = string.Empty;

    [Column("valore")]
    public string? Valore { get; set; }

    [MaxLength(200)]
    [Column("descrizione")]
    public string? Descrizione { get; set; }

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}