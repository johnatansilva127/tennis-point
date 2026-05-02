# Tennis Point v4.12.7 - Suprime stubs curtos de qualifiers (linhas soltas)
#
# CONTEXTO:
#   Apos v4.12.5 (alignment Q1/Q2/Q3 com R32-1/8/16) e v4.12.6 (esconder cards
#   futuros vazios), o user reportou "linhas curtas soltas" no canto da chave.
#
# DIAGNOSTICO (via console do user):
#   - 12/34 cards escondidos OK (R16/QF/SF/F vazios escondidos como esperado)
#   - "linhas soltas" sao as winner-paths Q1->R32-1, Q2->R32-8, Q3->R32-16
#   - Como Q e R32 destinatario estao na MESMA Y (alinhados), a linha L-shape
#     degenera para uma linha reta CURTA horizontal - parece um "stub solto"
#
# FIX (v4.12.7):
#   No drawConnectors, quando source e target estao verticalmente alinhados
#   (|sy-yt| < 4px) E proximos horizontalmente (|sx-xt| < 50px), PULA o
#   desenho do conector. O alinhamento visual ja comunica a conexao e o stub
#   fica redundante/visualmente poluindo.
#
# RESULTADO ESPERADO:
#   - Q1 fica colado ao lado de R32-1 (mesma altura) - sem linha entre eles
#   - Q2 fica colado ao lado de R32-8 - sem linha
#   - Q3 fica colado ao lado de R32-16 - sem linha
#   - As linhas verdes dos R32->R16 (Panda+Tammaro->R16-3, Cristian->R16-5
#     etc) ficam EVIDENTES sem competir com os stubs

$ErrorActionPreference = 'Stop'
Set-Location 'C:\Users\Douglas\Documents\tennis-point'

Write-Host "[1/4] Limpando locks" -ForegroundColor Yellow
Remove-Item .git\index.lock, .git\REBASE_HEAD.lock, .git\packed-refs.lock -Force -ErrorAction SilentlyContinue
if (Test-Path .git\rebase-apply) { & git am --abort 2>&1 | Out-Null }

Write-Host "[2/4] Add e commit" -ForegroundColor Yellow
git add -f bracket.js index.html
if (Test-Path 'release_v4.12.7.ps1') { git add -f release_v4.12.7.ps1 }
git diff --cached --name-only | ForEach-Object { Write-Host "  staged: $_" }

$staged = git diff --cached --name-only
if ($staged) {
    git commit -m "fix(bracket): suprime stubs curtos de qualifiers (v4.12.7)" `
               -m "Quando source e target de um conector estao verticalmente" `
               -m "alinhados (|sy-yt| < 4px) e proximos horizontalmente (|sx-xt| < 50px)," `
               -m "a linha L-shape vira um stub reto curto que parece 'linha solta'." `
               -m "Caso classico: Q1->R32-1, Q2->R32-8, Q3->R32-16 apos fix de alignment." `
               -m "Solucao: pular o desenho do conector - o alinhamento ja comunica."
} else {
    Write-Host "  nada pra commitar"
}

Write-Host "[3/4] Tag v4.12.7" -ForegroundColor Yellow
& git tag -a v4.12.7 -m "Suprime stubs de qualifiers" 2>&1 | Out-Null
git tag -l "v4.12.7" | ForEach-Object { Write-Host "  tag presente: $_" }

Write-Host "[4/4] Push" -ForegroundColor Yellow
git push origin main
git push origin --tags

Write-Host ""
Write-Host "OK v4.12.7 publicada." -ForegroundColor Green
Write-Host "" -ForegroundColor Cyan
Write-Host "TESTE:" -ForegroundColor Cyan
Write-Host "1. Aguarde ~1 min" -ForegroundColor White
Write-Host "2. Aba ANONIMA -> https://johnatansilva127.github.io/tennis-point/" -ForegroundColor White
Write-Host "3. Login admin -> Torneio -> Cat. A" -ForegroundColor White
Write-Host "4. Voce DEVE ver:" -ForegroundColor White
Write-Host "   - Q1 (L. Rebolcas vs M. Bomba) no TOPO, ao lado de J1 Ian - SEM linha verde curta" -ForegroundColor Gray
Write-Host "   - Q2 (Sandro vs Heraldo) no MEIO, ao lado de J8 - SEM linha verde curta" -ForegroundColor Gray
Write-Host "   - Q3 (Gianni vs Jorgi) no FUNDO, ao lado de J16 - SEM linha verde curta" -ForegroundColor Gray
Write-Host "   - Linhas VERDES brilhantes saindo de Panda, Tammaro, Cristian, Claudinho" -ForegroundColor Gray
Write-Host "     formando colchetes ate seus respectivos R16" -ForegroundColor Gray
Write-Host "   - Linhas BRANCAS para conectores normais (matches sem winner ainda)" -ForegroundColor Gray
Write-Host "   - SEM linhas curtas/soltas no canto" -ForegroundColor Gray
