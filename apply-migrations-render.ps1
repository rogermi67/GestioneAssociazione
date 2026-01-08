# Salva come: apply-migrations-render.ps1

$DB_URL_NPGSQL = "Host=dpg-d5albm15pdvs73b1ik0g-a.oregon-postgres.render.com;Port=5432;Database=associazione;Username=associazione_user;Password=wJjNKfvlP5q7kduPXqfTb38OM6PTsznW;SSL Mode=Require;Trust Server Certificate=true"
$DB_URL_PSQL = "postgresql://associazione_user:wJjNKfvlP5q7kduPXqfTb38OM6PTsznW@dpg-d5albm15pdvs73b1ik0g-a.oregon-postgres.render.com:5432/associazione"

Write-Host "🗑️  Dropping existing schema..." -ForegroundColor Yellow
psql $DB_URL_PSQL -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

Write-Host ""
Write-Host "📋 Creating all tables via EF Core migrations..." -ForegroundColor Cyan

Set-Location C:\Progetti\associazione-ets\backend

$env:ConnectionStrings__DefaultConnection = $DB_URL_NPGSQL
dotnet ef database update --no-build

Write-Host ""
Write-Host "🔍 Verifying tables..." -ForegroundColor Cyan
psql $DB_URL_PSQL -c "\dt"

Write-Host ""
Write-Host "✅ DONE!" -ForegroundColor Green