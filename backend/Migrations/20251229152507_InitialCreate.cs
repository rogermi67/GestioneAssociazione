using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace AssociazioneETS.API.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "cariche",
                columns: table => new
                {
                    carica_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    nome = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    descrizione = table.Column<string>(type: "text", nullable: true),
                    ordine = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_cariche", x => x.carica_id);
                });

            migrationBuilder.CreateTable(
                name: "eventi",
                columns: table => new
                {
                    evento_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    titolo = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    descrizione = table.Column<string>(type: "text", nullable: true),
                    data_inizio = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    data_fine = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    luogo = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    tipo_evento = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    stato = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    budget = table.Column<decimal>(type: "numeric(10,2)", nullable: true),
                    spese_effettive = table.Column<decimal>(type: "numeric(10,2)", nullable: true),
                    incassi = table.Column<decimal>(type: "numeric(10,2)", nullable: true),
                    note = table.Column<string>(type: "text", nullable: true),
                    immagine_url = table.Column<string>(type: "text", nullable: true),
                    pubblicato = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_eventi", x => x.evento_id);
                });

            migrationBuilder.CreateTable(
                name: "impostazioni",
                columns: table => new
                {
                    chiave = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    valore = table.Column<string>(type: "text", nullable: true),
                    descrizione = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_impostazioni", x => x.chiave);
                });

            migrationBuilder.CreateTable(
                name: "riunioni",
                columns: table => new
                {
                    riunione_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    data_riunione = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ora_inizio = table.Column<TimeSpan>(type: "interval", nullable: false),
                    ora_fine = table.Column<TimeSpan>(type: "interval", nullable: true),
                    luogo = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    tipo_riunione = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    note = table.Column<string>(type: "text", nullable: true),
                    verbale = table.Column<string>(type: "text", nullable: true),
                    numero_verbale = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    stato_verbale = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_riunioni", x => x.riunione_id);
                });

            migrationBuilder.CreateTable(
                name: "soci",
                columns: table => new
                {
                    socio_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    nome = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    cognome = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    codice_fiscale = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    data_nascita = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    indirizzo = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    telefono = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    email = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    data_iscrizione = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    carica_id = table.Column<int>(type: "integer", nullable: true),
                    stato_socio = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    data_cessazione = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    note = table.Column<string>(type: "text", nullable: true),
                    foto_url = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_soci", x => x.socio_id);
                    table.ForeignKey(
                        name: "FK_soci_cariche_carica_id",
                        column: x => x.carica_id,
                        principalTable: "cariche",
                        principalColumn: "carica_id");
                });

            migrationBuilder.CreateTable(
                name: "argomenti_riunione",
                columns: table => new
                {
                    argomento_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    riunione_id = table.Column<int>(type: "integer", nullable: false),
                    titolo = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    descrizione = table.Column<string>(type: "text", nullable: true),
                    ordine = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_argomenti_riunione", x => x.argomento_id);
                    table.ForeignKey(
                        name: "FK_argomenti_riunione_riunioni_riunione_id",
                        column: x => x.riunione_id,
                        principalTable: "riunioni",
                        principalColumn: "riunione_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "documenti",
                columns: table => new
                {
                    documento_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    socio_id = table.Column<int>(type: "integer", nullable: false),
                    tipo_documento = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    nome_file = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    path_file = table.Column<string>(type: "text", nullable: false),
                    data_caricamento = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    data_scadenza = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_documenti", x => x.documento_id);
                    table.ForeignKey(
                        name: "FK_documenti_soci_socio_id",
                        column: x => x.socio_id,
                        principalTable: "soci",
                        principalColumn: "socio_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "partecipazioni_eventi",
                columns: table => new
                {
                    partecipazione_evento_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    evento_id = table.Column<int>(type: "integer", nullable: false),
                    socio_id = table.Column<int>(type: "integer", nullable: false),
                    ruolo = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    note = table.Column<string>(type: "text", nullable: true),
                    data_iscrizione = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    confermato = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_partecipazioni_eventi", x => x.partecipazione_evento_id);
                    table.ForeignKey(
                        name: "FK_partecipazioni_eventi_eventi_evento_id",
                        column: x => x.evento_id,
                        principalTable: "eventi",
                        principalColumn: "evento_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_partecipazioni_eventi_soci_socio_id",
                        column: x => x.socio_id,
                        principalTable: "soci",
                        principalColumn: "socio_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "partecipazioni_riunioni",
                columns: table => new
                {
                    partecipazione_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    riunione_id = table.Column<int>(type: "integer", nullable: false),
                    socio_id = table.Column<int>(type: "integer", nullable: false),
                    presente = table.Column<bool>(type: "boolean", nullable: false),
                    ruolo = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_partecipazioni_riunioni", x => x.partecipazione_id);
                    table.ForeignKey(
                        name: "FK_partecipazioni_riunioni_riunioni_riunione_id",
                        column: x => x.riunione_id,
                        principalTable: "riunioni",
                        principalColumn: "riunione_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_partecipazioni_riunioni_soci_socio_id",
                        column: x => x.socio_id,
                        principalTable: "soci",
                        principalColumn: "socio_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "soci_cariche",
                columns: table => new
                {
                    socio_carica_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    socio_id = table.Column<int>(type: "integer", nullable: false),
                    carica_id = table.Column<int>(type: "integer", nullable: false),
                    data_inizio = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    data_fine = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    note = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_soci_cariche", x => x.socio_carica_id);
                    table.ForeignKey(
                        name: "FK_soci_cariche_cariche_carica_id",
                        column: x => x.carica_id,
                        principalTable: "cariche",
                        principalColumn: "carica_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_soci_cariche_soci_socio_id",
                        column: x => x.socio_id,
                        principalTable: "soci",
                        principalColumn: "socio_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    user_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    username = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    email = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    password_hash = table.Column<string>(type: "text", nullable: false),
                    nome = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    cognome = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    socio_id = table.Column<int>(type: "integer", nullable: true),
                    ruolo = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    attivo = table.Column<bool>(type: "boolean", nullable: false),
                    ultimo_accesso = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_users", x => x.user_id);
                    table.ForeignKey(
                        name: "FK_users_soci_socio_id",
                        column: x => x.socio_id,
                        principalTable: "soci",
                        principalColumn: "socio_id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "delibere_riunioni",
                columns: table => new
                {
                    delibera_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    riunione_id = table.Column<int>(type: "integer", nullable: false),
                    argomento_id = table.Column<int>(type: "integer", nullable: true),
                    numero_delibera = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    oggetto = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    testo = table.Column<string>(type: "text", nullable: true),
                    esito = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    voti_favorevoli = table.Column<int>(type: "integer", nullable: true),
                    voti_contrari = table.Column<int>(type: "integer", nullable: true),
                    voti_astenuti = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_delibere_riunioni", x => x.delibera_id);
                    table.ForeignKey(
                        name: "FK_delibere_riunioni_argomenti_riunione_argomento_id",
                        column: x => x.argomento_id,
                        principalTable: "argomenti_riunione",
                        principalColumn: "argomento_id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_delibere_riunioni_riunioni_riunione_id",
                        column: x => x.riunione_id,
                        principalTable: "riunioni",
                        principalColumn: "riunione_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "notifiche",
                columns: table => new
                {
                    notifica_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    user_id = table.Column<int>(type: "integer", nullable: false),
                    tipo_notifica = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    titolo = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    messaggio = table.Column<string>(type: "text", nullable: false),
                    link = table.Column<string>(type: "text", nullable: true),
                    letta = table.Column<bool>(type: "boolean", nullable: false),
                    data_lettura = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    data_invio = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    data_scadenza = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    riferimento_id = table.Column<int>(type: "integer", nullable: true),
                    riferimento_tipo = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_notifiche", x => x.notifica_id);
                    table.ForeignKey(
                        name: "FK_notifiche_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "cariche",
                columns: new[] { "carica_id", "descrizione", "nome", "ordine" },
                values: new object[,]
                {
                    { 1, "Presidente dell'associazione", "Presidente", 1 },
                    { 2, "Vice Presidente dell'associazione", "Vice Presidente", 2 },
                    { 3, "Segretario dell'associazione", "Segretario", 3 },
                    { 4, "Tesoriere dell'associazione", "Tesoriere", 4 },
                    { 5, "Membro del consiglio", "Consigliere", 5 },
                    { 6, "Socio fondatore", "Socio Fondatore", 6 },
                    { 7, "Revisore dei conti", "Revisore dei Conti", 7 }
                });

            migrationBuilder.CreateIndex(
                name: "IX_argomenti_riunione_riunione_id",
                table: "argomenti_riunione",
                column: "riunione_id");

            migrationBuilder.CreateIndex(
                name: "IX_delibere_riunioni_argomento_id",
                table: "delibere_riunioni",
                column: "argomento_id");

            migrationBuilder.CreateIndex(
                name: "IX_delibere_riunioni_riunione_id",
                table: "delibere_riunioni",
                column: "riunione_id");

            migrationBuilder.CreateIndex(
                name: "IX_documenti_socio_id",
                table: "documenti",
                column: "socio_id");

            migrationBuilder.CreateIndex(
                name: "IX_impostazioni_chiave",
                table: "impostazioni",
                column: "chiave",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_notifiche_user_id",
                table: "notifiche",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_partecipazioni_eventi_evento_id",
                table: "partecipazioni_eventi",
                column: "evento_id");

            migrationBuilder.CreateIndex(
                name: "IX_partecipazioni_eventi_socio_id",
                table: "partecipazioni_eventi",
                column: "socio_id");

            migrationBuilder.CreateIndex(
                name: "IX_partecipazioni_riunioni_riunione_id",
                table: "partecipazioni_riunioni",
                column: "riunione_id");

            migrationBuilder.CreateIndex(
                name: "IX_partecipazioni_riunioni_socio_id",
                table: "partecipazioni_riunioni",
                column: "socio_id");

            migrationBuilder.CreateIndex(
                name: "IX_soci_carica_id",
                table: "soci",
                column: "carica_id");

            migrationBuilder.CreateIndex(
                name: "IX_soci_codice_fiscale",
                table: "soci",
                column: "codice_fiscale",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_soci_cariche_carica_id",
                table: "soci_cariche",
                column: "carica_id");

            migrationBuilder.CreateIndex(
                name: "IX_soci_cariche_socio_id",
                table: "soci_cariche",
                column: "socio_id");

            migrationBuilder.CreateIndex(
                name: "IX_users_email",
                table: "users",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_users_socio_id",
                table: "users",
                column: "socio_id");

            migrationBuilder.CreateIndex(
                name: "IX_users_username",
                table: "users",
                column: "username",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "delibere_riunioni");

            migrationBuilder.DropTable(
                name: "documenti");

            migrationBuilder.DropTable(
                name: "impostazioni");

            migrationBuilder.DropTable(
                name: "notifiche");

            migrationBuilder.DropTable(
                name: "partecipazioni_eventi");

            migrationBuilder.DropTable(
                name: "partecipazioni_riunioni");

            migrationBuilder.DropTable(
                name: "soci_cariche");

            migrationBuilder.DropTable(
                name: "argomenti_riunione");

            migrationBuilder.DropTable(
                name: "users");

            migrationBuilder.DropTable(
                name: "eventi");

            migrationBuilder.DropTable(
                name: "riunioni");

            migrationBuilder.DropTable(
                name: "soci");

            migrationBuilder.DropTable(
                name: "cariche");
        }
    }
}
