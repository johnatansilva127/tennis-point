# Tennis Point v4.12.6 - Layout estilo Letzplay (limpo, sem cards "BYE x BYE" futuros)
#
# CONTEXTO:
#   Usuario enviou screenshots da plataforma Letzplay como referencia visual
#   de como ele quer a chave organizada: colunas alinhadas, conectores L-shape
#   (colchetes brancos), SEM cards de matches futuros vazios poluindo a tela.
#
# MUDANCAS:
#
#   1. renderMatch (bracket.js):
#      - Esconder cards "totalmente vazios" (sem p1, sem p2, sem winner).
#        Isso engloba:
#          a) BYE x BYE genuinos (isBye=true ambos null)
#          b) R16/QF/SF/F aguardando alimentadores (sem feeder definido ainda)
#      - Quando o primeiro feeder gerar winner, o card aparece com 1 jogador
#        + slot "A definir" (nao mais BYE).
#
#   2. renderPlayerRow (bracket.js):
#      - Distingue BYE estrutural de "Aguardando feeder":
#          BYE -> avatar X cinza com label "BYE" (jogo sem oponente, vencedor passa direto)
#          Aguardando -> avatar ? sutil com label "A definir" (esperando vencedor de outro match)
#
#   3. styles.css:
#      - Adicionou .tbd styles: avatar com border tracejada lima sutil + nome italico cinza claro.
#
# RESULTADO ESPERADO PRA CAT-A (estado atual):
#   - R64: 3 cards visiveis (Q1, Q2, Q3) - todos com winner ja definido
#   - R32: 16 cards visiveis - 4 com winner (Panda/Tammaro/Cristian/Claudinho)
#   - R16: SO 3 visiveis (#3 Panda+Tammaro, #5 Cristian+TBD, #7 TBD+Claudinho)
#          5 escondidos (totalmente vazios)
#   - QF, SF, F: TODOS escondidos (totalmente vazios)
#   - Conectores apenas onde origem E destino estao visiveis - sem linhas soltas

$ErrorActionPreference = 'Stop'
Set-Location 'C:\Users\Douglas\Documents\tennis-point'

Write-Host "[1/4] Limpando locks" -ForegroundColor Yellow
Remove-Item .git\index.lock, .git\REBASE_HEAD.lock, .git\packed-refs.lock -Force -ErrorAction SilentlyContinue
if (Test-Path .git\rebase-apply) { & git am --abort 2>&1 | Out-Null }

Write-Host "[2/4] Add e commit" -ForegroundColor Yellow
git add -f bracket.js styles.css index.html
if (Test-Path 'release_v4.12.6.ps1') { git add -f release_v4.12.6.ps1 }
git diff --cached --name-only | ForEach-Object { Write-Host "  staged: $_" }

$staged = git diff --cached --name-only
if ($staged) {
    git commit -m "feat(bracket): layout Letzplay-style sem cards 'BYE x BYE' futuros (v4.12.6)" `
               -m "renderMatch agora esconde matches sem p1, sem p2 e sem winner -" `
               -m "engloba BYExBYE estruturais E matches futuros aguardando feeders." `
               -m "Quando 1 feeder gera winner, card reaparece com slot 'A definir'." `
               -m "renderPlayerRow distingue BYE estrutural de slot 'Aguardando feeder'" `
               -m "(avatar ? + label 'A definir' em italico vs avatar X + 'BYE')." `
               -m "styles.css adiciona .tbd para slot pendente (border tracejada lima sutil)." `
               -m "Resultado: chave Cat-A fica visualmente limpa, conectores so" `
               -m "desenhados onde source e target estao visiveis - sem linhas soltas."
} else {
    Write-Host "  nada pra commitar"
}

Write-Host "[3/4] Tag v4.12.6" -ForegroundColor Yellow
& git tag -a v4.12.6 -m "Layout Letzplay-style: sem cards futuros vazios" 2>&1 | Out-Null
git tag -l "v4.12.6" | ForEach-Object { Write-Host "  tag presente: $_" }

Write-Host "[4/4] Push" -ForegroundColor Yellow
git push origin main
git push origin --tags

Write-Host ""
Write-Host "OK v4.12.6 publicada." -ForegroundColor Green
Write-Host "" -ForegroundColor Cyan
Write-Host "TESTE OBRIGATORIO:" -ForegroundColor Cyan
Write-Host "1. Aguarde ~1 min (GitHub Pages deploy)" -ForegroundColor White
Write-Host "2. Abra https://johnatansilva127.github.io/tennis-point/ em ABA ANONIMA" -ForegroundColor White
Write-Host "   ou DevTools > Application > Service Workers > Unregister + Storage > Clear site data" -ForegroundColor White
Write-Host "3. Login admin -> Torneio -> Cat. A" -ForegroundColor White
Write-Host "4. Voce DEVE ver:" -ForegroundColor White
Write-Host "   - R64 (esquerda): so 3 cards (Q1, Q2, Q3 - todos com winner)" -ForegroundColor Gray
Write-Host "   - R32 (centro): 16 cards, 4 destacados verdes (Panda, Tammaro, Cristian, Claudinho)" -ForegroundColor Gray
Write-Host "   - R16: APENAS 3 cards visiveis:" -ForegroundColor Gray
Write-Host "     * #3 Panda x Tammaro (ambos definidos)" -ForegroundColor Gray
Write-Host "     * #5 Cristian x 'A definir' (so p1 definido)" -ForegroundColor Gray
Write-Host "     * #7 'A definir' x Claudinho (so p2 definido)" -ForegroundColor Gray
Write-Host "   - Demais R16, todo QF/SF/F: ESCONDIDOS (espacos vazios mantidos pra alinhamento)" -ForegroundColor Gray
Write-Host "   - Conectores: linhas brancas/cinzas + linhas verde-lima saindo dos winners" -ForegroundColor Gray
Write-Host "   - Sem linhas soltas no meio" -ForegroundColor Gray
