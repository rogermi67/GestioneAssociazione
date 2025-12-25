using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AssociazioneETS.API.Data;
using AssociazioneETS.API.DTOs;
using AssociazioneETS.API.Models;

namespace AssociazioneETS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CaricheController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public CaricheController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    [Authorize]
    public async Task<ActionResult<ApiResponse<object>>> GetAll()
    {
        var cariche = await _context.Cariche
            .OrderBy(c => c.Nome)
            .Select(c => new
            {
                c.CaricaId,
                c.Nome,
                c.Descrizione
            })
            .ToListAsync();

        return Ok(new ApiResponse<object>(true, cariche, null));
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<object>>> Create([FromBody] CreateCaricaDto dto)
    {
        var carica = new Carica
        {
            Nome = dto.Nome,
            Descrizione = dto.Descrizione
        };

        _context.Cariche.Add(carica);
        await _context.SaveChangesAsync();

        return Ok(new ApiResponse<object>(true, new { carica.CaricaId }, "Carica creata con successo"));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<object>>> Update(int id, [FromBody] UpdateCaricaDto dto)
    {
        var carica = await _context.Cariche.FindAsync(id);
        if (carica == null)
        {
            return NotFound(new ApiResponse<object>(false, null, "Carica non trovata"));
        }

        carica.Nome = dto.Nome;
        carica.Descrizione = dto.Descrizione;

        await _context.SaveChangesAsync();

        return Ok(new ApiResponse<object>(true, null, "Carica aggiornata con successo"));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(int id)
    {
        var carica = await _context.Cariche.FindAsync(id);
        if (carica == null)
        {
            return NotFound(new ApiResponse<object>(false, null, "Carica non trovata"));
        }

        var sociConCarica = await _context.Soci.AnyAsync(s => s.CaricaId == id);
        if (sociConCarica)
        {
            return BadRequest(new ApiResponse<object>(false, null, "Impossibile eliminare: ci sono soci con questa carica"));
        }

        _context.Cariche.Remove(carica);
        await _context.SaveChangesAsync();

        return Ok(new ApiResponse<object>(true, null, "Carica eliminata con successo"));
    }
}
