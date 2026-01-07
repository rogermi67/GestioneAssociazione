using Microsoft.EntityFrameworkCore;
using AssociazioneETS.API.Models;

namespace AssociazioneETS.API.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    // DbSets
    public DbSet<User> Users { get; set; }
    public DbSet<Socio> Soci { get; set; }
    public DbSet<Documento> Documenti { get; set; }
    public DbSet<Carica> Cariche { get; set; }
    public DbSet<SocioCarica> SociCariche { get; set; }
    public DbSet<Riunione> Riunioni { get; set; }
    public DbSet<PartecipazioneRiunione> PartecipazioniRiunioni { get; set; }
    public DbSet<ArgomentoRiunione> ArgomentiRiunione { get; set; }
    public DbSet<DeliberaRiunione> DelibereRiunione { get; set; }
    public DbSet<Evento> Eventi { get; set; }
    public DbSet<PartecipazioneEvento> PartecipazioniEventi { get; set; }
    public DbSet<Notifica> Notifiche { get; set; }
    public DbSet<Impostazione> Impostazioni { get; set; }
    public DbSet<PushSubscription> PushSubscriptions { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Indici unici
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Username)
            .IsUnique();

        modelBuilder.Entity<Socio>()
            .HasIndex(s => s.CodiceFiscale)
            .IsUnique();

        modelBuilder.Entity<Impostazione>()
            .HasIndex(i => i.Chiave)
            .IsUnique();

        // Relazioni
        modelBuilder.Entity<User>()
            .HasOne(u => u.Socio)
            .WithMany()
            .HasForeignKey(u => u.SocioId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Documento>()
            .HasOne(d => d.Socio)
            .WithMany(s => s.Documenti)
            .HasForeignKey(d => d.SocioId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<SocioCarica>()
            .HasOne(sc => sc.Socio)
            .WithMany(s => s.SociCariche)
            .HasForeignKey(sc => sc.SocioId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<SocioCarica>()
            .HasOne(sc => sc.Carica)
            .WithMany(c => c.SociCariche)
            .HasForeignKey(sc => sc.CaricaId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<PartecipazioneRiunione>()
            .HasOne(pr => pr.Riunione)
            .WithMany(r => r.Partecipazioni)
            .HasForeignKey(pr => pr.RiunioneId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<PartecipazioneRiunione>()
            .HasOne(pr => pr.Socio)
            .WithMany(s => s.PartecipazioniRiunioni)
            .HasForeignKey(pr => pr.SocioId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ArgomentoRiunione>()
            .HasOne(ar => ar.Riunione)
            .WithMany(r => r.Argomenti)
            .HasForeignKey(ar => ar.RiunioneId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<DeliberaRiunione>()
            .HasOne(dr => dr.Riunione)
            .WithMany(r => r.Delibere)
            .HasForeignKey(dr => dr.RiunioneId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<DeliberaRiunione>()
            .HasOne(dr => dr.Argomento)
            .WithMany(a => a.Delibere)
            .HasForeignKey(dr => dr.ArgomentoId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<PartecipazioneEvento>()
            .HasOne(pe => pe.Evento)
            .WithMany(e => e.Partecipazioni)
            .HasForeignKey(pe => pe.EventoId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<PartecipazioneEvento>()
            .HasOne(pe => pe.Socio)
            .WithMany(s => s.PartecipazioniEventi)
            .HasForeignKey(pe => pe.SocioId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Notifica>()
            .HasOne(n => n.User)
            .WithMany()
            .HasForeignKey(n => n.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Seed data iniziale
        SeedData(modelBuilder);
    }

    private void SeedData(ModelBuilder modelBuilder)
    {
        // Cariche predefinite
        modelBuilder.Entity<Carica>().HasData(
            new Carica { CaricaId = 1, Nome = "Presidente", Descrizione = "Presidente dell'associazione", Ordine = 1 },
            new Carica { CaricaId = 2, Nome = "Vice Presidente", Descrizione = "Vice Presidente dell'associazione", Ordine = 2 },
            new Carica { CaricaId = 3, Nome = "Segretario", Descrizione = "Segretario dell'associazione", Ordine = 3 },
            new Carica { CaricaId = 4, Nome = "Tesoriere", Descrizione = "Tesoriere dell'associazione", Ordine = 4 },
            new Carica { CaricaId = 5, Nome = "Consigliere", Descrizione = "Membro del consiglio", Ordine = 5 },
            new Carica { CaricaId = 6, Nome = "Socio Fondatore", Descrizione = "Socio fondatore", Ordine = 6 },
            new Carica { CaricaId = 7, Nome = "Revisore dei Conti", Descrizione = "Revisore dei conti", Ordine = 7 }
        );

        // Impostazioni predefinite - RIMOSSO perché la tabella usa SQL seed data
    }

    public override int SaveChanges()
    {
        UpdateTimestamps();
        return base.SaveChanges();
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        UpdateTimestamps();
        return base.SaveChangesAsync(cancellationToken);
    }

    private void UpdateTimestamps()
    {
        var entries = ChangeTracker.Entries()
            .Where(e => e.State == EntityState.Added || e.State == EntityState.Modified);

        foreach (var entry in entries)
        {
            if (entry.Entity.GetType().GetProperty("UpdatedAt") != null)
            {
                entry.Property("UpdatedAt").CurrentValue = DateTime.UtcNow;
            }

            if (entry.State == EntityState.Added && 
                entry.Entity.GetType().GetProperty("CreatedAt") != null)
            {
                entry.Property("CreatedAt").CurrentValue = DateTime.UtcNow;
            }
        }
    }
}
