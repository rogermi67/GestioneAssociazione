# Script per fixare la gestione eventi nel backend
# Esegui da: C:\Progetti\associazione-ets

Write-Host "🔧 FIX GESTIONE EVENTI - Backend" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = "C:\Progetti\associazione-ets"

# Verifica che siamo nella directory giusta
if (-not (Test-Path "$projectRoot\backend")) {
    Write-Host "❌ Errore: Directory backend non trovata!" -ForegroundColor Red
    Write-Host "   Assicurati di essere in: $projectRoot" -ForegroundColor Yellow
    exit 1
}

Write-Host "📁 Progetto trovato: $projectRoot" -ForegroundColor Green
Write-Host ""

# ==================================================
# STEP 1: Crea CreateEventoDto.cs
# ==================================================

Write-Host "📝 Step 1: Creazione CreateEventoDto.cs..." -ForegroundColor Yellow

$dtoContent = @'
namespace AssociazioneETS.API.DTOs;

public class CreateEventoDto
{
    public string Titolo { get; set; } = string.Empty;
    public string? Descrizione { get; set; }
    public DateTime DataInizio { get; set; }
    public DateTime? DataFine { get; set; }
    public string? Luogo { get; set; }
    public string TipoEvento { get; set; } = "Evento";
    public string Stato { get; set; } = "Pianificato";
    public decimal? Budget { get; set; }
    public string? Note { get; set; }
    public bool Pubblicato { get; set; }
}

public class UpdateEventoDto
{
    public string Titolo { get; set; } = string.Empty;
    public string? Descrizione { get; set; }
    public DateTime DataInizio { get; set; }
    public DateTime? DataFine { get; set; }
    public string? Luogo { get; set; }
    public string TipoEvento { get; set; } = "Evento";
    public string Stato { get; set; } = "Pianificato";
    public decimal? Budget { get; set; }
    public string? Note { get; set; }
    public bool Pubblicato { get; set; }
}

public class AggiungiPartecinanteEventoDto
{
    public string? Ruolo { get; set; }
}
'@

$dtoPath = "$projectRoot\backend\DTOs\CreateEventoDto.cs"
$dtoContent | Out-File -FilePath $dtoPath -Encoding UTF8
Write-Host "   ✅ Creato: $dtoPath" -ForegroundColor Green

# ==================================================
# STEP 2: Sostituisci EventiController.cs
# ==================================================

Write-Host ""
Write-Host "📝 Step 2: Aggiornamento EventiController.cs..." -ForegroundColor Yellow

$controllerContent = @'
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
'@

$controllerPath = "$projectRoot\backend\Controllers\EventiController.cs"

# Backup del file originale
if (Test-Path $controllerPath) {
    $backupPath = "$controllerPath.backup"
    Copy-Item $controllerPath $backupPath
    Write-Host "   💾 Backup salvato: $backupPath" -ForegroundColor Cyan
}

$controllerContent | Out-File -FilePath $controllerPath -Encoding UTF8
Write-Host "   ✅ Aggiornato: $controllerPath" -ForegroundColor Green

# ==================================================
# RIEPILOGO
# ==================================================

Write-Host ""
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "✅ FIX COMPLETATO!" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Modifiche applicate:" -ForegroundColor Yellow
Write-Host "   1. ✅ Creato CreateEventoDto.cs con 3 classi DTO" -ForegroundColor White
Write-Host "   2. ✅ Aggiornato EventiController.cs con metodi POST/PUT/DELETE" -ForegroundColor White
Write-Host ""
Write-Host "🔍 Cosa è stato aggiunto:" -ForegroundColor Yellow
Write-Host "   • POST   /api/eventi          - Crea evento" -ForegroundColor White
Write-Host "   • PUT    /api/eventi/{id}     - Modifica evento" -ForegroundColor White
Write-Host "   • DELETE /api/eventi/{id}     - Elimina evento" -ForegroundColor White
Write-Host "   • POST   /api/eventi/{id}/partecipanti/{socioId} - Aggiungi partecipante" -ForegroundColor White
Write-Host ""
Write-Host "🚀 PROSSIMI PASSI:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1️⃣  Testa in locale (opzionale):" -ForegroundColor Yellow
Write-Host "    cd backend" -ForegroundColor White
Write-Host "    dotnet run" -ForegroundColor White
Write-Host "    Poi vai su http://localhost:5173 e prova a creare un evento" -ForegroundColor Gray
Write-Host ""
Write-Host "2️⃣  Fai il commit e push su GitHub:" -ForegroundColor Yellow
Write-Host "    git add ." -ForegroundColor White
Write-Host "    git commit -m " -NoNewline -ForegroundColor White
Write-Host '"Fix: Aggiunto CRUD completo per eventi"' -ForegroundColor Green
Write-Host "    git push" -ForegroundColor White
Write-Host ""
Write-Host "3️⃣  Railway farà il deploy automatico! ⚡" -ForegroundColor Yellow
Write-Host ""
Write-Host "💡 Tip: Se vuoi vedere i file con NPP:" -ForegroundColor Cyan
Write-Host "    notepad++ " -NoNewline -ForegroundColor White
Write-Host $dtoPath -ForegroundColor Yellow
Write-Host "    notepad++ " -NoNewline -ForegroundColor White
Write-Host $controllerPath -ForegroundColor Yellow
Write-Host ""
