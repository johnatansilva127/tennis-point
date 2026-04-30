# Tennis Point v4.10.4 - Admin define data/hora dos jogos
# - Inputs de data e horario no editor de match (admin)
# - Salva e propaga via Supabase Realtime
# - Aparece no card e na aba Horarios

$ErrorActionPreference = 'Stop'
Set-Location 'C:\Users\Douglas\Documents\tennis-point'

Write-Host "[1/4] Limpando locks" -ForegroundColor Yellow
Remove-Item .git\index.lock, .git\REBASE_HEAD.lock, .git\packed-refs.lock -Force -ErrorAction SilentlyContinue
if (Test-Path .git\rebase-apply) {
    & git am --abort 2>&1 | Out-Null
}

Write-Host "[2/4] Add e commit" -ForegroundColor Yellow
git add bracket.js styles.css app.js index.html
if (Test-Path 'release_v4.10.3.ps1') { git add release_v4.10.3.ps1 }
if (Test-Path 'release_v4.10.4.ps1') { git add release_v4.10.4.ps1 }

$staged = git diff --cached --name-only
if ($staged) {
    git commit -m "feat(admin): editor de match agora permite definir data e horario (v4.10.4)" -m "- Novos campos input type=date e input type=time no openMatchEditor" -m "- saveMatchEdit le e persiste match.date e match.time" -m "- Aparece no card (rodape) e na aba Horarios do torneio" -m "- Sync via Supabase Realtime (todos os clientes recebem em tempo real)" -m "- Fix do v4.10.3 (toolbar separada) tambem incluido"
} else {
    Write-Host "  nada pra commitar"
}

Write-Host "[3/4] Tag v4.10.4" -ForegroundColor Yellow
& git tag -a v4.10.4 -m "Release v4.10.4 - admin date/time on matches" 2>&1 | Out-Null
git tag -l "v4.10.4" | ForEach-Object { Write-Host "  tag presente: $_" }

Write-Host "[4/4] Push" -ForegroundColor Yellow
git push origin main
git push origin --tags

Write-Host ""
Write-Host "OK v4.10.4 publicada. Aguarde ~1 min e Ctrl+F5 no site." -ForegroundColor Green
