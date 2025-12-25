namespace AssociazioneETS.API.DTOs;

public class ApiResponse<T>
{
    public bool Success { get; set; }
    public T? Data { get; set; }
    public string? Message { get; set; }

    public ApiResponse(bool success, T? data, string? message)
    {
        Success = success;
        Data = data;
        Message = message;
    }
}

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class RegisterRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string? Nome { get; set; }
    public string? Cognome { get; set; }
}

public class LoginResponse
{
    public string Token { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Nome { get; set; } = string.Empty;
    public string Cognome { get; set; } = string.Empty;
    public string Ruolo { get; set; } = string.Empty;

    public LoginResponse() { }
    
    public LoginResponse(string token, string email, string nome, string cognome, string ruolo)
    {
        Token = token;
        Email = email;
        Nome = nome;
        Cognome = cognome;
        Ruolo = ruolo;
    }
}

public class UserDto
{
    public int UserId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string? Nome { get; set; }
    public string? Cognome { get; set; }
    public string Ruolo { get; set; } = string.Empty;
}

// Soci DTOs
public class CreateSocioDto
{
    public string Nome { get; set; } = string.Empty;
    public string Cognome { get; set; } = string.Empty;
    public string CodiceFiscale { get; set; } = string.Empty;
    public DateTime DataNascita { get; set; }
    public string? Email { get; set; }
    public string? Telefono { get; set; }
    public string? Indirizzo { get; set; }
    public string? Note { get; set; }
}

public class UpdateSocioDto
{
    public string Nome { get; set; } = string.Empty;
    public string Cognome { get; set; } = string.Empty;
    public string CodiceFiscale { get; set; } = string.Empty;
    public DateTime DataNascita { get; set; }
    public string? Email { get; set; }
    public string? Telefono { get; set; }
    public string? Indirizzo { get; set; }
    public string StatoSocio { get; set; } = "Attivo";
    public int? CaricaId { get; set; }
    public string? Note { get; set; }
}

// Riunioni DTOs
public class CreateRiunioneDto
{
    public DateTime DataRiunione { get; set; }
    public string OraInizio { get; set; } = string.Empty;
    public string? OraFine { get; set; }
    public string? Luogo { get; set; }
    public string TipoRiunione { get; set; } = string.Empty;
    public string? Note { get; set; }
}

public class UpdateRiunioneDto
{
    public DateTime DataRiunione { get; set; }
    public string OraInizio { get; set; } = string.Empty;
    public string? OraFine { get; set; }
    public string? Luogo { get; set; }
    public string TipoRiunione { get; set; } = string.Empty;
    public string StatoVerbale { get; set; } = "Bozza";
    public string? Verbale { get; set; }
    public string? Note { get; set; }
}

public class AddPartecipazioneDto
{
    public int SocioId { get; set; }
    public bool Presente { get; set; } = true;
    public string? Ruolo { get; set; }
}

public class UpdatePartecipazioneDto
{
    public bool Presente { get; set; }
    public string? Ruolo { get; set; }
}

public class AddArgomentoDto
{
    public string Titolo { get; set; } = string.Empty;
    public string? Descrizione { get; set; }
}

// Cariche DTOs
public class CreateCaricaDto
{
    public string Nome { get; set; } = string.Empty;
    public string? Descrizione { get; set; }
    public int Ordine { get; set; }
}

public class UpdateCaricaDto
{
    public string Nome { get; set; } = string.Empty;
    public string? Descrizione { get; set; }
    public int Ordine { get; set; }
}

// Email DTOs
public class TestEmailRequest
{
    public string Email { get; set; } = string.Empty;
}

public class SendEmailRequest
{
    public string Subject { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
}

public class SendCustomEmailRequest
{
    public string Email { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
}

// Users DTOs
public class UpdateRoleRequest
{
    public string Ruolo { get; set; } = string.Empty;
}

public class UpdateStatusRequest
{
    public bool Attivo { get; set; }
}
