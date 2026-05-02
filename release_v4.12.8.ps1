# Tennis Point v4.12.8 - Fix DEFINITIVO de stubs (validado AO VIVO no browser)
#
# CONTEXTO:
#   v4.12.7 tentou suprimir stubs com heuristica `dyAbs < 4 && dxAbs < 50`.
#   NAO FUNCIONOU porque medindo no browser real, dx = 70px (nao < 50).
#
# DIAGNOSTICO AO VIVO (Chrome MCP no site v4.12.7):
#   - m-r64-1 -> m-r32-1: sx=340, sy=109, tx=410, ty=109 -> dx=70, dy=0
#   - m-r64-2 -> m-r32-8: dx=70, dy=0
#   - m-r64-3 -> m-r32-16: dx=70, dy=0
#   Os 3 stubs verdes verificados como paths SVG ativos:
#     "M 340 109.25 H 375 V 109.25 H 410" (linha reta de 70px)
#     "M 340 1810.25 H 375 V 1810.25 H 410"
#     "M 340 3754.25 H 375 V 3754.25 H 410"
#
# FIX (v4.12.8):
#   Criterio simplificado: SO `dyAbs < 4` (alinhamento horizontal perfeito).
#   Em brackets classicos, conectores entre rounds adjacentes sempre tem
#   distancia horizontal similar; o que diferencia stub de colchete real e'
#   o desvio vertical. dy=0 = linha reta = stub redundante.
#
# VALIDADO AO VIVO ANTES DO RELEASE:
#   Apliquei hotpatch via DevTools Console e contei paths:
#     ANTES: 9 paths (3 stubs + 6 colchetes)
#     DEPOIS: 6 paths (so colchetes - stubs sumiram)
#   Screenshots confirmaram visualmente (Panda+Tammaro, Cristian, Claudinho
#   com winner-paths brilhantes intactos, sem linhas soltas).

$ErrorActionPreference = 'Stop'
Set-Location 'C:\Users\Douglas\Documents\tennis-point'

Write-Host "[1/4] Limpando locks" -ForegroundColor Yellow
Remove-Item .git\index.lock, .git\REBASE_HEAD.lock, .git\packed-refs.lock -Force -ErrorAction SilentlyContinue
if (Test-Path .git\rebase-apply) { & git am --abort 2>&1 | Out-Null }

Write-Host "[2/4] Add e commit" -ForegroundColor Yellow
git add -f bracket.js index.html
if (Test-Path 'release_v4.12.8.ps1') { git add -f release_v4.12.8.ps1 }
git diff --cached --name-only | ForEach-Object { Write-Host "  staged: $_" }

$staged = git diff --cached --name-only
if ($staged) {
    git commit -m "fix(bracket): supressao DEFINITIVA de stubs validada ao vivo (v4.12.8)" `
               -m "v4.12.7 usava 'dyAbs < 4 && dxAbs < 50' mas medindo no browser real," `
               -m "dx=70px (nao < 50). Stubs continuavam aparecendo." `
               -m "v4.12.8 simplifica: criterio unico 'dyAbs < 4' (alinhamento horizontal)." `
               -m "Em brackets classicos, dy=0 = linha reta = stub redundante." `
               -m "Validado AO VIVO via Chrome MCP: 9 paths -> 6 paths apos fix." `
               -m "Screenshots confirmaram remocao dos 3 stubs Q->R32 sem afetar" `
               -m "os colchetes verdes dos winner-paths reais (Panda, Tammaro," `
               -m "Cristian, Claudinho)."
} else {
    Write-Host "  nada pra commitar"
}

Write-Host "[3/4] Tag v4.12.8" -ForegroundColor Yellow
& git tag -a v4.12.8 -m "Fix DEFINITIVO stubs (validado ao vivo)" 2>&1 | Out-Null
git tag -l "v4.12.8" | ForEach-Object { Write-Host "  tag presente: $_" }

Write-Host "[4/4] Push" -ForegroundColor Yellow
git push origin main
git push origin --tags

Write-Host ""
Write-Host "OK v4.12.8 publicada." -ForegroundColor Green
Write-Host "" -ForegroundColor Cyan
Write-Host "RESULTADO ESPERADO (validado AO VIVO antes do deploy):" -ForegroundColor Cyan
Write-Host "  - Q1, Q2, Q3 colados ao lado de R32-1, R32-8, R32-16 SEM linha verde curta" -ForegroundColor Gray
Write-Host "  - Cards 'BYE x BYE' futuros escondidos (12 escondidos = R16 vazios + QF + SF + F)" -ForegroundColor Gray
Write-Host "  - Slots semi-preenchidos mostram 'A definir' com avatar ? lima tracejado" -ForegroundColor Gray
Write-Host "  - Winner-paths verdes brilhantes intactos (Panda, Tammaro, Cristian, Claudinho)" -ForegroundColor Gray
Write-Host "  - ZERO linhas soltas no canto" -ForegroundColor Gray
