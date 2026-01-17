using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AssociazioneETS.API.Data;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace AssociazioneETS.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ReportController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ReportController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/report/evento/{id}/pdf
        [HttpGet("evento/{id}/pdf")]
        public async Task<IActionResult> GetEventoPdf(int id)
        {
            var evento = await _context.Eventi
                .Include(e => e.TodoEventi)
                    .ThenInclude(t => t.Assegnazioni)
                        .ThenInclude(a => a.Socio)
                .Include(e => e.TodoEventi)
                    .ThenInclude(t => t.Assegnazioni)
                        .ThenInclude(a => a.Collaboratore)
                .FirstOrDefaultAsync(e => e.EventoId == id);

            if (evento == null)
                return NotFound();

            var pdfBytes = GenerateEventoPdf(evento);
            
            return File(pdfBytes, "application/pdf", $"Evento_{evento.Titolo.Replace(" ", "_")}.pdf");
        }

        // GET: api/report/todo/{id}/pdf
        [HttpGet("todo/{id}/pdf")]
        public async Task<IActionResult> GetTodoPdf(int id)
        {
            var todo = await _context.TodoEventi
                .Include(t => t.Evento)
                .Include(t => t.Assegnazioni)
                    .ThenInclude(a => a.Socio)
                .Include(t => t.Assegnazioni)
                    .ThenInclude(a => a.Collaboratore)
                .FirstOrDefaultAsync(t => t.TodoEventoId == id);

            if (todo == null)
                return NotFound();

            var pdfBytes = GenerateTodoPdf(todo);
            
            return File(pdfBytes, "application/pdf", $"Todo_{todo.Titolo.Replace(" ", "_")}.pdf");
        }

        // GET: api/report/persona/pdf
        [HttpGet("persona/pdf")]
        public async Task<IActionResult> GetPersonaPdf(
            [FromQuery] string tipo, 
            [FromQuery] int personaId,
            [FromQuery] int[]? eventoIds = null,
            [FromQuery] string? stato = null)
        {
            var query = _context.AssegnazioniTodo
                .Include(a => a.TodoEvento)
                    .ThenInclude(t => t.Evento)
                .Include(a => a.Socio)
                .Include(a => a.Collaboratore)
                .AsQueryable();

            if (tipo == "socio")
                query = query.Where(a => a.SocioId == personaId);
            else
                query = query.Where(a => a.CollaboratoreId == personaId);

            if (eventoIds != null && eventoIds.Length > 0)
                query = query.Where(a => eventoIds.Contains(a.TodoEvento.EventoId));

            if (!string.IsNullOrEmpty(stato))
                query = query.Where(a => a.TodoEvento.Stato == stato);

            var assegnazioni = await query.ToListAsync();

            if (!assegnazioni.Any())
                return NotFound("Nessun todo trovato per questa persona");

            var nomePersona = tipo == "socio" 
                ? $"{assegnazioni.First().Socio?.Nome} {assegnazioni.First().Socio?.Cognome}"
                : $"{assegnazioni.First().Collaboratore?.Nome} {assegnazioni.First().Collaboratore?.Cognome}";

            var pdfBytes = GeneratePersonaPdf(assegnazioni, nomePersona);
            
            return File(pdfBytes, "application/pdf", $"Report_{nomePersona.Replace(" ", "_")}.pdf");
        }

        // Metodi privati per generare PDF
        private byte[] GenerateEventoPdf(Models.Evento evento)
        {
            QuestPDF.Settings.License = LicenseType.Community;

            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(2, Unit.Centimetre);
                    page.DefaultTextStyle(x => x.FontSize(11));

                    page.Header()
                        .Text($"Report Evento: {evento.Titolo}")
                        .SemiBold().FontSize(20).FontColor(Colors.Blue.Darken2);

                    page.Content()
                        .PaddingVertical(1, Unit.Centimetre)
                        .Column(col =>
                        {
                            // Dettagli Evento
                            col.Item().Text("Dettagli Evento").SemiBold().FontSize(14);
                            col.Item().PaddingTop(10).Text($"Tipo: {evento.TipoEvento}");
                            col.Item().Text($"Stato: {evento.Stato}");
                            col.Item().Text($"Inizio: {evento.DataInizio:dd/MM/yyyy HH:mm}");
                            if (evento.DataFine.HasValue)
                                col.Item().Text($"Fine: {evento.DataFine:dd/MM/yyyy HH:mm}");
                            if (!string.IsNullOrEmpty(evento.Luogo))
                                col.Item().Text($"Luogo: {evento.Luogo}");
                            if (!string.IsNullOrEmpty(evento.Descrizione))
                            {
                                col.Item().PaddingTop(5).Text("Descrizione:").SemiBold();
                                col.Item().Text(evento.Descrizione);
                            }

                            // Todo List
                            col.Item().PaddingTop(20).Text("Todo List").SemiBold().FontSize(14);
                            
                            if (evento.TodoEventi != null && evento.TodoEventi.Any())
                            {
                                foreach (var todo in evento.TodoEventi.OrderBy(t => t.Scadenza))
                                {
                                    col.Item().PaddingTop(10).BorderBottom(1).BorderColor(Colors.Grey.Lighten2)
                                        .PaddingBottom(5).Column(todoCol =>
                                    {
                                        todoCol.Item().Row(row =>
                                        {
                                            row.RelativeItem().Text(todo.Titolo).SemiBold();
                                            row.ConstantItem(80).AlignRight().Text(todo.Stato)
                                                .FontSize(9).FontColor(todo.Stato == "Completato" ? Colors.Green.Darken2 : Colors.Orange.Darken2);
                                        });
                                        
                                        if (!string.IsNullOrEmpty(todo.Descrizione))
                                            todoCol.Item().Text(todo.Descrizione).FontSize(9).FontColor(Colors.Grey.Darken1);
                                        
                                        if (todo.Scadenza.HasValue)
                                            todoCol.Item().Text($"Scadenza: {todo.Scadenza:dd/MM/yyyy}").FontSize(9);
                                        
                                        if (todo.Priorita != null)
                                            todoCol.Item().Text($"Priorità: {todo.Priorita}").FontSize(9);

                                        // Assegnazioni
                                        if (todo.Assegnazioni != null && todo.Assegnazioni.Any())
                                        {
                                            todoCol.Item().PaddingTop(3).Text("Assegnato a:").FontSize(9).SemiBold();
                                            foreach (var ass in todo.Assegnazioni)
                                            {
                                                var nome = ass.Socio != null 
                                                    ? $"{ass.Socio.Nome} {ass.Socio.Cognome} (Socio)"
                                                    : $"{ass.Collaboratore?.Nome} {ass.Collaboratore?.Cognome} (Collaboratore)";
                                                todoCol.Item().Text($"  • {nome}").FontSize(9);
                                            }
                                        }
                                    });
                                }
                            }
                            else
                            {
                                col.Item().PaddingTop(10).Text("Nessun todo presente").FontColor(Colors.Grey.Medium);
                            }
                        });

                    page.Footer()
                        .AlignCenter()
                        .Text(x =>
                        {
                            x.Span("Generato il: ");
                            x.Span($"{DateTime.Now:dd/MM/yyyy HH:mm}").SemiBold();
                        });
                });
            });

            return document.GeneratePdf();
        }

        private byte[] GenerateTodoPdf(Models.TodoEvento todo)
        {
            QuestPDF.Settings.License = LicenseType.Community;

            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(2, Unit.Centimetre);
                    page.DefaultTextStyle(x => x.FontSize(11));

                    page.Header()
                        .Column(col =>
                        {
                            col.Item().Text($"Report Todo").SemiBold().FontSize(20).FontColor(Colors.Blue.Darken2);
                            col.Item().Text($"Evento: {todo.Evento?.Titolo}").FontSize(12).FontColor(Colors.Grey.Darken1);
                        });

                    page.Content()
                        .PaddingVertical(1, Unit.Centimetre)
                        .Column(col =>
                        {
                            col.Item().Text(todo.Titolo).SemiBold().FontSize(16);
                            col.Item().PaddingTop(10).Text($"Stato: {todo.Stato}").FontSize(12);
                            col.Item().Text($"Priorità: {todo.Priorita ?? "Non specificata"}").FontSize(12);
                            
                            if (todo.Scadenza.HasValue)
                                col.Item().Text($"Scadenza: {todo.Scadenza:dd/MM/yyyy}").FontSize(12);
                            
                            if (!string.IsNullOrEmpty(todo.Descrizione))
                            {
                                col.Item().PaddingTop(10).Text("Descrizione:").SemiBold();
                                col.Item().Text(todo.Descrizione);
                            }

                            // Persone Assegnate
                            col.Item().PaddingTop(20).Text("Persone Assegnate").SemiBold().FontSize(14);
                            
                            if (todo.Assegnazioni != null && todo.Assegnazioni.Any())
                            {
                                foreach (var ass in todo.Assegnazioni)
                                {
                                    col.Item().PaddingTop(5).Column(assCol =>
                                    {
                                        if (ass.Socio != null)
                                        {
                                            assCol.Item().Text($"{ass.Socio.Nome} {ass.Socio.Cognome}").SemiBold();
                                            assCol.Item().Text($"Tipo: Socio").FontSize(9);
                                            if (!string.IsNullOrEmpty(ass.Socio.Email))
                                                assCol.Item().Text($"Email: {ass.Socio.Email}").FontSize(9);
                                            if (!string.IsNullOrEmpty(ass.Socio.Telefono))
                                                assCol.Item().Text($"Telefono: {ass.Socio.Telefono}").FontSize(9);
                                        }
                                        else if (ass.Collaboratore != null)
                                        {
                                            assCol.Item().Text($"{ass.Collaboratore.Nome} {ass.Collaboratore.Cognome}").SemiBold();
                                            assCol.Item().Text($"Tipo: Collaboratore").FontSize(9);
                                            if (!string.IsNullOrEmpty(ass.Collaboratore.Email))
                                                assCol.Item().Text($"Email: {ass.Collaboratore.Email}").FontSize(9);
                                            if (!string.IsNullOrEmpty(ass.Collaboratore.Telefono))
                                                assCol.Item().Text($"Telefono: {ass.Collaboratore.Telefono}").FontSize(9);
                                            if (!string.IsNullOrEmpty(ass.Collaboratore.Azienda))
                                                assCol.Item().Text($"Azienda: {ass.Collaboratore.Azienda}").FontSize(9);
                                        }
                                    });
                                }
                            }
                            else
                            {
                                col.Item().PaddingTop(10).Text("Nessuna persona assegnata").FontColor(Colors.Grey.Medium);
                            }
                        });

                    page.Footer()
                        .AlignCenter()
                        .Text(x =>
                        {
                            x.Span("Generato il: ");
                            x.Span($"{DateTime.Now:dd/MM/yyyy HH:mm}").SemiBold();
                        });
                });
            });

            return document.GeneratePdf();
        }

        private byte[] GeneratePersonaPdf(List<Models.AssegnazioneTodo> assegnazioni, string nomePersona)
        {
            QuestPDF.Settings.License = LicenseType.Community;

            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(2, Unit.Centimetre);
                    page.DefaultTextStyle(x => x.FontSize(11));

                    page.Header()
                        .Text($"Report Todo - {nomePersona}")
                        .SemiBold().FontSize(20).FontColor(Colors.Blue.Darken2);

                    page.Content()
                        .PaddingVertical(1, Unit.Centimetre)
                        .Column(col =>
                        {
                            col.Item().Text($"Totale Todo: {assegnazioni.Count}").FontSize(12);
                            col.Item().Text($"Completati: {assegnazioni.Count(a => a.TodoEvento.Stato == "Completato")}").FontSize(12);
                            col.Item().Text($"Da fare: {assegnazioni.Count(a => a.TodoEvento.Stato != "Completato")}").FontSize(12);

                            // Raggruppa per evento
                            var perEvento = assegnazioni.GroupBy(a => a.TodoEvento.Evento);

                            foreach (var gruppo in perEvento)
                            {
                                col.Item().PaddingTop(20).Text($"Evento: {gruppo.Key.Titolo}").SemiBold().FontSize(14);
                                col.Item().Text($"Data: {gruppo.Key.DataInizio:dd/MM/yyyy}").FontSize(10).FontColor(Colors.Grey.Darken1);

                                foreach (var ass in gruppo.OrderBy(a => a.TodoEvento.Scadenza))
                                {
                                    col.Item().PaddingTop(10).BorderBottom(1).BorderColor(Colors.Grey.Lighten2)
                                        .PaddingBottom(5).Column(todoCol =>
                                    {
                                        todoCol.Item().Row(row =>
                                        {
                                            row.RelativeItem().Text(ass.TodoEvento.Titolo).SemiBold();
                                            row.ConstantItem(80).AlignRight().Text(ass.TodoEvento.Stato)
                                                .FontSize(9).FontColor(ass.TodoEvento.Stato == "Completato" ? Colors.Green.Darken2 : Colors.Orange.Darken2);
                                        });
                                        
                                        if (!string.IsNullOrEmpty(ass.TodoEvento.Descrizione))
                                            todoCol.Item().Text(ass.TodoEvento.Descrizione).FontSize(9).FontColor(Colors.Grey.Darken1);
                                        
                                        if (ass.TodoEvento.Scadenza.HasValue)
                                            todoCol.Item().Text($"Scadenza: {ass.TodoEvento.Scadenza:dd/MM/yyyy}").FontSize(9);
                                        
                                        if (ass.TodoEvento.Priorita != null)
                                            todoCol.Item().Text($"Priorità: {ass.TodoEvento.Priorita}").FontSize(9);
                                    });
                                }
                            }
                        });

                    page.Footer()
                        .AlignCenter()
                        .Text(x =>
                        {
                            x.Span("Generato il: ");
                            x.Span($"{DateTime.Now:dd/MM/yyyy HH:mm}").SemiBold();
                        });
                });
            });

            return document.GeneratePdf();
        }
// POST: api/report/evento/{id}/email
        [HttpPost("evento/{id}/email")]
        public async Task<IActionResult> SendEventoEmail(int id)
        {
            var evento = await _context.Eventi
                .Include(e => e.TodoEventi)
                    .ThenInclude(t => t.Assegnazioni)
                        .ThenInclude(a => a.Socio)
                .Include(e => e.TodoEventi)
                    .ThenInclude(t => t.Assegnazioni)
                        .ThenInclude(a => a.Collaboratore)
                .FirstOrDefaultAsync(e => e.EventoId == id);

            if (evento == null)
                return NotFound();

            // Raccogli tutte le email delle persone assegnate
            var emails = new HashSet<string>();
            
            if (evento.TodoEventi != null)
            {
                foreach (var todo in evento.TodoEventi)
                {
                    if (todo.Assegnazioni != null)
                    {
                        foreach (var ass in todo.Assegnazioni)
                        {
                            if (ass.Socio != null && !string.IsNullOrEmpty(ass.Socio.Email))
                                emails.Add(ass.Socio.Email);
                            if (ass.Collaboratore != null && !string.IsNullOrEmpty(ass.Collaboratore.Email))
                                emails.Add(ass.Collaboratore.Email);
                        }
                    }
                }
            }

            if (!emails.Any())
                return BadRequest("Nessun destinatario con email trovato");

            // Genera PDF
            var pdfBytes = GenerateEventoPdf(evento);

            // Invia email a tutti i destinatari
            var emailService = HttpContext.RequestServices.GetRequiredService<Services.EmailService>();
            
            foreach (var email in emails)
            {
                var attachments = new List<Services.EmailAttachment>
                {
                    new Services.EmailAttachment
                    {
                        FileName = $"Evento_{evento.Titolo.Replace(" ", "_")}.pdf",
                        Content = pdfBytes,
                        ContentType = "application/pdf"
                    }
                };

                await emailService.SendEmailAsync(
                    email,
                    $"Report Evento: {evento.Titolo}",
                    $@"Buongiorno,<br/><br/>
                    In allegato il report completo dell'evento <strong>{evento.Titolo}</strong>.<br/><br/>
                    Data inizio: {evento.DataInizio:dd/MM/yyyy HH:mm}<br/>
                    {(evento.DataFine.HasValue ? $"Data fine: {evento.DataFine:dd/MM/yyyy HH:mm}<br/>" : "")}
                    {(!string.IsNullOrEmpty(evento.Luogo) ? $"Luogo: {evento.Luogo}<br/>" : "")}
                    <br/>
                    Cordiali saluti,<br/>
                    Gestionale ETS",
                    attachments
                );
            }

            return Ok(new { message = $"Email inviate a {emails.Count} destinatari", recipients = emails });
        }

        // POST: api/report/todo/{id}/email
        [HttpPost("todo/{id}/email")]
        public async Task<IActionResult> SendTodoEmail(int id)
        {
            var todo = await _context.TodoEventi
                .Include(t => t.Evento)
                .Include(t => t.Assegnazioni)
                    .ThenInclude(a => a.Socio)
                .Include(t => t.Assegnazioni)
                    .ThenInclude(a => a.Collaboratore)
                .FirstOrDefaultAsync(t => t.TodoEventoId == id);

            if (todo == null)
                return NotFound();

            // Raccogli email delle persone assegnate
            var emails = new HashSet<string>();
            
            if (todo.Assegnazioni != null)
            {
                foreach (var ass in todo.Assegnazioni)
                {
                    if (ass.Socio != null && !string.IsNullOrEmpty(ass.Socio.Email))
                        emails.Add(ass.Socio.Email);
                    if (ass.Collaboratore != null && !string.IsNullOrEmpty(ass.Collaboratore.Email))
                        emails.Add(ass.Collaboratore.Email);
                }
            }

            if (!emails.Any())
                return BadRequest("Nessun destinatario con email trovato");

            // Genera PDF
            var pdfBytes = GenerateTodoPdf(todo);

            // Invia email
            var emailService = HttpContext.RequestServices.GetRequiredService<Services.EmailService>();
            
            foreach (var email in emails)
            {
                var attachments = new List<Services.EmailAttachment>
                {
                    new Services.EmailAttachment
                    {
                        FileName = $"Todo_{todo.Titolo.Replace(" ", "_")}.pdf",
                        Content = pdfBytes,
                        ContentType = "application/pdf"
                    }
                };

                await emailService.SendEmailAsync(
                    email,
                    $"Todo: {todo.Titolo}",
                    $@"Buongiorno,<br/><br/>
                    Ti è stato assegnato il seguente todo per l'evento <strong>{todo.Evento?.Titolo}</strong>:<br/><br/>
                    <strong>{todo.Titolo}</strong><br/>
                    {(!string.IsNullOrEmpty(todo.Descrizione) ? $"{todo.Descrizione}<br/>" : "")}
                    Stato: {todo.Stato}<br/>
                    {(todo.Scadenza.HasValue ? $"Scadenza: {todo.Scadenza:dd/MM/yyyy}<br/>" : "")}
                    {(!string.IsNullOrEmpty(todo.Priorita) ? $"Priorità: {todo.Priorita}<br/>" : "")}
                    <br/>
                    In allegato trovi il report completo.<br/><br/>
                    Cordiali saluti,<br/>
                    Gestionale ETS",
                    attachments
                );
            }

            return Ok(new { message = $"Email inviate a {emails.Count} destinatari", recipients = emails });
        }

        // POST: api/report/persona/email
        [HttpPost("persona/email")]
        public async Task<IActionResult> SendPersonaEmail(
            [FromQuery] string tipo,
            [FromQuery] int personaId,
            [FromQuery] int[]? eventoIds = null,
            [FromQuery] string? stato = null)
        {
            var query = _context.AssegnazioniTodo
                .Include(a => a.TodoEvento)
                    .ThenInclude(t => t.Evento)
                .Include(a => a.Socio)
                .Include(a => a.Collaboratore)
                .AsQueryable();

            if (tipo == "socio")
                query = query.Where(a => a.SocioId == personaId);
            else
                query = query.Where(a => a.CollaboratoreId == personaId);

            if (eventoIds != null && eventoIds.Length > 0)
                query = query.Where(a => eventoIds.Contains(a.TodoEvento.EventoId));

            if (!string.IsNullOrEmpty(stato))
                query = query.Where(a => a.TodoEvento.Stato == stato);

            var assegnazioni = await query.ToListAsync();

            if (!assegnazioni.Any())
                return NotFound("Nessun todo trovato per questa persona");

            var email = tipo == "socio"
                ? assegnazioni.First().Socio?.Email
                : assegnazioni.First().Collaboratore?.Email;

            if (string.IsNullOrEmpty(email))
                return BadRequest("La persona non ha un indirizzo email");

            var nomePersona = tipo == "socio"
                ? $"{assegnazioni.First().Socio?.Nome} {assegnazioni.First().Socio?.Cognome}"
                : $"{assegnazioni.First().Collaboratore?.Nome} {assegnazioni.First().Collaboratore?.Cognome}";

            // Genera PDF
            var pdfBytes = GeneratePersonaPdf(assegnazioni, nomePersona);

            // Invia email
            var emailService = HttpContext.RequestServices.GetRequiredService<Services.EmailService>();

            var attachments = new List<Services.EmailAttachment>
            {
                new Services.EmailAttachment
                {
                    FileName = $"Report_{nomePersona.Replace(" ", "_")}.pdf",
                    Content = pdfBytes,
                    ContentType = "application/pdf"
                }
            };

            var todoCompletati = assegnazioni.Count(a => a.TodoEvento.Stato == "Completato");
            var todoDaFare = assegnazioni.Count - todoCompletati;

            await emailService.SendEmailAsync(
                email,
                $"Report Todo Personale - {nomePersona}",
                $@"Buongiorno {nomePersona},<br/><br/>
                In allegato trovi il riepilogo dei tuoi todo assegnati.<br/><br/>
                <strong>Statistiche:</strong><br/>
                Totale todo: {assegnazioni.Count}<br/>
                Completati: {todoCompletati}<br/>
                Da fare: {todoDaFare}<br/>
                <br/>
                Cordiali saluti,<br/>
                Gestionale ETS",
                attachments
            );

            return Ok(new { message = $"Email inviata a {email}", recipient = email });
        }
    }
}