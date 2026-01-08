# Salva come: reset-render-db.ps1

$DB_URL = "postgresql://associazione_user:wJjNKfvlP5q7kduPXqfTb38OM6PTsznW@dpg-d5albm15pdvs73b1ik0g-a.oregon-postgres.render.com:5432/associazione"

Write-Host "🔄 Resetting database schema..." -ForegroundColor Yellow

# Drop e ricrea schema public (elimina TUTTE le tabelle)
psql $DB_URL -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database schema reset successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 Ora fai il redeploy su Render e le migrations creeranno tutte le tabelle!" -ForegroundColor Cyan
} else {
    Write-Host "❌ Errore durante il reset!" -ForegroundColor Red
}