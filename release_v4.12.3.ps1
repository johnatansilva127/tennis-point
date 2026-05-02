# Tennis Point v4.12.3 - Layout feeder-aware (qualifiers alinhados aos destinos)
# - layoutBracket agora faz uma SEGUNDA PASSADA depois do calculo normal:
#   pra cada match que e fonte de feeder pra OUTRO match, ajusta seu Y pra
#   alinhar verticalmente com o destino.
# - Cat-A: Q1 alinha com J1 (topo), Q2 alinha com J8 (meio), Q3 alinha com J16 (fundo)
# - Linhas conectoras dos qualifiers ficam CURTAS e quase horizontais
# - Math.max(...yPositions) substitui yPositions[length-1] pra calcular altura do round
#   (porque feeder-aware pode reordenar Y dentro do mesmo array)

$ErrorActionPreference = 'Stop'
Set-Location 'C:\Users\Douglas\Documents\tennis-point'

Write-Host "[1/4] Limpando locks" -ForegroundColor Yellow
Remove-Item .git\index.lock, .git\REBASE_HEAD.lock, .git\packed-refs.lock -Force -ErrorAction SilentlyContinue
if (Test-Path .git\rebase-apply) { & git am --abort 2>&1 | Out-Null }

Write-Host "[2/4] Add e commit" -ForegroundColor Yellow
git add -f bracket.js bracket-builder.js styles.css app.js index.html
if (Test-Path 'release_v4.12.3.ps1') { git add -f release_v4.12.3.ps1 }
git diff --cached --name-only | ForEach-Object { Write-Host "  staged: $_" }

$staged = git diff --cached --name-only
if ($staged) {
    git commit -m "fix(layout): feeder-aware alignment (v4.12.3)" `
               -m "layoutBracket agora alinha matches fonte de feeders verticalmente com" `
               -m "seus destinos. Resolve o problema de Q1/Q2/Q3 empilhados no topo enquanto" `
               -m "alimentavam J1/J8/J16 (no topo, meio e fundo do R32) -- as linhas" `
               -m "conectoras passavam por toda a chave criando ligacoes longas e cruzadas." `
               -m "Agora as linhas dos qualifiers ficam curtas e horizontais, alinhando" `
               -m "exatamente com seu match destino."
} else {
    Write-Host "  nada pra commitar"
}

Write-Host "[3/4] Tag v4.12.3" -ForegroundColor Yellow
& git tag -a v4.12.3 -m "Layout feeder-aware" 2>&1 | Out-Null
git tag -l "v4.12.3" | ForEach-Object { Write-Host "  tag presente: $_" }

Write-Host "[4/4] Push" -ForegroundColor Yellow
git push origin main
git push origin --tags

Write-Host ""
Write-Host "OK v4.12.3 publicada." -ForegroundColor Green
Write-Host "Aguarde 1 min, Ctrl+Shift+R, login admin -> Torneio -> Cat. A" -ForegroundColor Cyan
Write-Host "Q1, Q2, Q3 vao aparecer na altura certa, sem linhas cruzadas." -ForegroundColor Cyan
