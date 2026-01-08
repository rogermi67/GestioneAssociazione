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
        var vapidPublicKey = _configuration["Vapid:PublicKey"];
        var vapidPrivateKey = _configuration["Vapid:PrivateKey"];
        var vapidSubject = _configuration["Vapid:Subject"];

        if (string.IsNullOrEmpty(vapidPublicKey) || string.IsNullOrEmpty(vapidPrivateKey))
        {
            return BadRequest(new ApiResponse<object>(false, null, "VAPID keys non configurate"));
        }

        var subscriptions = await _context.PushSubscriptions.ToListAsync();
        var successCount = 0;
        var failCount = 0;

        var webPushClient = new WebPush.WebPushClient();

        foreach (var sub in subscriptions)
        {
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
                successCount++;
            }
            catch (WebPush.WebPushException ex) when (ex.StatusCode == System.Net.HttpStatusCode.Gone)
            {
                // Subscription scaduta, rimuovila
                _context.PushSubscriptions.Remove(sub);
                failCount++;
            }
            catch
            {
                failCount++;
            }
        }

        await _context.SaveChangesAsync();

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