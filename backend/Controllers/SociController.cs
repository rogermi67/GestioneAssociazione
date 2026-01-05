using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AssociazioneETS.API.Data;
using AssociazioneETS.API.DTOs;
using AssociazioneETS.API.Models;

namespace AssociazioneETS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SociController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public SociController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    [Authorize]
    public async Task<ActionResult<ApiResponse<object>>> GetAll()
    {
        var soci = await _context.Soci
            .Include(s => s.Carica)
            .Where(s => s.StatoSocio == "Attivo")
            .OrderBy(s => s.Cognome)
            .ThenBy(s => s.Nome)
            .Select(s => new
            {
                s.SocioId,
                s.Nome,
                s.Cognome,
                NomeCompleto = s.Nome + " " + s.Cognome,
                s.CodiceFiscale,
                s.DataNascita,
                Eta = DateTime.Now.Year - s.DataNascita.Year,
                s.Email,
                s.Telefono,
                s.Indirizzo,
                s.StatoSocio,
                s.DataIscrizione,
                s.DataCessazione,
                s.CaricaId,
                Carica = s.Carica != null ? new { s.Carica.CaricaId, s.Carica.Nome } : null,
                s.Note
            })
            .ToListAsync();

        return Ok(new ApiResponse<object>(true, soci, null));
    }
[HttpGet("inattivi")]
[Authorize]
public async Task<ActionResult<ApiResponse<object>>> GetInattivi()
{
    var soci = await _context.Soci
        .Include(s => s.Carica)
        .Where(s => s.StatoSocio != "Attivo")
        .OrderBy(s => s.Cognome)
        .ThenBy(s => s.Nome)
        .Select(s => new
        {
            s.SocioId,
            s.Nome,
            s.Cognome,
            NomeCompleto = s.Nome + " " + s.Cognome,
            s.CodiceFiscale,
            s.DataNascita,
            Eta = DateTime.Now.Year - s.DataNascita.Year,
            s.Email,
            s.Telefono,
            s.Indirizzo,
            s.StatoSocio,
            s.DataIscrizione,
            s.DataCessazione,
            s.CaricaId,
            Carica = s.Carica != null ? new { s.Carica.CaricaId, s.Carica.Nome } : null,
            s.Note
        })
        .ToListAsync();

    return Ok(new ApiResponse<object>(true, soci, null));
}
    [HttpGet("{id}")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<object>>> GetById(int id)
    {
        var socio = await _context.Soci
            .Include(s => s.Carica)
            .Where(s => s.SocioId == id)
            .Select(s => new
            {
                s.SocioId,
                s.Nome,
                s.Cognome,
                NomeCompleto = s.Nome + " " + s.Cognome,
                s.CodiceFiscale,
                s.DataNascita,
                Eta = DateTime.Now.Year - s.DataNascita.Year,
                s.Email,
                s.Telefono,
                s.Indirizzo,
                s.StatoSocio,
                s.DataIscrizione,
                s.DataCessazione,
                s.CaricaId,
                Carica = s.Carica != null ? new { s.Carica.CaricaId, s.Carica.Nome, s.Carica.Descrizione } : null,
                s.Note
            })
            .FirstOrDefaultAsync();

        if (socio == null)
        {
            return NotFound(new ApiResponse<object>(false, null, "Socio non trovato"));
        }

        return Ok(new ApiResponse<object>(true, socio, null));
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<object>>> Create([FromBody] CreateSocioDto dto)
    {
        if (await _context.Soci.AnyAsync(s => s.CodiceFiscale == dto.CodiceFiscale))
        {
            return BadRequest(new ApiResponse<object>(false, null, "Codice fiscale già esistente"));
        }

        var socio = new Socio
        {
            Nome = dto.Nome,
            Cognome = dto.Cognome,
            CodiceFiscale = dto.CodiceFiscale,
            DataNascita = dto.DataNascita,
            Email = dto.Email,
            Telefono = dto.Telefono,
            Indirizzo = dto.Indirizzo,
            StatoSocio = "Attivo",
            DataIscrizione = DateTime.UtcNow,
            Note = dto.Note,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Soci.Add(socio);
        await _context.SaveChangesAsync();

        return Ok(new ApiResponse<object>(true, new { socio.SocioId }, "Socio creato con successo"));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<object>>> Update(int id, [FromBody] UpdateSocioDto dto)
    {
        var socio = await _context.Soci.FindAsync(id);
        if (socio == null)
        {
            return NotFound(new ApiResponse<object>(false, null, "Socio non trovato"));
        }

        if (dto.CodiceFiscale != socio.CodiceFiscale && 
            await _context.Soci.AnyAsync(s => s.CodiceFiscale == dto.CodiceFiscale))
        {
            return BadRequest(new ApiResponse<object>(false, null, "Codice fiscale già esistente"));
        }

        socio.Nome = dto.Nome;
        socio.Cognome = dto.Cognome;
        socio.CodiceFiscale = dto.CodiceFiscale;
        socio.DataNascita = dto.DataNascita;
        socio.Email = dto.Email;
        socio.Telefono = dto.Telefono;
        socio.Indirizzo = dto.Indirizzo;
        socio.StatoSocio = dto.StatoSocio;
        socio.CaricaId = dto.CaricaId;
        socio.Note = dto.Note;
        socio.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new ApiResponse<object>(true, null, "Socio aggiornato con successo"));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(int id)
    {
        var socio = await _context.Soci.FindAsync(id);
        if (socio == null)
        {
            return NotFound(new ApiResponse<object>(false, null, "Socio non trovato"));
        }

        _context.Soci.Remove(socio);
        await _context.SaveChangesAsync();

        return Ok(new ApiResponse<object>(true, null, "Socio eliminato con successo"));
    }
}
