using AssociazioneETS.API.Data;
using AssociazioneETS.API.Models;
using Microsoft.EntityFrameworkCore;

namespace AssociazioneETS.API.Services;

public interface IEventiService
{
    Task<List<Evento>> GetAllAsync();
    Task<Evento?> GetByIdAsync(int id);
}

public class EventiService : IEventiService
{
    private readonly ApplicationDbContext _context;

    public EventiService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<Evento>> GetAllAsync()
    {
        return await _context.Eventi
            .Include(e => e.Partecipazioni)
            .OrderByDescending(e => e.DataInizio)
            .ToListAsync();
    }

    public async Task<Evento?> GetByIdAsync(int id)
    {
        return await _context.Eventi
            .Include(e => e.Partecipazioni)
            .ThenInclude(p => p.Socio)
            .FirstOrDefaultAsync(e => e.EventoId == id);
    }
}
