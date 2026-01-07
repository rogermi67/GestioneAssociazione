using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AssociazioneETS.API.Models;

[Table("push_subscriptions")]
public class PushSubscription
{
    [Key]
    [Column("subscription_id")]
    public int SubscriptionId { get; set; }

    [Column("user_id")]
    public int UserId { get; set; }

    [Column("endpoint")]
    [Required]
    [MaxLength(500)]
    public string Endpoint { get; set; } = string.Empty;

    [Column("p256dh")]
    [Required]
    [MaxLength(100)]
    public string P256dh { get; set; } = string.Empty;

    [Column("auth")]
    [Required]
    [MaxLength(100)]
    public string Auth { get; set; } = string.Empty;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public User? User { get; set; }
}