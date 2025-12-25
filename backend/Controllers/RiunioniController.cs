using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AssociazioneETS.API.Data;
using AssociazioneETS.API.DTOs;
using AssociazioneETS.API.Models;

namespace AssociazioneETS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RiunioniController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public RiunioniController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    [Authorize]
    public async Task<ActionResult<ApiResponse<object>>> GetAll()
    {
        var riunioni = await _context.Riunioni
            .Include(r => r.Partecipazioni)
            .OrderByDescending(r => r.DataRiunione)
            .Select(r => new
            {
                r.RiunioneId,
                r.DataRiunione,
                OraInizio = r.OraInizio.ToString(@"hh\:mm"),
                OraFine = r.OraFine.HasValue ? r.OraFine.Value.ToString(@"hh\:mm") : null,
                r.Luogo,
                r.TipoRiunione,
                r.StatoVerbale,
                r.Note,
                Partecipazioni = r.Partecipazioni.Select(p => new
                {
                    p.PartecipazioneId,
                    p.Presente
                }).ToList()
            })
            .ToListAsync();

        return Ok(new ApiResponse<object>(true, riunioni, null));
    }

    [HttpGet("{id}")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<object>>> GetById(int id)
    {
        var riunione = await _context.Riunioni
            .Where(r => r.RiunioneId == id)
            .Select(r => new
            {
                r.RiunioneId,
                r.DataRiunione,
                OraInizio = r.OraInizio.ToString(@"hh\:mm"),
                OraFine = r.OraFine.HasValue ? r.OraFine.Value.ToString(@"hh\:mm") : null,
                r.Luogo,
                r.TipoRiunione,
                r.StatoVerbale,
                r.Verbale,
                r.Note
            })
            .FirstOrDefaultAsync();

        if (riunione == null)
        {
            return NotFound(new ApiResponse<object>(false, null, "Riunione non trovata"));
        }

        return Ok(new ApiResponse<object>(true, riunione, null));
    }

    [HttpGet("{id}/partecipazioni")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<object>>> GetPartecipazioni(int id)
    {
        var partecipazioni = await _context.PartecipazioniRiunioni
            .Include(p => p.Socio)
            .ThenInclude(s => s.Carica)
            .Where(p => p.RiunioneId == id)
            .ToListAsync();

        var result = partecipazioni.Select(p => new
        {
            p.PartecipazioneId,
            p.SocioId,
            NomeSocio = p.Socio.NomeCompleto,
            Email = p.Socio.Email,
            Carica = p.Socio.Carica != null ? p.Socio.Carica.Nome : null,
            p.Ruolo,
            p.Presente
        }).ToList();

        return Ok(new ApiResponse<object>(true, result, null));
    }

    [HttpGet("{id}/argomenti")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<object>>> GetArgomenti(int id)
    {
        var argomenti = await _context.ArgomentiRiunione
            .Where(a => a.RiunioneId == id)
            .OrderBy(a => a.Ordine)
            .Select(a => new
            {
                a.ArgomentoId,
                a.Titolo,
                a.Descrizione,
                a.Ordine
            })
            .ToListAsync();

        return Ok(new ApiResponse<object>(true, argomenti, null));
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<object>>> Create([FromBody] CreateRiunioneDto dto)
    {
        var riunione = new Riunione
        {
            DataRiunione = dto.DataRiunione,
            OraInizio = TimeSpan.Parse(dto.OraInizio),
            OraFine = !string.IsNullOrEmpty(dto.OraFine) ? TimeSpan.Parse(dto.OraFine) : null,
            Luogo = dto.Luogo,
            TipoRiunione = dto.TipoRiunione,
            StatoVerbale = "Bozza",
            Note = dto.Note
        };

        _context.Riunioni.Add(riunione);
        await _context.SaveChangesAsync();

        return Ok(new ApiResponse<object>(true, new { riunione.RiunioneId }, "Riunione creata con successo"));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<object>>> Update(int id, [FromBody] UpdateRiunioneDto dto)
    {
        var riunione = await _context.Riunioni.FindAsync(id);
        if (riunione == null)
        {
            return NotFound(new ApiResponse<object>(false, null, "Riunione non trovata"));
        }

        riunione.DataRiunione = dto.DataRiunione;
        riunione.OraInizio = TimeSpan.Parse(dto.OraInizio);
        riunione.OraFine = !string.IsNullOrEmpty(dto.OraFine) ? TimeSpan.Parse(dto.OraFine) : null;
        riunione.Luogo = dto.Luogo;
        riunione.TipoRiunione = dto.TipoRiunione;
        riunione.StatoVerbale = dto.StatoVerbale;
        riunione.Verbale = dto.Verbale;
        riunione.Note = dto.Note;

        await _context.SaveChangesAsync();

        return Ok(new ApiResponse<object>(true, null, "Riunione aggiornata con successo"));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(int id)
    {
        var riunione = await _context.Riunioni.FindAsync(id);
        if (riunione == null)
        {
            return NotFound(new ApiResponse<object>(false, null, "Riunione non trovata"));
        }

        _context.Riunioni.Remove(riunione);
        await _context.SaveChangesAsync();

        return Ok(new ApiResponse<object>(true, null, "Riunione eliminata con successo"));
    }

    [HttpPost("{id}/partecipazioni")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<object>>> AddPartecipazione(int id, [FromBody] AddPartecipazioneDto dto)
    {
        var riunione = await _context.Riunioni.FindAsync(id);
        if (riunione == null)
        {
            return NotFound(new ApiResponse<object>(false, null, "Riunione non trovata"));
        }

        var socio = await _context.Soci.FindAsync(dto.SocioId);
        if (socio == null)
        {
            return NotFound(new ApiResponse<object>(false, null, "Socio non trovato"));
        }

        var partecipazione = new PartecipazioneRiunione
        {
            RiunioneId = id,
            SocioId = dto.SocioId,
            Presente = dto.Presente,
            Ruolo = dto.Ruolo
        };

        _context.PartecipazioniRiunioni.Add(partecipazione);
        await _context.SaveChangesAsync();

        return Ok(new ApiResponse<object>(true, new { partecipazione.PartecipazioneId }, "Partecipazione aggiunta"));
    }

    [HttpPut("partecipazioni/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<object>>> UpdatePartecipazione(int id, [FromBody] UpdatePartecipazioneDto dto)
    {
        var partecipazione = await _context.PartecipazioniRiunioni.FindAsync(id);
        if (partecipazione == null)
        {
            return NotFound(new ApiResponse<object>(false, null, "Partecipazione non trovata"));
        }

        partecipazione.Presente = dto.Presente;
        partecipazione.Ruolo = dto.Ruolo;

        await _context.SaveChangesAsync();

        return Ok(new ApiResponse<object>(true, null, "Partecipazione aggiornata"));
    }

    [HttpDelete("partecipazioni/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<object>>> DeletePartecipazione(int id)
    {
        var partecipazione = await _context.PartecipazioniRiunioni.FindAsync(id);
        if (partecipazione == null)
        {
            return NotFound(new ApiResponse<object>(false, null, "Partecipazione non trovata"));
        }

        _context.PartecipazioniRiunioni.Remove(partecipazione);
        await _context.SaveChangesAsync();

        return Ok(new ApiResponse<object>(true, null, "Partecipazione eliminata"));
    }

    [HttpPost("{id}/argomenti")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<object>>> AddArgomento(int id, [FromBody] AddArgomentoDto dto)
    {
        var riunione = await _context.Riunioni.FindAsync(id);
        if (riunione == null)
        {
            return NotFound(new ApiResponse<object>(false, null, "Riunione non trovata"));
        }

        var maxOrdine = await _context.ArgomentiRiunione
            .Where(a => a.RiunioneId == id)
            .MaxAsync(a => (int?)a.Ordine) ?? 0;

        var argomento = new ArgomentoRiunione
        {
            RiunioneId = id,
            Titolo = dto.Titolo,
            Descrizione = dto.Descrizione,
            Ordine = maxOrdine + 1
        };

        _context.ArgomentiRiunione.Add(argomento);
        await _context.SaveChangesAsync();

        return Ok(new ApiResponse<object>(true, new { argomento.ArgomentoId }, "Argomento aggiunto"));
    }

    [HttpDelete("argomenti/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteArgomento(int id)
    {
        var argomento = await _context.ArgomentiRiunione.FindAsync(id);
        if (argomento == null)
        {
            return NotFound(new ApiResponse<object>(false, null, "Argomento non trovato"));
        }

        _context.ArgomentiRiunione.Remove(argomento);
        await _context.SaveChangesAsync();

        return Ok(new ApiResponse<object>(true, null, "Argomento eliminato"));
    }
}
