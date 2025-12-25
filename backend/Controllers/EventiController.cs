using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using AssociazioneETS.API.Services;
using AssociazioneETS.API.DTOs;

namespace AssociazioneETS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EventiController : ControllerBase
{
    private readonly IEventiService _eventiService;

    public EventiController(IEventiService eventiService)
    {
        _eventiService = eventiService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<object>>> GetAll()
    {
        var eventi = await _eventiService.GetAllAsync();
        return Ok(new ApiResponse<object>(true, eventi, null));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<object>>> GetById(int id)
    {
        var evento = await _eventiService.GetByIdAsync(id);
        
        if (evento == null)
        {
            return NotFound(new ApiResponse<object>(false, null, "Evento non trovato"));
        }

        return Ok(new ApiResponse<object>(true, evento, null));
    }
}