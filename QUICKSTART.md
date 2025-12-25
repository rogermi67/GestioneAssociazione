# 🚀 Quick Start - Sviluppo Locale

Guida rapida per avviare il progetto in locale.

## 📋 Prerequisiti

- **.NET 8 SDK**: [Download](https://dotnet.microsoft.com/download/dotnet/8.0)
- **Node.js 18+**: [Download](https://nodejs.org/)
- **PostgreSQL 15+**: [Download](https://www.postgresql.org/download/)
  - Oppure usa Docker (consigliato)

## 🐳 Opzione 1: Usa Docker (Consigliato)

Il modo più semplice per iniziare!

```bash
# Assicurati di avere Docker installato
docker --version

# Avvia tutto con un comando
docker-compose up

# Il sistema sarà disponibile su:
# - Frontend: http://localhost:5173
# - Backend: http://localhost:5000
# - Database: localhost:5432
# - pgAdmin: http://localhost:5050
```

**Credenziali pgAdmin:**
- Email: `admin@associazione.it`
- Password: `admin123`

## 💻 Opzione 2: Setup Manuale

### Step 1: Clone & Setup Database

```bash
# Clone il repository
git clone https://github.com/tuousername/associazione-ets.git
cd associazione-ets

# Crea database PostgreSQL
psql -U postgres
CREATE DATABASE associazione_db;
\q
```

### Step 2: Backend Setup

```bash
cd backend

# Copia .env.example in .env
cp .env.example .env

# Modifica .env con le tue credenziali
# DATABASE_URL=Host=localhost;Port=5432;Database=associazione_db;Username=postgres;Password=tua_password

# Installa dipendenze
dotnet restore

# Crea/Applica migrations
dotnet ef database update

# Avvia backend
dotnet run

# Backend disponibile su: http://localhost:5000
# Swagger: http://localhost:5000/swagger
```

### Step 3: Frontend Setup

```bash
# Apri un nuovo terminale
cd frontend

# Installa dipendenze
npm install

# Crea file .env
echo "VITE_API_URL=http://localhost:5000/api" > .env

# Avvia frontend
npm run dev

# Frontend disponibile su: http://localhost:5173
```

## ✅ Verifica Installazione

### 1. Testa Backend

Apri il browser: http://localhost:5000/swagger

✅ Dovresti vedere la documentazione API

### 2. Testa Frontend

Apri il browser: http://localhost:5173

✅ Dovresti vedere la pagina di login

### 3. Crea Primo Utente

1. Click "Registrati"
2. Compila il form:
   - Username: `admin`
   - Email: `admin@associazione.it`
   - Password: `password123`
   - Nome: `Mario`
   - Cognome: `Rossi`
3. Click "Registrati"

**🎉 Il primo utente diventa automaticamente Admin!**

### 4. Test Completo

1. Login con le credenziali appena create
2. Vai in "Soci"
3. Click "Nuovo Socio"
4. Compila il form e salva
5. Verifica che il socio appaia in lista

**✅ Tutto funziona!**

## 🔄 Comandi Utili

### Backend

```bash
# Avvia in modalità watch (auto-reload)
dotnet watch run

# Crea nuova migration
dotnet ef migrations add NomeMigration

# Applica migrations
dotnet ef database update

# Rollback ultima migration
dotnet ef database update PreviousMigrationName

# Drop database
dotnet ef database drop

# Lista migrations
dotnet ef migrations list
```

### Frontend

```bash
# Sviluppo
npm run dev

# Build produzione
npm run build

# Preview build
npm run preview

# Lint
npm run lint
```

### Docker

```bash
# Avvia tutto
docker-compose up

# Avvia in background
docker-compose up -d

# Stop
docker-compose down

# Stop e rimuovi volumi
docker-compose down -v

# Rebuild
docker-compose up --build

# Logs
docker-compose logs -f

# Logs solo backend
docker-compose logs -f backend
```

## 🗄️ Database Tools

### Connessione pgAdmin

Se usi Docker, pgAdmin è già disponibile su http://localhost:5050

**Aggiungi Server:**
1. Right-click "Servers" → "Create" → "Server"
2. General Tab:
   - Name: `Associazione DB`
3. Connection Tab:
   - Host: `postgres` (se Docker) o `localhost`
   - Port: `5432`
   - Database: `associazione_db`
   - Username: `postgres`
   - Password: `postgres123`

### Query Utili

```sql
-- Conta soci
SELECT COUNT(*) FROM soci;

-- Lista ultimi 5 soci
SELECT * FROM soci ORDER BY created_at DESC LIMIT 5;

-- Conta riunioni per mese
SELECT 
  DATE_TRUNC('month', data_riunione) as mese,
  COUNT(*) as totale
FROM riunioni
GROUP BY mese
ORDER BY mese DESC;

-- Soci attivi con cariche
SELECT 
  s.nome || ' ' || s.cognome as socio,
  c.nome as carica
FROM soci s
JOIN soci_cariche sc ON s.socio_id = sc.socio_id
JOIN cariche c ON sc.carica_id = c.carica_id
WHERE s.stato_socio = 'Attivo'
  AND sc.data_fine IS NULL;
```

## 🐛 Troubleshooting

### Errore "Port già in uso"

```bash
# Backend (porta 5000)
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill -9

# Frontend (porta 5173)
lsof -ti:5173 | xargs kill -9
```

### Database connection error

```bash
# Verifica che PostgreSQL sia avviato
# Windows
services.msc  # Cerca PostgreSQL

# Linux
sudo systemctl status postgresql

# Mac
brew services list
```

### Frontend non si connette al backend

Verifica il file `.env` nel frontend:
```bash
VITE_API_URL=http://localhost:5000/api
```

Nota: Deve finire con `/api`!

### Migrations error

```bash
# Rimuovi tutte le migrations
rm -rf backend/Migrations

# Ricrea migrations
cd backend
dotnet ef migrations add InitialCreate
dotnet ef database update
```

## 📚 Prossimi Passi

1. ✅ Familiarizza con il codice in `backend/` e `frontend/src/`
2. ✅ Esplora l'API con Swagger
3. ✅ Personalizza i modelli in `backend/Models/`
4. ✅ Modifica l'UI in `frontend/src/pages/`
5. ✅ Leggi `DEPLOY.md` quando sei pronto per il deploy

## 🆘 Serve Aiuto?

- 📖 Documentazione completa: `README.md`
- 🚀 Guida deploy: `DEPLOY.md`
- 🐛 Problemi: Apri una issue su GitHub

---

**Buon sviluppo! 🎉**
