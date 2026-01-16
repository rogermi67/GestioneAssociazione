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
public class CollaboratoriController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public CollaboratoriController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<object>>> GetAll()
    {
        var collaboratori = await _context.Collaboratori
            .OrderBy(c => c.Cognome)
            .ThenBy(c => c.Nome)
            .ToListAsync();

        return Ok(new ApiResponse<object>(true, collaboratori, null));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<object>>> GetById(int id)
    {
        var collaboratore = await _context.Collaboratori.FindAsync(id);

        if (collaboratore == null)
        {
            return NotFound(new ApiResponse<object>(false, null, "Collaboratore non trovato"));
        }

        return Ok(new ApiResponse<object>(true, collaboratore, null));
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<object>>> Create([FromBody] CreateCollaboratoreDto dto)
    {
        var collaboratore = new Collaboratore
        {
            Nome = dto.Nome,
            Cognome = dto.Cognome,
            Email = dto.Email,
            Telefono = dto.Telefono,
            Azienda = dto.Azienda,
            Note = dto.Note
        };

        _context.Collaboratori.Add(collaboratore);
        await _context.SaveChangesAsync();

        return Ok(new ApiResponse<object>(true, new { collaboratore.CollaboratoreId }, "Collaboratore creato con successo"));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<object>>> Update(int id, [FromBody] UpdateCollaboratoreDto dto)
    {
        var collaboratore = await _context.Collaboratori.FindAsync(id);
        if (collaboratore == null)
        {
            return NotFound(new ApiResponse<object>(false, null, "Collaboratore non trovato"));
        }

        collaboratore.Nome = dto.Nome;
        collaboratore.Cognome = dto.Cognome;
        collaboratore.Email = dto.Email;
        collaboratore.Telefono = dto.Telefono;
        collaboratore.Azienda = dto.Azienda;
        collaboratore.Note = dto.Note;

        await _context.SaveChangesAsync();

        return Ok(new ApiResponse<object>(true, null, "Collaboratore aggiornato con successo"));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(int id)
    {
        var collaboratore = await _context.Collaboratori.FindAsync(id);
        if (collaboratore == null)
        {
            return NotFound(new ApiResponse<object>(false, null, "Collaboratore non trovato"));
        }

        _context.Collaboratori.Remove(collaboratore);
        await _context.SaveChangesAsync();

        return Ok(new ApiResponse<object>(true, null, "Collaboratore eliminato con successo"));
    }
}