using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace AssociazioneETS.API.Migrations
{
    /// <inheritdoc />
    public partial class AggiuntaCollaboratoriTodoDocumenti : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Collaboratori",
                columns: table => new
                {
                    CollaboratoreId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nome = table.Column<string>(type: "text", nullable: false),
                    Cognome = table.Column<string>(type: "text", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: true),
                    Telefono = table.Column<string>(type: "text", nullable: true),
                    Azienda = table.Column<string>(type: "text", nullable: true),
                    Note = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Collaboratori", x => x.CollaboratoreId);
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
                    data_caricamento = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    data_scadenza = table.Column<DateTime>(type: "timestamp without time zone", nullable: true)
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
                name: "DocumentiEventi",
                columns: table => new
                {
                    DocumentoEventoId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    EventoId = table.Column<int>(type: "integer", nullable: false),
                    NomeFile = table.Column<string>(type: "text", nullable: false),
                    TipoFile = table.Column<string>(type: "text", nullable: false),
                    PathFile = table.Column<string>(type: "text", nullable: false),
                    Dimensione = table.Column<long>(type: "bigint", nullable: false),
                    UploadedBy = table.Column<int>(type: "integer", nullable: true),
                    UploadedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DocumentiEventi", x => x.DocumentoEventoId);
                    table.ForeignKey(
                        name: "FK_DocumentiEventi_eventi_EventoId",
                        column: x => x.EventoId,
                        principalTable: "eventi",
                        principalColumn: "evento_id",
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
                    data_lettura = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    data_invio = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    data_scadenza = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
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

            migrationBuilder.CreateTable(
                name: "soci_cariche",
                columns: table => new
                {
                    socio_carica_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    socio_id = table.Column<int>(type: "integer", nullable: false),
                    carica_id = table.Column<int>(type: "integer", nullable: false),
                    data_inizio = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    data_fine = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
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
                name: "TodoEventi",
                columns: table => new
                {
                    TodoEventoId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    EventoId = table.Column<int>(type: "integer", nullable: false),
                    Titolo = table.Column<string>(type: "text", nullable: false),
                    Descrizione = table.Column<string>(type: "text", nullable: true),
                    Scadenza = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    Stato = table.Column<string>(type: "text", nullable: false),
                    Priorita = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TodoEventi", x => x.TodoEventoId);
                    table.ForeignKey(
                        name: "FK_TodoEventi_eventi_EventoId",
                        column: x => x.EventoId,
                        principalTable: "eventi",
                        principalColumn: "evento_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AssegnazioniTodo",
                columns: table => new
                {
                    AssegnazioneId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TodoEventoId = table.Column<int>(type: "integer", nullable: false),
                    SocioId = table.Column<int>(type: "integer", nullable: true),
                    CollaboratoreId = table.Column<int>(type: "integer", nullable: true),
                    AssegnatoIl = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AssegnazioniTodo", x => x.AssegnazioneId);
                    table.ForeignKey(
                        name: "FK_AssegnazioniTodo_Collaboratori_CollaboratoreId",
                        column: x => x.CollaboratoreId,
                        principalTable: "Collaboratori",
                        principalColumn: "CollaboratoreId");
                    table.ForeignKey(
                        name: "FK_AssegnazioniTodo_TodoEventi_TodoEventoId",
                        column: x => x.TodoEventoId,
                        principalTable: "TodoEventi",
                        principalColumn: "TodoEventoId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AssegnazioniTodo_soci_SocioId",
                        column: x => x.SocioId,
                        principalTable: "soci",
                        principalColumn: "socio_id");
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
                name: "IX_AssegnazioniTodo_CollaboratoreId",
                table: "AssegnazioniTodo",
                column: "CollaboratoreId");

            migrationBuilder.CreateIndex(
                name: "IX_AssegnazioniTodo_SocioId",
                table: "AssegnazioniTodo",
                column: "SocioId");

            migrationBuilder.CreateIndex(
                name: "IX_AssegnazioniTodo_TodoEventoId",
                table: "AssegnazioniTodo",
                column: "TodoEventoId");

            migrationBuilder.CreateIndex(
                name: "IX_documenti_socio_id",
                table: "documenti",
                column: "socio_id");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentiEventi_EventoId",
                table: "DocumentiEventi",
                column: "EventoId");

            migrationBuilder.CreateIndex(
                name: "IX_notifiche_user_id",
                table: "notifiche",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_soci_cariche_carica_id",
                table: "soci_cariche",
                column: "carica_id");

            migrationBuilder.CreateIndex(
                name: "IX_soci_cariche_socio_id",
                table: "soci_cariche",
                column: "socio_id");

            migrationBuilder.CreateIndex(
                name: "IX_TodoEventi_EventoId",
                table: "TodoEventi",
                column: "EventoId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AssegnazioniTodo");

            migrationBuilder.DropTable(
                name: "documenti");

            migrationBuilder.DropTable(
                name: "DocumentiEventi");

            migrationBuilder.DropTable(
                name: "notifiche");

            migrationBuilder.DropTable(
                name: "soci_cariche");

            migrationBuilder.DropTable(
                name: "Collaboratori");

            migrationBuilder.DropTable(
                name: "TodoEventi");
        }
    }
}
