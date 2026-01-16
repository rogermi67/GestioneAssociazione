-- Collaboratori
CREATE TABLE IF NOT EXISTS collaboratori (
    collaboratore_id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cognome VARCHAR(100) NOT NULL,
    email VARCHAR(200),
    telefono VARCHAR(50),
    azienda VARCHAR(200),
    note TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Todo Eventi
CREATE TABLE IF NOT EXISTS todo_eventi (
    todo_evento_id SERIAL PRIMARY KEY,
    evento_id INTEGER NOT NULL REFERENCES eventi(evento_id) ON DELETE CASCADE,
    titolo VARCHAR(200) NOT NULL,
    descrizione TEXT,
    scadenza TIMESTAMP,
    stato VARCHAR(50) NOT NULL DEFAULT 'Da fare',
    priorita VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP
);

-- Assegnazioni Todo
CREATE TABLE IF NOT EXISTS assegnazioni_todo (
    assegnazione_id SERIAL PRIMARY KEY,
    todo_evento_id INTEGER NOT NULL REFERENCES todo_eventi(todo_evento_id) ON DELETE CASCADE,
    socio_id INTEGER REFERENCES soci(socio_id) ON DELETE CASCADE,
    collaboratore_id INTEGER REFERENCES collaboratori(collaboratore_id) ON DELETE CASCADE,
    assegnato_il TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Documenti Eventi
CREATE TABLE IF NOT EXISTS documenti_eventi (
    documento_evento_id SERIAL PRIMARY KEY,
    evento_id INTEGER NOT NULL REFERENCES eventi(evento_id) ON DELETE CASCADE,
    nome_file VARCHAR(255) NOT NULL,
    tipo_file VARCHAR(100) NOT NULL,
    path_file VARCHAR(500) NOT NULL,
    dimensione BIGINT NOT NULL,
    uploaded_by INTEGER,
    uploaded_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Registra la migration come applicata
INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20250116000000_AggiuntaCollaboratoriTodoDocumenti', '8.0.0')
ON CONFLICT DO NOTHING;