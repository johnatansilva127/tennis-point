# Tennis Point v4.12.2 - Cat-A reconstruida + conectores visiveis
# - Cat-A populada no Supabase com estrutura EXATA pedida pelo usuario:
#     R64: Q1 (L. Rebolcas x M. Bomba), Q2 (Sandro x Heraldo), Q3 (Gianni x Jorgi)
#     R32: 16 jogos com J1=Ian x V(Q1), J8=Rodrigo V x V(Q2), J16=V(Q3) x Rafael K
#     R16/QF/SF/F: estrutura completa com feeders explicitos
# - bracket.js: matches "aguardando alimentadores" (slots null sem isBye) NAO ficam
#   mais hidden -- assim conectores R32->R16->QF->SF->F desenham desde o inicio
# - CSS .bracket-svg path:
#     linha neutra: 2.5px branco 55% (mais visivel que 32% antigo)
#     drop-shadow preto sutil pra contraste
#     winner-path: 3.5px lima brilhante com glow + pulse animation
# - autoAdvance respeita feeders (winner/loser path tracking)

$ErrorActionPreference = 'Stop'
Set-Location 'C:\Users\Douglas\Documents\tennis-point'

Write-Host "[1/4] Limpando locks" -ForegroundColor Yellow
Remove-Item .git\index.lock, .git\REBASE_HEAD.lock, .git\packed-refs.lock -Force -ErrorAction SilentlyContinue
if (Test-Path .git\rebase-apply) {
    & git am --abort 2>&1 | Out-Null
}

Write-Host "[2/4] Add e commit" -ForegroundColor Yellow
git add -f bracket.js bracket-builder.js styles.css app.js index.html
if (Test-Path 'release_v4.12.2.ps1') { git add -f release_v4.12.2.ps1 }
git diff --cached --name-only | ForEach-Object { Write-Host "  staged: $_" }

$staged = git diff --cached --name-only
if ($staged) {
    git commit -m "feat(cat-a): reconstrucao com feeders + conectores visiveis (v4.12.2)" `
               -m "- Cat-A no Supabase: 35 jogadores, R64 (3 qualifiers), R32 (16 jogos)," `
               -m "  R16 (8), QF (4), SF (2), F (1) - 34 matches totais com 18 feeders explicitos" `
               -m "- Q1 -> J1 p2, Q2 -> J8 p2, Q3 -> J16 p1 (auto-advance qualifiers)" `
               -m "- R32 -> R16 -> QF -> SF -> F (auto-advance progressivo)" `
               -m "- Resultados ja jogados preservados: Sandro (Q2), Panda, Tammaro, Cristian, Claudinho" `
               -m "- bracket.js: hideClass agora so esconde isBye=true (nao slots null por feeder)" `
               -m "- CSS: linhas conectoras 2.5px brancas 55% + winner-path lima 3.5px com glow + pulse"
} else {
    Write-Host "  nada pra commitar"
}

Write-Host "[3/4] Tag v4.12.2" -ForegroundColor Yellow
& git tag -a v4.12.2 -m "Cat-A com feeders + conectores visiveis" 2>&1 | Out-Null
git tag -l "v4.12.2" | ForEach-Object { Write-Host "  tag presente: $_" }

Write-Host "[4/4] Push" -ForegroundColor Yellow
git push origin main
git push origin --tags

Write-Host ""
Write-Host "OK v4.12.2 publicada." -ForegroundColor Green
Write-Host "" -ForegroundColor Cyan
Write-Host "VALIDACAO no browser:" -ForegroundColor Cyan
Write-Host "1. Aguarde ~1 min (deploy do GitHub Pages)" -ForegroundColor White
Write-Host "2. Ctrl+Shift+R no site (limpa cache do service worker)" -ForegroundColor White
Write-Host "3. Login admin -> Torneio -> chip 'Cat. A'" -ForegroundColor White
Write-Host "4. Voce vai ver:" -ForegroundColor White
Write-Host "   - 6 colunas (R64, R32, R16, QF, SF, F)" -ForegroundColor Gray
Write-Host "   - Q1/Q2/Q3 no R64 (3 qualifiers)" -ForegroundColor Gray
Write-Host "   - 16 jogos R32 com J1, J8, J16 esperando vencedores dos qualifiers" -ForegroundColor Gray
Write-Host "   - 8 jogos R16, 4 QF, 2 SF, 1 F (vazios mas com conectores ligando)" -ForegroundColor Gray
Write-Host "   - Linha LIMA brilhante (com glow pulsante) saindo dos matches que ja tem winner:" -ForegroundColor Gray
Write-Host "     Sandro (Q2 -> J8), Panda (J5 -> J19), Tammaro (J6 -> J19)," -ForegroundColor Gray
Write-Host "     Cristian (J9 -> J21), Claudinho (J14 -> J23)" -ForegroundColor Gray
