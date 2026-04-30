# Tennis Point v4.10.1 - Espacamento entre matches
# Roda no PowerShell na pasta do repo.

$ErrorActionPreference = 'Stop'
Set-Location 'C:\Users\Douglas\Documents\tennis-point'

Write-Host "[1/4] Limpando locks" -ForegroundColor Yellow
Remove-Item .git\index.lock, .git\REBASE_HEAD.lock, .git\packed-refs.lock -Force -ErrorAction SilentlyContinue

# git am --abort so se houver sessao em andamento (senao da fatal e para o script)
if (Test-Path .git\rebase-apply) {
    Write-Host "  am session pendente, abortando..."
    & git am --abort 2>&1 | Out-Null
}

Write-Host "[2/4] Add e commit" -ForegroundColor Yellow
git add bracket.js styles.css index.html
if (Test-Path 'release_v4.10.0.ps1') { git add release_v4.10.0.ps1 }
if (Test-Path 'release_v4.10.1.ps1') { git add release_v4.10.1.ps1 }

# Se nao houver mudancas pra commitar, pula sem erro
$staged = git diff --cached --name-only
if ($staged) {
    git commit -m "feat(bracket): redesign v4.10.1 - cards modernos com mais espaco entre matches" -m "- Cards 320px com gradiente sutil, hover com glow lima" -m "- Header: trofeu SVG, #N + Round + Categoria com chip" -m "- Score columns 28x32px tabular-nums, winner com bg lima" -m "- Conectores L-shape continuos com Q-curves nos cantos" -m "- BASE_GAP 28 -> 48 (mais respiro entre matches da R1)"
} else {
    Write-Host "  nada pra commitar (talvez ja tenha sido feito antes)"
}

Write-Host "[3/4] Tag v4.10.1" -ForegroundColor Yellow
# Cria tag, mas nao falha se ja existir
& git tag -a v4.10.1 -m "Release v4.10.1 - bracket redesign + spacing" 2>&1 | Out-Null
git tag -l "v4.10.1" | ForEach-Object { Write-Host "  tag presente: $_" }

Write-Host "[4/4] Push" -ForegroundColor Yellow
git push origin main
git push origin --tags

Write-Host ""
Write-Host "OK v4.10.1 publicada. Aguarde ~1 min e Ctrl+F5 no site." -ForegroundColor Green
