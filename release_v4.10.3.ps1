# Tennis Point v4.10.3 - Fix overlap do botao Re-sortear
# - Botao sai do header das rodadas (overlap com Quartas/Final)
# - Vai pra uma toolbar propria acima da chave: contador + acao
# - Sticky ao scroll horizontal pro botao ficar sempre visivel

$ErrorActionPreference = 'Stop'
Set-Location 'C:\Users\Douglas\Documents\tennis-point'

Write-Host "[1/4] Limpando locks" -ForegroundColor Yellow
Remove-Item .git\index.lock, .git\REBASE_HEAD.lock, .git\packed-refs.lock -Force -ErrorAction SilentlyContinue
if (Test-Path .git\rebase-apply) {
    & git am --abort 2>&1 | Out-Null
}

Write-Host "[2/4] Add e commit" -ForegroundColor Yellow
git add bracket.js styles.css app.js index.html
if (Test-Path 'release_v4.10.2.ps1') { git add release_v4.10.2.ps1 }
if (Test-Path 'release_v4.10.3.ps1') { git add release_v4.10.3.ps1 }

$staged = git diff --cached --name-only
if ($staged) {
    git commit -m "fix(bracket): toolbar separada pra Re-sortear (v4.10.3)" -m "- Botao Re-sortear saiu do bracket-rounds-header (overlap com Quartas/Final)" -m "- Nova .bracket-toolbar com sticky left, contador 'X jogos Y rodadas' a esquerda e botao a direita" -m "- bindBracketSortActions agora aciona corretamente goto-draw e resort-bracket"
} else {
    Write-Host "  nada pra commitar"
}

Write-Host "[3/4] Tag v4.10.3" -ForegroundColor Yellow
& git tag -a v4.10.3 -m "Release v4.10.3 - fix Re-sortear overlap" 2>&1 | Out-Null
git tag -l "v4.10.3" | ForEach-Object { Write-Host "  tag presente: $_" }

Write-Host "[4/4] Push" -ForegroundColor Yellow
git push origin main
git push origin --tags

Write-Host ""
Write-Host "OK v4.10.3 publicada. Aguarde ~1 min e Ctrl+F5 no site." -ForegroundColor Green
