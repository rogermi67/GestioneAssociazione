using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using AssociazioneETS.API.Data;
using AssociazioneETS.API.Services;

var builder = WebApplication.CreateBuilder(args);

// Services
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Application Services
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ISociService, SociService>();
builder.Services.AddScoped<IRiunioniService, RiunioniService>();
builder.Services.AddScoped<IEventiService, EventiService>();

// CORS - Configurazione semplice e permissiva
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("https://gestione-associazione.vercel.app", "http://localhost:5173")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// JWT
var jwtKey = builder.Configuration["Jwt:Key"];
var key = Encoding.ASCII.GetBytes(jwtKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        ClockSkew = TimeSpan.Zero
    };
});

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    
    // Log della connection string (primi 50 caratteri per debug)
    var connString = builder.Configuration.GetConnectionString("DefaultConnection");
    Console.WriteLine($"🔍 Using connection string: {connString?.Substring(0, Math.Min(50, connString.Length ?? 0))}...");
    
    try 
    {
        Console.WriteLine("🔄 Applying database migrations...");
        db.Database.Migrate();
        Console.WriteLine("✅ Database migrations applied successfully");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"❌ Migration error: {ex.Message}");
        Console.WriteLine($"Stack trace: {ex.StackTrace}");
    }
}

// Middleware OPTIONS - DEVE essere il PRIMO!
// Middleware CORS globale - headers su OGNI risposta
app.Use(async (context, next) =>
{
    var origin = context.Request.Headers["Origin"].ToString();
    
    if (origin == "https://gestione-associazione.vercel.app" || origin.Contains("localhost"))
    {
        // Aggiungi headers CORS a TUTTE le risposte
        context.Response.OnStarting(() => {
            context.Response.Headers.Add("Access-Control-Allow-Origin", origin);
            context.Response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            context.Response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, Authorization");
            context.Response.Headers.Add("Access-Control-Allow-Credentials", "true");
            return Task.CompletedTask;
        });
    }
    
    // Se è OPTIONS, rispondi subito
    if (context.Request.Method == "OPTIONS")
    {
        context.Response.StatusCode = 204;
        return;
    }
    
    await next();
});

// Middleware pipeline - ORDINE CRITICO!
app.UseSwagger();
app.UseSwaggerUI();

app.UseCors(); // Usa la policy di default

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.MapGet("/", () => new { 
    status = "online", 
    app = "Gestionale ETS API",
    version = "1.0"
});

app.Run();