using AssociazioneETS.API.Data;
using AssociazioneETS.API.Models;
using Microsoft.EntityFrameworkCore;

namespace AssociazioneETS.API.Services;

public interface IRiunioniService
{
    Task<List<Riunione>> GetAllAsync();
    Task<Riunione?> GetByIdAsync(int id);
}

public class RiunioniService : IRiunioniService
{
    private readonly ApplicationDbContext _context;

    public RiunioniService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<Riunione>> GetAllAsync()
    {
        return await _context.Riunioni
            .Include(r => r.Partecipazioni)
            .ThenInclude(p => p.Socio)
            .ThenInclude(s => s.Carica)
            .OrderByDescending(r => r.DataRiunione)
            .ToListAsync();
    }

    public async Task<Riunione?> GetByIdAsync(int id)
    {
        return await _context.Riunioni
            .Include(r => r.Partecipazioni)
            .ThenInclude(p => p.Socio)
            .ThenInclude(s => s.Carica)
            .Include(r => r.Argomenti)
            .Include(r => r.Delibere)
            .FirstOrDefaultAsync(r => r.RiunioneId == id);
    }
}
