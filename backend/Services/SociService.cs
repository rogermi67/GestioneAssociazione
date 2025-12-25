using AssociazioneETS.API.Data;
using AssociazioneETS.API.Models;
using Microsoft.EntityFrameworkCore;

namespace AssociazioneETS.API.Services;

public interface ISociService
{
    Task<List<Socio>> GetAllAsync();
    Task<Socio?> GetByIdAsync(int id);
}

public class SociService : ISociService
{
    private readonly ApplicationDbContext _context;

    public SociService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<Socio>> GetAllAsync()
    {
        return await _context.Soci
            .Include(s => s.Carica)
            .Where(s => s.StatoSocio == "Attivo")
            .ToListAsync();
    }

    public async Task<Socio?> GetByIdAsync(int id)
    {
        return await _context.Soci
            .Include(s => s.Carica)
            .FirstOrDefaultAsync(s => s.SocioId == id);
    }
}
