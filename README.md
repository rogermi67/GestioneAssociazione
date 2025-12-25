# Gestionale Associazione ETS

Sistema completo per la gestione di associazioni ETS con gestione soci, riunioni, eventi e notifiche.

## 🚀 Stack Tecnologico

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: ASP.NET Core 8 Web API
- **Database**: PostgreSQL (Railway)
- **Storage**: Supabase Storage (documenti)
- **Deploy**: Vercel (frontend) + Railway (backend)
- **Notifiche**: Resend (email)

## 📋 Funzionalità

### Gestione Soci
- ✅ Anagrafica completa
- ✅ Upload documenti (CI, tessere)
- ✅ Gestione cariche e ruoli
- ✅ Scadenzario tessere
- ✅ Export Excel/PDF

### Gestione Riunioni
- ✅ Verbali con presenze
- ✅ Ordine del giorno
- ✅ Delibere e votazioni
- ✅ Generazione PDF verbale
- ✅ Storico completo

### Gestione Eventi
- ✅ Calendario interattivo
- ✅ Assegnazione responsabili
- ✅ Budget e rendicontazione
- ✅ Lista partecipanti

### Notifiche
- ✅ Email convocazioni
- ✅ Reminder eventi
- ✅ Scadenze tessere
- ✅ Dashboard notifiche

## 🛠️ Setup Locale

### Prerequisiti
- .NET 8 SDK
- Node.js 18+
- PostgreSQL 15+ (o Docker)
- Git

### Installazione

```bash
# Clona il repository
git clone https://github.com/tuousername/associazione-ets.git
cd associazione-ets

# Setup Backend
cd backend
dotnet restore
dotnet ef database update

# Setup Frontend
cd ../frontend
npm install

# Avvia con Docker (opzionale)
cd ..
docker-compose up
```

### Variabili d'Ambiente

#### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/associazione_db
JWT_SECRET=your-super-secret-key-change-in-production
JWT_ISSUER=AssociazioneETS
JWT_AUDIENCE=AssociazioneETS
RESEND_API_KEY=re_your_api_key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-key
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## 🚀 Deploy

### Frontend su Vercel

1. Vai su [vercel.com](https://vercel.com) e fai login con GitHub
2. Importa il repository
3. Configura:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Aggiungi variabile d'ambiente:
   - `VITE_API_URL`: URL del backend Railway (step successivo)
5. Deploy!

### Backend su Railway

1. Vai su [railway.app](https://railway.app) e fai login con GitHub
2. New Project → Deploy from GitHub repo
3. Seleziona il repository
4. Configura:
   - **Root Directory**: `backend`
   - Aggiungi PostgreSQL database (New → Database → PostgreSQL)
5. Variabili d'ambiente:
   - Railway auto-genera `DATABASE_URL`
   - Aggiungi manualmente le altre variabili
6. Deploy automatico!

### Database Setup

Le migrations vengono eseguite automaticamente al primo avvio.

Se necessario, esegui manualmente:
```bash
cd backend
dotnet ef database update
```

## 📱 Uso dell'App

### Primo Accesso

1. Accedi all'URL Vercel
2. Registra il primo admin (primo utente = admin)
3. Completa il profilo associazione
4. Inizia ad aggiungere soci!

### PWA (Installazione Mobile)

Su mobile (Chrome/Safari):
1. Apri il sito
2. Menu → "Aggiungi a schermata Home"
3. L'app si installerà come app nativa!

## 🔒 Sicurezza

- ✅ HTTPS forzato (Vercel/Railway)
- ✅ Autenticazione JWT
- ✅ CORS configurato
- ✅ Rate limiting
- ✅ Validazione input
- ✅ SQL injection protection (EF Core)
- ✅ XSS protection
- ✅ GDPR compliant

## 💰 Costi (€0/mese)

- **Vercel**: Free tier (100GB bandwidth)
- **Railway**: $5 credito/mese incluso (copre uso associazione)
- **Supabase**: 1GB storage gratuito
- **Resend**: 3000 email/mese gratuite

**Totale: GRATIS** 🎉

## 📊 Limiti Free Tier

- Railway: 500 ore/mese (~16h/giorno)
- Database: 1GB storage
- Storage documenti: 1GB
- Email: 3000/mese

**Più che sufficiente per un'associazione!**

## 🆘 Troubleshooting

### Backend non parte
```bash
# Verifica variabili d'ambiente
cat backend/.env

# Verifica database
psql $DATABASE_URL

# Check migrations
cd backend && dotnet ef migrations list
```

### Frontend errori di build
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Database connection error
```bash
# Verifica stringa connessione
echo $DATABASE_URL

# Test connessione
psql $DATABASE_URL -c "SELECT version();"
```

## 📚 Documentazione API

Swagger UI disponibile su: `https://your-api.railway.app/swagger`

Endpoints principali:
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registrazione
- `GET /api/soci` - Lista soci
- `POST /api/riunioni` - Crea riunione
- `GET /api/eventi` - Lista eventi
- `POST /api/riunioni/{id}/pdf` - Genera PDF verbale

## 🤝 Contributi

Pull requests benvenute! Per modifiche importanti, apri prima una issue.

## 📄 Licenza

MIT License - Libero per uso associazioni non-profit

## 👨‍💻 Autore

Roberto Germiniani - AP Consulting

---

**Made with ❤️ for Associazione I Salionzesi ETS**
