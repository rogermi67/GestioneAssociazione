using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace AssociazioneETS.API.Services;

public interface IEmailService
{
    Task<bool> SendEmailAsync(string to, string subject, string body);
    Task<bool> TestConnectionAsync();
}

public class EmailService : IEmailService
{
    private readonly string _smtpHost;
    private readonly int _smtpPort;
    private readonly string _smtpUser;
    private readonly string _smtpPass;
    private readonly string _fromEmail;
    private readonly string _fromName;

    public EmailService(IConfiguration configuration)
    {
        _smtpHost = configuration["Email:SmtpHost"] ?? "smtp.gmail.com";
        _smtpPort = int.Parse(configuration["Email:SmtpPort"] ?? "587");
        _smtpUser = configuration["Email:SmtpUser"] ?? "";
        _smtpPass = configuration["Email:SmtpPass"] ?? "";
        _fromEmail = configuration["Email:FromEmail"] ?? "";
        _fromName = configuration["Email:FromName"] ?? "Associazione ETS";
    }

    public async Task<bool> SendEmailAsync(string to, string subject, string body)
    {
        try
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(_fromName, _fromEmail));
            message.To.Add(new MailboxAddress("", to));
            message.Subject = subject;

            var bodyBuilder = new BodyBuilder
            {
                HtmlBody = body
            };
            message.Body = bodyBuilder.ToMessageBody();

            using var client = new SmtpClient();
            await client.ConnectAsync(_smtpHost, _smtpPort, SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(_smtpUser, _smtpPass);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);

            return true;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Errore invio email: {ex.Message}");
            return false;
        }
    }

    public async Task<bool> TestConnectionAsync()
    {
        try
        {
            using var client = new SmtpClient();
            await client.ConnectAsync(_smtpHost, _smtpPort, SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(_smtpUser, _smtpPass);
            await client.DisconnectAsync(true);
            return true;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Errore test connessione: {ex.Message}");
            return false;
        }
    }
}
