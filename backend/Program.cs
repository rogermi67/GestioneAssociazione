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
// Database - Converti URI PostgreSQL in formato Npgsql
// Database - Npgsql supporta URI PostgreSQL nativamente!
// Database - Converti URI a formato Npgsql con gestione porta
var databaseUrl = builder.Configuration["DATABASE_URL"] 
    ?? builder.Configuration.GetConnectionString("DefaultConnection");

string connectionString;
if (!string.IsNullOrEmpty(databaseUrl) && databaseUrl.StartsWith("postgresql://"))
{
    var uri = new Uri(databaseUrl);
    var port = uri.Port > 0 ? uri.Port : 5432; // Default PostgreSQL port
    var userInfo = uri.UserInfo.Split(':');
    connectionString = $"Host={uri.Host};Port={port};Database={uri.AbsolutePath.TrimStart('/')};Username={userInfo[0]};Password={userInfo[1]};SSL Mode=Require;Trust Server Certificate=true";
}
else
{
    connectionString = databaseUrl;
}

AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

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
policy.WithOrigins(
    "https://gestione-associazione.vercel.app",
    "https://gestione-associazione-git-main-rogermis-projects.vercel.app",
    "https://gestione-associazione-5niez4thy-rogermis-projects.vercel.app"
)
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

// Apply migrations automatically on startup
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<ApplicationDbContext>();
        context.Database.Migrate();
        Console.WriteLine("✅ Database migrations applied successfully");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"❌ Error applying migrations: {ex.Message}");
    }
}

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