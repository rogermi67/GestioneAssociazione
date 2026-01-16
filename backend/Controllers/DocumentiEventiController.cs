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
public class DocumentiEventiController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IWebHostEnvironment _environment;

    public DocumentiEventiController(ApplicationDbContext context, IWebHostEnvironment environment)
    {
        _context = context;
        _environment = environment;
    }

    [HttpGet("evento/{eventoId}")]
    public async Task<ActionResult<ApiResponse<object>>> GetByEvento(int eventoId)
    {
        var documenti = await _context.DocumentiEventi
            .Where(d => d.EventoId == eventoId)
            .OrderByDescending(d => d.UploadedAt)
            .ToListAsync();

        return Ok(new ApiResponse<object>(true, documenti, null));
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<object>>> Upload([FromBody] UploadDocumentoDto dto)
    {
        try
        {
            // Decodifica Base64
            var bytes = Convert.FromBase64String(dto.Base64Content);
            
            // Crea directory se non esiste
            var uploadsPath = Path.Combine(_environment.ContentRootPath, "uploads", "eventi");
            if (!Directory.Exists(uploadsPath))
            {
                Directory.CreateDirectory(uploadsPath);
            }

            // Genera nome file unico
            var fileName = $"{Guid.NewGuid()}_{dto.NomeFile}";
            var filePath = Path.Combine(uploadsPath, fileName);

            // Salva file
            await System.IO.File.WriteAllBytesAsync(filePath, bytes);

            // Salva record in DB
            var documento = new DocumentoEvento
            {
                EventoId = dto.EventoId,
                NomeFile = dto.NomeFile,
                TipoFile = dto.TipoFile,
                PathFile = Path.Combine("uploads", "eventi", fileName),
                Dimensione = bytes.Length,
                UploadedBy = int.Parse(User.FindFirst("user_id")?.Value ?? "0")
            };

            _context.DocumentiEventi.Add(documento);
            await _context.SaveChangesAsync();

            return Ok(new ApiResponse<object>(true, new { documento.DocumentoEventoId }, "Documento caricato con successo"));
        }
        catch (Exception ex)
        {
            return BadRequest(new ApiResponse<object>(false, null, $"Errore nel caricamento: {ex.Message}"));
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(int id)
    {
        var documento = await _context.DocumentiEventi.FindAsync(id);
        if (documento == null)
        {
            return NotFound(new ApiResponse<object>(false, null, "Documento non trovato"));
        }

        // Elimina file fisico
        var fullPath = Path.Combine(_environment.ContentRootPath, documento.PathFile);
        if (System.IO.File.Exists(fullPath))
        {
            System.IO.File.Delete(fullPath);
        }

        _context.DocumentiEventi.Remove(documento);
        await _context.SaveChangesAsync();

        return Ok(new ApiResponse<object>(true, null, "Documento eliminato con successo"));
    }

    [HttpGet("download/{id}")]
    public async Task<IActionResult> Download(int id)
    {
        var documento = await _context.DocumentiEventi.FindAsync(id);
        if (documento == null)
        {
            return NotFound();
        }

        var fullPath = Path.Combine(_environment.ContentRootPath, documento.PathFile);
        if (!System.IO.File.Exists(fullPath))
        {
            return NotFound();
        }

        var bytes = await System.IO.File.ReadAllBytesAsync(fullPath);
        return File(bytes, documento.TipoFile, documento.NomeFile);
    }
}