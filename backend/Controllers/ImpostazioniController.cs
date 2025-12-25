using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AssociazioneETS.API.Data;
using AssociazioneETS.API.DTOs;

namespace AssociazioneETS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ImpostazioniController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ImpostazioniController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    [Authorize]
    public async Task<ActionResult<ApiResponse<object>>> GetAll()
    {
        var impostazioni = await _context.Impostazioni.ToListAsync();
        
        var result = impostazioni.ToDictionary(
            i => i.Chiave,
            i => i.Valore
        );

        return Ok(new ApiResponse<object>(true, result, null));
    }

    [HttpPut]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<object>>> Update([FromBody] Dictionary<string, string?> updates)
    {
        foreach (var kvp in updates)
        {
            var impostazione = await _context.Impostazioni.FindAsync(kvp.Key);
            if (impostazione != null)
            {
                impostazione.Valore = kvp.Value;
                impostazione.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                _context.Impostazioni.Add(new Models.Impostazione
                {
                    Chiave = kvp.Key,
                    Valore = kvp.Value,
                    UpdatedAt = DateTime.UtcNow
                });
            }
        }

        await _context.SaveChangesAsync();

        return Ok(new ApiResponse<object>(true, null, "Impostazioni aggiornate con successo"));
    }
}
