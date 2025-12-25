using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using AssociazioneETS.API.DTOs;
using AssociazioneETS.API.Services;

namespace AssociazioneETS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<LoginResponse>>> Login([FromBody] LoginRequest request)
    {
        var result = await _authService.LoginAsync(request);

        if (result == null)
        {
            return Unauthorized(new ApiResponse<LoginResponse>(
                false, 
                null, 
                "Email o password non corretti"
            ));
        }

        return Ok(new ApiResponse<LoginResponse>(true, result, "Login effettuato con successo"));
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<LoginResponse>>> Register([FromBody] RegisterRequest request)
    {
        // Validazione
        if (string.IsNullOrWhiteSpace(request.Email) || 
            string.IsNullOrWhiteSpace(request.Password) ||
            string.IsNullOrWhiteSpace(request.Username))
        {
            return BadRequest(new ApiResponse<LoginResponse>(
                false, 
                null, 
                "Email, username e password sono obbligatori"
            ));
        }

        if (request.Password.Length < 6)
        {
            return BadRequest(new ApiResponse<LoginResponse>(
                false, 
                null, 
                "La password deve essere di almeno 6 caratteri"
            ));
        }

        if (await _authService.EmailExistsAsync(request.Email))
        {
            return BadRequest(new ApiResponse<LoginResponse>(
                false, 
                null, 
                "Email già registrata"
            ));
        }

        var result = await _authService.RegisterAsync(request);

        if (result == null)
        {
            return BadRequest(new ApiResponse<LoginResponse>(
                false, 
                null, 
                "Errore durante la registrazione"
            ));
        }

        return Ok(new ApiResponse<LoginResponse>(true, result, "Registrazione completata con successo"));
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<object>>> GetCurrentUser()
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
        
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
        {
            return Unauthorized(new ApiResponse<object>(false, null, "Token non valido"));
        }

        var user = await _authService.GetUserByIdAsync(userId);

        if (user == null)
        {
            return NotFound(new ApiResponse<object>(false, null, "Utente non trovato"));
        }

        var userInfo = new
        {
            user.UserId,
            user.Username,
            user.Email,
            user.Nome,
            user.Cognome,
            user.Ruolo,
            user.SocioId,
            user.UltimoAccesso
        };

        return Ok(new ApiResponse<object>(true, userInfo, null));
    }
}
