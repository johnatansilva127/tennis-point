# Tennis Point v4.10.0 - Bracket redesign release
# Roda no PowerShell na pasta do repo.

$ErrorActionPreference = 'Stop'
Set-Location 'C:\Users\Douglas\Documents\tennis-point'

Write-Host "[1/4] Limpando locks" -ForegroundColor Yellow
Remove-Item .git\index.lock, .git\REBASE_HEAD.lock, .git\packed-refs.lock -Force -ErrorAction SilentlyContinue
git am --abort 2>$null

Write-Host "[2/4] Commitando redesign" -ForegroundColor Yellow
git add bracket.js styles.css index.html release_v4.10.0.ps1
git commit -m "feat(bracket): redesign v4.10.0 - cards modernos com colunas de score, conectores curvos" -m "- Cards 320px com gradiente sutil, border-radius 12px, hover com glow lima" -m "- Header: trofeu SVG, #N + Round + Categoria com chip" -m "- Score columns 28x32px tabular-nums, winner com bg lima + border" -m "- Conectores L-shape continuos com Q-curves nos cantos"

Write-Host "[3/4] Tag v4.10.0" -ForegroundColor Yellow
git tag -a v4.10.0 -m "Release v4.10.0 - bracket redesign"

Write-Host "[4/4] Push" -ForegroundColor Yellow
git push origin main
git push origin --tags

Write-Host ""
Write-Host "OK v4.10.0 publicada. Aguarde ~1 min e Ctrl+F5 no site." -ForegroundColor Green
