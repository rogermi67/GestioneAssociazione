# 🚀 Guida al Deploy - Associazione ETS

Guida completa per deployare il progetto **gratuitamente** su Railway (backend) e Vercel (frontend).

## 📋 Prerequisiti

- Account GitHub (gratuito)
- Account Railway (gratuito)
- Account Vercel (gratuito)
- Account Supabase (gratuito) - per storage documenti
- Account Resend (gratuito) - per email

---

## 🎯 FASE 1: Preparazione Repository GitHub

### 1.1 Crea Repository su GitHub

```bash
# Inizializza Git
cd associazione-ets
git init
git add .
git commit -m "Initial commit - Gestionale Associazione ETS"

# Crea repository su GitHub e collegalo
git remote add origin https://github.com/TUO-USERNAME/associazione-ets.git
git branch -M main
git push -u origin main
```

---

## 🗄️ FASE 2: Setup Database (Railway)

### 2.1 Crea Database PostgreSQL

1. Vai su [railway.app](https://railway.app)
2. Login con GitHub
3. Click **"New Project"**
4. Seleziona **"Provision PostgreSQL"**
5. Il database viene creato automaticamente

### 2.2 Ottieni Connection String

1. Click sul database appena creato
2. Vai in **"Variables"**
3. Copia il valore di **`DATABASE_URL`**
4. Formato: `postgresql://user:pass@host:port/db`

**⚠️ IMPORTANTE**: Salva questa stringa, ti servirà dopo!

---

## 🔧 FASE 3: Deploy Backend (Railway)

### 3.1 Deploy da GitHub

1. In Railway, click **"New"** → **"GitHub Repo"**
2. Seleziona il repository `associazione-ets`
3. Railway rileverà automaticamente il progetto .NET

### 3.2 Configura Root Directory

1. Vai in **"Settings"**
2. Cerca **"Root Directory"**
3. Imposta: `backend`
4. Save

### 3.3 Aggiungi Variabili d'Ambiente

1. Vai in **"Variables"**
2. Aggiungi le seguenti variabili:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=IL-TUO-SEGRETO-MINIMO-32-CARATTERI-MOLTO-SICURO
JWT_ISSUER=AssociazioneETS
JWT_AUDIENCE=AssociazioneETS
ASPNETCORE_ENVIRONMENT=Production
```

**Come generare JWT_SECRET:**
```bash
# Linux/Mac
openssl rand -base64 32

# Windows PowerShell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
```

### 3.4 Ottieni URL Backend

1. Vai in **"Settings"** → **"Domains"**
2. Click **"Generate Domain"**
3. Copia l'URL (es: `https://associazione-ets-production.up.railway.app`)

**⚠️ SALVALO**: Ti serve per il frontend!

### 3.5 Verifica Deploy

Apri il browser e vai a:
```
https://tuo-backend.railway.app/swagger
```

Dovresti vedere la documentazione Swagger delle API! ✅

---

## 🎨 FASE 4: Deploy Frontend (Vercel)

### 4.1 Importa Progetto

1. Vai su [vercel.com](https://vercel.com)
2. Login con GitHub
3. Click **"Add New..."** → **"Project"**
4. Seleziona `associazione-ets`

### 4.2 Configura Build Settings

Vercel rileva automaticamente Vite, ma verifica:

- **Framework Preset**: `Vite`
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### 4.3 Aggiungi Variabili d'Ambiente

Prima del deploy, click **"Environment Variables"**:

```env
VITE_API_URL=https://tuo-backend.railway.app/api
```

**⚠️ IMPORTANTE**: Usa l'URL Backend ottenuto al punto 3.4!

### 4.4 Deploy!

Click **"Deploy"** e attendi 2-3 minuti.

### 4.5 Ottieni URL Frontend

Al termine vedrai:
```
🎉 https://associazione-ets.vercel.app
```

---

## 📧 FASE 5: Setup Email (Resend) [OPZIONALE]

### 5.1 Crea Account

1. Vai su [resend.com](https://resend.com)
2. Registrati (3000 email/mese gratis)
3. Verifica email

### 5.2 Ottieni API Key

1. Dashboard → **"API Keys"**
2. Click **"Create API Key"**
3. Nome: `Associazione ETS`
4. Copia la chiave (inizia con `re_`)

### 5.3 Aggiungi al Backend

Torna su Railway:
1. Vai nelle **Variables** del backend
2. Aggiungi:
```env
RESEND_API_KEY=re_tuachiave_qui
```

---

## 📁 FASE 6: Setup Storage (Supabase) [OPZIONALE]

### 6.1 Crea Progetto

1. Vai su [supabase.com](https://supabase.com)
2. **"New Project"**
3. Nome: `associazione-ets`
4. Password: (salvala!)
5. Region: `Europe West (Ireland)`

### 6.2 Crea Storage Bucket

1. Sidebar → **"Storage"**
2. **"New bucket"**
3. Nome: `documenti`
4. **Public**: NO (privato)
5. Create

### 6.3 Ottieni Credenziali

1. **Settings** → **"API"**
2. Copia:
   - **Project URL** (es: `https://abc123.supabase.co`)
   - **anon public** key

### 6.4 Aggiungi al Backend

Torna su Railway Variables:
```env
SUPABASE_URL=https://tuoprogetto.supabase.co
SUPABASE_KEY=tua-anon-key-qui
```

---

## 🔒 FASE 7: Configurazione CORS

### 7.1 Aggiorna CORS Backend

Su Railway, aggiungi/modifica:
```env
ALLOWED_ORIGINS=https://tuo-frontend.vercel.app,https://www.tuo-dominio.it
```

### 7.2 Verifica nel Codice

Il backend già include la configurazione CORS in `Program.cs`:
```csharp
policy.WithOrigins(
    "http://localhost:5173",
    "https://*.vercel.app",
    "https://your-domain.com"
)
```

---

## ✅ FASE 8: Test Completo

### 8.1 Verifica Backend

Apri: `https://tuo-backend.railway.app/swagger`

✅ Dovresti vedere la documentazione API

### 8.2 Verifica Frontend

Apri: `https://tuo-frontend.vercel.app`

✅ Dovresti vedere la pagina di login

### 8.3 Test Registrazione

1. Click "Registrati"
2. Compila il form
3. Primo utente = Admin! 🎉

### 8.4 Test Creazione Socio

1. Login
2. Vai in "Soci"
3. Crea un nuovo socio
4. Verifica che appaia in lista

---

## 🔄 Update Automatico

### Frontend (Vercel)

✅ Deploy automatico ad ogni `git push` su `main`

### Backend (Railway)

✅ Deploy automatico ad ogni `git push` su `main`

**Per forzare redeploy:**
```bash
git commit --allow-empty -m "Trigger deploy"
git push
```

---

## 🐛 Troubleshooting

### Backend non parte

```bash
# Controlla logs su Railway
Railway Dashboard → tuo-servizio → "Logs"

# Errore comune: DATABASE_URL
# Verifica che sia nel formato:
# Host=xxx;Database=xxx;Username=xxx;Password=xxx;Port=5432
```

### Frontend non si connette

```bash
# Controlla VITE_API_URL su Vercel
Vercel Dashboard → tuo-progetto → Settings → Environment Variables

# Deve finire con /api:
# https://tuo-backend.railway.app/api
```

### CORS Error

```bash
# Aggiungi il tuo dominio Vercel nel backend
# Railway Variables:
ALLOWED_ORIGINS=https://tuo-app.vercel.app
```

### Database Error

```bash
# Assicurati che DATABASE_URL sia collegato
# Railway → Backend → Variables
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

---

## 💰 Limiti Free Tier

### Railway
- ✅ $5 credito/mese (copre ~500 ore)
- ✅ Sleep dopo 30 min inattività
- ✅ 1GB Database storage

### Vercel
- ✅ Build illimitati
- ✅ 100GB bandwidth/mese
- ✅ Funzioni serverless illimitate

### Supabase
- ✅ 1GB storage
- ✅ 2GB bandwidth/mese

### Resend
- ✅ 3000 email/mese

**Totale: €0/mese** per un'associazione! 🎉

---

## 📱 PWA (Installazione Mobile)

Il frontend è configurato come PWA:

### iOS (Safari)
1. Apri il sito
2. Tap icona "Condividi"
3. "Aggiungi a Home"

### Android (Chrome)
1. Apri il sito
2. Menu (3 punti)
3. "Aggiungi a Home"

---

## 🎯 Prossimi Passi

1. ✅ Configura logo associazione
2. ✅ Personalizza colori in `tailwind.config.js`
3. ✅ Aggiungi soci iniziali
4. ✅ Configura email in impostazioni
5. ✅ Testa creazione riunione + PDF

---

## 🆘 Hai Problemi?

1. Controlla i **logs** su Railway e Vercel
2. Verifica tutte le **variabili d'ambiente**
3. Testa le API con **Swagger**
4. Apri una **issue** su GitHub

---

**🎉 Congratulazioni! Il tuo gestionale è online!**
