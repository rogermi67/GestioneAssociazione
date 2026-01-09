using Microsoft.AspNetCore.Mvc;
using Npgsql;

namespace AssociazioneETS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SetupController : ControllerBase
{
    private readonly IConfiguration _configuration;

    public SetupController(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    [HttpPost("create-push-table")]
    public async Task<IActionResult> CreatePushTable()
    {
        var connectionString = _configuration.GetConnectionString("DefaultConnection");
        
        try
        {
            await using var connection = new NpgsqlConnection(connectionString);
            await connection.OpenAsync();

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

            await using var command = new NpgsqlCommand(sql, connection);
            await command.ExecuteNonQueryAsync();

            return Ok(new { success = true, message = "Tabella push_subscriptions creata con successo!" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }
}