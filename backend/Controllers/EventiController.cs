using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AssociazioneETS.API.Data;
using AssociazioneETS.API.DTOs;
using AssociazioneETS.API.Models;

namespace AssociazioneETS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EventiController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public EventiController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<object>>> GetAll()
    {
        var eventi = await _context.Eventi
            .Include(e => e.Partecipazioni)
            .OrderByDescending(e => e.DataInizio)
            .ToListAsync();

        return Ok(new ApiResponse<object>(true, eventi, null));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<object>>> GetById(int id)
    {
        var evento = await _context.Eventi
            .Include(e => e.Partecipazioni)
            .ThenInclude(p => p.Socio)
            .FirstOrDefaultAsync(e => e.EventoId == id);

        if (evento == null)
        {
            return NotFound(new ApiResponse<object>(false, null, "Evento non trovato"));
        }

        return Ok(new ApiResponse<object>(true, evento, null));
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<object>>> Create([FromBody] CreateEventoDto dto)
    {
        var evento = new Evento
        {
            Titolo = dto.Titolo,
            Descrizione = dto.Descrizione,
            DataInizio = dto.DataInizio,
            DataFine = dto.DataFine,
            Luogo = dto.Luogo,
            TipoEvento = dto.TipoEvento,
            Stato = dto.Stato,
            Budget = dto.Budget,
            Note = dto.Note,
            Pubblicato = dto.Pubblicato
        };

        _context.Eventi.Add(evento);
        await _context.SaveChangesAsync();

        return Ok(new ApiResponse<object>(true, new { evento.EventoId }, "Evento creato con successo"));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<object>>> Update(int id, [FromBody] UpdateEventoDto dto)
    {
        var evento = await _context.Eventi.FindAsync(id);
        if (evento == null)
        {
            return NotFound(new ApiResponse<object>(false, null, "Evento non trovato"));
        }

        evento.Titolo = dto.Titolo;
        evento.Descrizione = dto.Descrizione;
        evento.DataInizio = dto.DataInizio;
        evento.DataFine = dto.DataFine;
        evento.Luogo = dto.Luogo;
        evento.TipoEvento = dto.TipoEvento;
        evento.Stato = dto.Stato;
        evento.Budget = dto.Budget;
        evento.Note = dto.Note;
        evento.Pubblicato = dto.Pubblicato;

        await _context.SaveChangesAsync();

        return Ok(new ApiResponse<object>(true, null, "Evento aggiornato con successo"));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(int id)
    {
        var evento = await _context.Eventi.FindAsync(id);
        if (evento == null)
        {
            return NotFound(new ApiResponse<object>(false, null, "Evento non trovato"));
        }

        _context.Eventi.Remove(evento);
        await _context.SaveChangesAsync();

        return Ok(new ApiResponse<object>(true, null, "Evento eliminato con successo"));
    }

    [HttpPost("{eventoId}/partecipanti/{socioId}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<object>>> AggiungiPartecipante(
        int eventoId, 
        int socioId, 
        [FromBody] AggiungiPartecinanteEventoDto dto)
    {
        var evento = await _context.Eventi.FindAsync(eventoId);
        if (evento == null)
        {
            return NotFound(new ApiResponse<object>(false, null, "Evento non trovato"));
        }

        var socio = await _context.Soci.FindAsync(socioId);
        if (socio == null)
        {
            return NotFound(new ApiResponse<object>(false, null, "Socio non trovato"));
        }

        var partecipazione = new PartecipazioneEvento
        {
            EventoId = eventoId,
            SocioId = socioId,
            Ruolo = dto.Ruolo
        };

        _context.PartecipazioniEventi.Add(partecipazione);
        await _context.SaveChangesAsync();

        return Ok(new ApiResponse<object>(true, new { partecipazione.PartecipazioneEventoId }, "Partecipante aggiunto"));
    }
}
