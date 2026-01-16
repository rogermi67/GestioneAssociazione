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
public class TodoEventiController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public TodoEventiController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("evento/{eventoId}")]
    public async Task<ActionResult<ApiResponse<object>>> GetByEvento(int eventoId)
    {
        var todos = await _context.TodoEventi
            .Include(t => t.Assegnazioni)
                .ThenInclude(a => a.Socio)
            .Include(t => t.Assegnazioni)
                .ThenInclude(a => a.Collaboratore)
            .Where(t => t.EventoId == eventoId)
            .OrderBy(t => t.Scadenza)
            .ToListAsync();

        return Ok(new ApiResponse<object>(true, todos, null));
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<object>>> Create([FromBody] CreateTodoEventoDto dto)
    {
        var todo = new TodoEvento
        {
            EventoId = dto.EventoId,
            Titolo = dto.Titolo,
            Descrizione = dto.Descrizione,
            Scadenza = dto.Scadenza,
            Priorita = dto.Priorita,
            Stato = "Da fare"
        };

        _context.TodoEventi.Add(todo);
        await _context.SaveChangesAsync();

        return Ok(new ApiResponse<object>(true, new { todo.TodoEventoId }, "Todo creato con successo"));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<object>>> Update(int id, [FromBody] UpdateTodoEventoDto dto)
    {
        var todo = await _context.TodoEventi.FindAsync(id);
        if (todo == null)
        {
            return NotFound(new ApiResponse<object>(false, null, "Todo non trovato"));
        }

        todo.Titolo = dto.Titolo;
        todo.Descrizione = dto.Descrizione;
        todo.Scadenza = dto.Scadenza;
        todo.Stato = dto.Stato;
        todo.Priorita = dto.Priorita;

        if (dto.Stato == "Completato" && todo.CompletedAt == null)
        {
            todo.CompletedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        return Ok(new ApiResponse<object>(true, null, "Todo aggiornato con successo"));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(int id)
    {
        var todo = await _context.TodoEventi.FindAsync(id);
        if (todo == null)
        {
            return NotFound(new ApiResponse<object>(false, null, "Todo non trovato"));
        }

        _context.TodoEventi.Remove(todo);
        await _context.SaveChangesAsync();

        return Ok(new ApiResponse<object>(true, null, "Todo eliminato con successo"));
    }

    [HttpPost("assegna")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<object>>> Assegna([FromBody] AssegnaTodoDto dto)
    {
        var assegnazione = new AssegnazioneTodo
        {
            TodoEventoId = dto.TodoEventoId,
            SocioId = dto.SocioId,
            CollaboratoreId = dto.CollaboratoreId
        };

        _context.AssegnazioniTodo.Add(assegnazione);
        await _context.SaveChangesAsync();

        return Ok(new ApiResponse<object>(true, new { assegnazione.AssegnazioneId }, "Assegnazione creata con successo"));
    }

    [HttpDelete("assegna/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<object>>> RimuoviAssegnazione(int id)
    {
        var assegnazione = await _context.AssegnazioniTodo.FindAsync(id);
        if (assegnazione == null)
        {
            return NotFound(new ApiResponse<object>(false, null, "Assegnazione non trovata"));
        }

        _context.AssegnazioniTodo.Remove(assegnazione);
        await _context.SaveChangesAsync();

        return Ok(new ApiResponse<object>(true, null, "Assegnazione rimossa con successo"));
    }
}