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
var connectionString = builder.Configuration["DATABASE_URL"] 
    ?? builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

// Application Services
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ISociService, SociService>();
builder.Services.AddScoped<IRiunioniService, RiunioniService>();
builder.Services.AddScoped<IEventiService, EventiService>();

// CORS
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

// BUILD APP - IMPORTANTISSIMO!
var app = builder.Build();

// Auto-run migrations
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    
    // Debug dettagliato
    Console.WriteLine($"🔍 connectionString variable: '{connectionString}'");
    Console.WriteLine($"🔍 connectionString length: {connectionString?.Length ?? 0}");
    Console.WriteLine($"🔍 DATABASE_URL from config: '{builder.Configuration["DATABASE_URL"]}'");
    Console.WriteLine($"🔍 DefaultConnection from config: '{builder.Configuration.GetConnectionString("DefaultConnection")}'");
    
    // Prova a ottenere la connessione dal DbContext
    var actualConnString = db.Database.GetConnectionString();
    Console.WriteLine($"🔍 Actual DbContext connection string: '{actualConnString}'");
    Console.WriteLine($"🔍 Actual length: {actualConnString?.Length ?? 0}");
    
    try 
    {
        Console.WriteLine("🔄 Applying database migrations...");
        db.Database.Migrate();
        Console.WriteLine("✅ Database migrations applied successfully");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"❌ Migration error: {ex.Message}");
    }
}

// Middleware CORS
app.Use(async (context, next) =>
{
    var origin = context.Request.Headers["Origin"].ToString();
    
    if (origin == "https://gestione-associazione.vercel.app" || origin.Contains("localhost"))
    {
        context.Response.OnStarting(() => {
            context.Response.Headers.Add("Access-Control-Allow-Origin", origin);
            context.Response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            context.Response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, Authorization");
            context.Response.Headers.Add("Access-Control-Allow-Credentials", "true");
            return Task.CompletedTask;
        });
    }
    
    if (context.Request.Method == "OPTIONS")
    {
        context.Response.StatusCode = 204;
        return;
    }
    
    await next();
});

app.UseSwagger();
app.UseSwaggerUI();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.MapGet("/", () => new { 
    status = "online", 
    app = "Gestionale ETS API",
    version = "1.0"
});

app.Run();