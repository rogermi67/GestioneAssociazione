using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AssociazioneETS.API.Data;

namespace AssociazioneETS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SetupController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public SetupController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpPost("create-push-table")]
    public async Task<IActionResult> CreatePushTable()
    {
        try
        {
            var sql = @"
                CREATE TABLE IF NOT EXISTS push_subscriptions (
                    subscription_id SERIAL PRIMARY KEY,
                    user_id INTEGER NOT NULL,
                    endpoint VARCHAR(500) NOT NULL,
                    p256dh VARCHAR(100) NOT NULL,
                    auth VARCHAR(100) NOT NULL,
                    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                    CONSTRAINT fk_push_subscriptions_users 
                        FOREIGN KEY (user_id) 
                        REFERENCES users(user_id) 
                        ON DELETE CASCADE
                );
                
                CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id 
                    ON push_subscriptions(user_id);
            ";

            await _context.Database.ExecuteSqlRawAsync(sql);

            return Ok(new { success = true, message = "Tabella push_subscriptions creata con successo!" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    [HttpGet("check-subscriptions")]  // <-- AGGIUNGI QUI
    public async Task<IActionResult> CheckSubscriptions()
    {
        var subscriptions = await _context.PushSubscriptions.ToListAsync();
        return Ok(new { 
            count = subscriptions.Count,
            subscriptions = subscriptions.Select(s => new {
                s.SubscriptionId,
                s.UserId,
                Endpoint = s.Endpoint.Substring(0, Math.Min(50, s.Endpoint.Length)) + "..."
            })
        });
    }
}  // <-- Chiusura classe