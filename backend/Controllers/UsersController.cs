using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AssociazioneETS.API.Data;
using AssociazioneETS.API.DTOs;

namespace AssociazioneETS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class UsersController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public UsersController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<object>>> GetAll()
    {
        var users = await _context.Users
            .Select(u => new
            {
                u.UserId,
                u.Username,
                u.Email,
                u.Nome,
                u.Cognome,
                u.Ruolo,
                u.Attivo,
                u.CreatedAt,
                u.UltimoAccesso
            })
            .ToListAsync();

        return Ok(new ApiResponse<object>(true, users, null));
    }

    [HttpPut("{id}/role")]
    public async Task<ActionResult<ApiResponse<object>>> UpdateRole(int id, [FromBody] UpdateRoleRequest request)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
        {
            return NotFound(new ApiResponse<object>(false, null, "Utente non trovato"));
        }

        user.Ruolo = request.Ruolo;
        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new ApiResponse<object>(true, null, "Ruolo aggiornato"));
    }

    [HttpPut("{id}/status")]
    public async Task<ActionResult<ApiResponse<object>>> UpdateStatus(int id, [FromBody] UpdateStatusRequest request)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
        {
            return NotFound(new ApiResponse<object>(false, null, "Utente non trovato"));
        }

        user.Attivo = request.Attivo;
        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new ApiResponse<object>(true, null, "Stato aggiornato"));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
        {
            return NotFound(new ApiResponse<object>(false, null, "Utente non trovato"));
        }

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();

        return Ok(new ApiResponse<object>(true, null, "Utente eliminato"));
    }
}
