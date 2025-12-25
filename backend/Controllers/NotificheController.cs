using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AssociazioneETS.API.Data;
using AssociazioneETS.API.DTOs;
using AssociazioneETS.API.Services;

namespace AssociazioneETS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificheController : ControllerBase
{
    private readonly IEmailService _emailService;
    private readonly ApplicationDbContext _context;

    public NotificheController(IEmailService emailService, ApplicationDbContext context)
    {
        _emailService = emailService;
        _context = context;
    }

    [HttpGet("test-connection")]
    public async Task<ActionResult<ApiResponse<object>>> TestConnection()
    {
        try
        {
            var result = await _emailService.TestConnectionAsync();
            
            if (result)
            {
                return Ok(new ApiResponse<object>(true, null, "Connessione SMTP funzionante!"));
            }
            else
            {
                return Ok(new ApiResponse<object>(false, null, "Impossibile connettersi al server SMTP"));
            }
        }
        catch (Exception ex)
        {
            return Ok(new ApiResponse<object>(false, null, $"Errore: {ex.Message}"));
        }
    }

    [HttpPost("test-single")]
    public async Task<ActionResult<ApiResponse<object>>> TestSingle([FromBody] TestEmailRequest request)
    {
        try
        {
            var result = await _emailService.SendEmailAsync(
                request.Email,
                "Test Email - Associazione ETS",
                @"<h2>Email di Test</h2>
                  <p>Questa è un'email di test dal sistema di notifiche dell'Associazione ETS.</p>
                  <p>Se ricevi questa email, la configurazione SMTP è corretta! ✅</p>"
            );

            if (result)
            {
                return Ok(new ApiResponse<object>(true, null, "Email di test inviata con successo!"));
            }
            else
            {
                return Ok(new ApiResponse<object>(false, null, "Errore nell'invio dell'email"));
            }
        }
        catch (Exception ex)
        {
            return Ok(new ApiResponse<object>(false, null, $"Errore: {ex.Message}"));
        }
    }
    [HttpPost("send-custom")]
public async Task<ActionResult<ApiResponse<object>>> SendCustom([FromBody] SendCustomEmailRequest request)
{
    try
    {
        var result = await _emailService.SendEmailAsync(
            request.Email,
            request.Subject,
            request.Body
        );

        if (result)
        {
            return Ok(new ApiResponse<object>(true, null, "Email inviata con successo!"));
        }
        else
        {
            return Ok(new ApiResponse<object>(false, null, "Errore nell'invio dell'email"));
        }
    }
    catch (Exception ex)
    {
        return Ok(new ApiResponse<object>(false, null, $"Errore: {ex.Message}"));
    }
}
    [HttpPost("send-all")]
    public async Task<ActionResult<ApiResponse<object>>> SendToAll([FromBody] SendEmailRequest request)
    {
        try
        {
            var soci = await _context.Soci
                .Where(s => s.StatoSocio == "Attivo" && !string.IsNullOrEmpty(s.Email))
                .ToListAsync();

            var successCount = 0;
            var failCount = 0;

            foreach (var socio in soci)
            {
                var result = await _emailService.SendEmailAsync(
                    socio.Email!,
                    request.Subject,
                    request.Body
                );

                if (result)
                    successCount++;
                else
                    failCount++;
            }

            return Ok(new ApiResponse<object>(
                true,
                new { successCount, failCount },
                $"Email inviate: {successCount} successi, {failCount} fallimenti"
            ));
        }
        catch (Exception ex)
        {
            return Ok(new ApiResponse<object>(false, null, $"Errore: {ex.Message}"));
        }
    }
}
