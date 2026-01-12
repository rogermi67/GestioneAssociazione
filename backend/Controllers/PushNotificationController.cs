using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using AssociazioneETS.API.Data;
using AssociazioneETS.API.DTOs;
using AssociazioneETS.API.Models;

namespace AssociazioneETS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PushNotificationController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;

    public PushNotificationController(ApplicationDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    [HttpPost("subscribe")]
    public async Task<ActionResult<ApiResponse<object>>> Subscribe([FromBody] PushSubscriptionDto dto)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim))
        {
            return Unauthorized(new ApiResponse<object>(false, null, "Non autorizzato"));
        }

        var userId = int.Parse(userIdClaim);

        // Rimuovi vecchie subscription dello stesso endpoint
        var existing = await _context.PushSubscriptions
            .Where(s => s.Endpoint == dto.Endpoint)
            .ToListAsync();
        
        _context.PushSubscriptions.RemoveRange(existing);

        // Aggiungi nuova subscription
        var subscription = new PushSubscription
        {
            UserId = userId,
            Endpoint = dto.Endpoint,
            P256dh = dto.P256dh,
            Auth = dto.Auth,
            CreatedAt = DateTime.UtcNow
        };

        _context.PushSubscriptions.Add(subscription);
        await _context.SaveChangesAsync();

        return Ok(new ApiResponse<object>(true, null, "Subscription registrata"));
    }

    [HttpPost("send")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<object>>> SendNotification([FromBody] SendPushNotificationDto dto)
    {
        Console.WriteLine("🔔 SendNotification API called!");
        Console.WriteLine($"📧 Title: {dto.Title}, Body: {dto.Body}");

        var vapidPublicKey = _configuration["Vapid:PublicKey"];
        var vapidPrivateKey = _configuration["Vapid:PrivateKey"];
        var vapidSubject = _configuration["Vapid:Subject"];

        if (string.IsNullOrEmpty(vapidPublicKey) || string.IsNullOrEmpty(vapidPrivateKey))
        {
            Console.WriteLine("❌ VAPID keys non configurate!");
            return BadRequest(new ApiResponse<object>(false, null, "VAPID keys non configurate"));
        }

        var subscriptions = await _context.PushSubscriptions.ToListAsync();
        Console.WriteLine($"📊 Found {subscriptions.Count} subscriptions");

        var successCount = 0;
        var failCount = 0;

        var webPushClient = new WebPush.WebPushClient();

        foreach (var sub in subscriptions)
        {
            Console.WriteLine($"🔔 Sending to subscription #{sub.SubscriptionId} (User #{sub.UserId})...");
            try
            {
                var pushSubscription = new WebPush.PushSubscription(
                    sub.Endpoint,
                    sub.P256dh,
                    sub.Auth
                );

                var vapidDetails = new WebPush.VapidDetails(
                    vapidSubject ?? "mailto:info@associazione.it",
                    vapidPublicKey,
                    vapidPrivateKey
                );

                var payload = System.Text.Json.JsonSerializer.Serialize(new
                {
                    title = dto.Title,
                    body = dto.Body,
                    icon = dto.Icon ?? "/pwa-192x192.png",
                    url = dto.Url
                });

                await webPushClient.SendNotificationAsync(pushSubscription, payload, vapidDetails);
                Console.WriteLine($"✅ Sent successfully to subscription #{sub.SubscriptionId}");
                successCount++;
            }
            catch (WebPush.WebPushException ex) when (ex.StatusCode == System.Net.HttpStatusCode.Gone)
            {
                Console.WriteLine($"⚠️ Subscription #{sub.SubscriptionId} expired (HTTP 410 Gone), removing...");
                // Subscription scaduta, rimuovila
                _context.PushSubscriptions.Remove(sub);
                failCount++;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error sending to subscription #{sub.SubscriptionId}: {ex.Message}");
                failCount++;
            }
        }

        await _context.SaveChangesAsync();

        Console.WriteLine($"📊 Summary: {successCount} successes, {failCount} failures");

        return Ok(new ApiResponse<object>(
            true,
            new { successCount, failCount },
            $"Notifiche inviate: {successCount} successi, {failCount} fallimenti"
        ));
    }

    [HttpDelete("unsubscribe")]
    public async Task<ActionResult<ApiResponse<object>>> Unsubscribe()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim))
        {
            return Unauthorized(new ApiResponse<object>(false, null, "Non autorizzato"));
        }

        var userId = int.Parse(userIdClaim);

        var subscriptions = await _context.PushSubscriptions
            .Where(s => s.UserId == userId)
            .ToListAsync();

        _context.PushSubscriptions.RemoveRange(subscriptions);
        await _context.SaveChangesAsync();

        return Ok(new ApiResponse<object>(true, null, "Subscription rimossa"));
    }
}