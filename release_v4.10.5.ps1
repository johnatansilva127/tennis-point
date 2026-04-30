# Tennis Point v4.10.5 - Footer do match clicavel pra admin
# - Footer do card vira clicavel pra admin em qualquer modo (edicao on/off)
# - Mostra "+ definir data e hora" quando ainda nao tem data
# - Abre o openMatchEditor com inputs de scores/winner/data/hora

$ErrorActionPreference = 'Stop'
Set-Location 'C:\Users\Douglas\Documents\tennis-point'

Write-Host "[1/4] Limpando locks" -ForegroundColor Yellow
Remove-Item .git\index.lock, .git\REBASE_HEAD.lock, .git\packed-refs.lock -Force -ErrorAction SilentlyContinue
if (Test-Path .git\rebase-apply) {
    & git am --abort 2>&1 | Out-Null
}

Write-Host "[2/4] Add e commit" -ForegroundColor Yellow
git add bracket.js styles.css app.js index.html
if (Test-Path 'release_v4.10.5.ps1') { git add release_v4.10.5.ps1 }

$staged = git diff --cached --name-only
if ($staged) {
    git commit -m "feat(admin): footer do match clicavel pra acessar editor (v4.10.5)" -m "- renderMatch agora recebe isAdmin, footer com data-action=edit-match-details" -m "- Quando admin sem data: mostra '+ definir data e hora' + icone lapis" -m "- Handler em bindBracketSortActions: abre openMatchEditor em qualquer modo" -m "- Funciona com Modo Edicao ON ou OFF (substitui o caminho que so existia em modo OFF)"
} else {
    Write-Host "  nada pra commitar"
}

Write-Host "[3/4] Tag v4.10.5" -ForegroundColor Yellow
& git tag -a v4.10.5 -m "Release v4.10.5 - footer clicavel pra admin" 2>&1 | Out-Null
git tag -l "v4.10.5" | ForEach-Object { Write-Host "  tag presente: $_" }

Write-Host "[4/4] Push" -ForegroundColor Yellow
git push origin main
git push origin --tags

Write-Host ""
Write-Host "OK v4.10.5 publicada. Aguarde ~1 min e Ctrl+F5 no site." -ForegroundColor Green
