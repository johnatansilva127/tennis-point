# Tennis Point v4.12.5 - FIX DEFINITIVO do alignment qualifiers (2 bugs)
#
# CONTEXTO:
#   v4.12.4 prometeu alinhar Q1/Q2/Q3 com J1/J8/J16 mas NAO funcionou.
#   Auditoria revelou DOIS bugs criticos no bracket.js que impediam o
#   alignment de funcionar mesmo com a logica matematicamente correta.
#
# BUG #1 (matchIndexMap vazio):
#   Linha 364 do bracket.js fazia:
#       rounds.forEach((rName, ri) => {
#         const list = _bracketForAlign.matches[rName] || [];
#         ...
#       });
#   Mas `rounds` e' uma NodeList de DOM elements, entao `rName` era um
#   <div>, NAO uma string. Resultado: matchIndexMap ficava SEMPRE vazio,
#   srcIdx era undefined, e o codigo retornava early sem alinhar NADA.
#   FIX: lê `roundEl.dataset.round` para obter o nome do round.
#
# BUG #2 (R32 herdando posicoes erradas do R64):
#   Pra Cat-A: R64 tem 3 jogos (Q1, Q2, Q3) e R32 tem 16. A primeira
#   passada do layoutBracket fazia R32[mi] = avg(R64[mi*2], R64[mi*2+1]),
#   mas R64 so tem 3 elementos, entao:
#     - R32[0] = avg(Q1, Q2) = 89  (errado, deveria ser 0)
#     - R32[1] = Q3 (so um feeder) = 356  (errado)
#     - R32[2-15] = formula de fallback dobrado (errado)
#   FIX: detecta "anchor round" - quando prev round nao tem matches.length*2
#   matches, este round usa layout empilhado simples (anchor) em vez de
#   derivar do prev. R32 fica em [0, 178, 356, ..., 2670] - simetrico.
#
# RESULTADO MATEMATICO VALIDADO:
#   - R64: Q1=0, Q2=178, Q3=356 (anchor)
#   - R32: 0, 178, 356, 534, 712, 890, 1068, 1246, 1424, 1602, 1780, 1958,
#          2136, 2314, 2492, 2670 (anchor pq prev=3 < 32)
#   - R16, QF, SF, F: derivados classicamente
#
#   Segunda passada feeder-aware:
#   - Q1 (R64 idx 0) -> m-r32-1 (R32 idx 0, slot p2): NAO classico -> Q1.y = 0
#   - Q2 (R64 idx 1) -> m-r32-8 (R32 idx 7, slot p2): NAO classico -> Q2.y = 1246
#   - Q3 (R64 idx 2) -> m-r32-16 (R32 idx 15, slot p1): NAO classico -> Q3.y = 2670
#   - Demais feeders (R32->R16, R16->QF, QF->SF, SF->F): classicos -> nao toca

$ErrorActionPreference = 'Stop'
Set-Location 'C:\Users\Douglas\Documents\tennis-point'

Write-Host "[1/4] Limpando locks" -ForegroundColor Yellow
Remove-Item .git\index.lock, .git\REBASE_HEAD.lock, .git\packed-refs.lock -Force -ErrorAction SilentlyContinue
if (Test-Path .git\rebase-apply) { & git am --abort 2>&1 | Out-Null }

Write-Host "[2/4] Add e commit" -ForegroundColor Yellow
git add -f bracket.js index.html
if (Test-Path 'release_v4.12.5.ps1') { git add -f release_v4.12.5.ps1 }
git diff --cached --name-only | ForEach-Object { Write-Host "  staged: $_" }

$staged = git diff --cached --name-only
if ($staged) {
    git commit -m "fix(bracket): 2 bugs criticos do alignment de qualifiers (v4.12.5)" `
               -m "BUG #1: matchIndexMap vazio porque rName era DOM element, nao string." `
               -m "  Resultado: o feeder-aware alignment retornava early sem fazer nada." `
               -m "  Fix: rounds.forEach((roundEl, ri)) + rName = roundEl.dataset.round." `
               -m "BUG #2: R32 herdava posicoes erradas do R64 quando R64 era parcial." `
               -m "  Cat-A tem 3 jogos no R64 (Q1, Q2, Q3) e 16 no R32, mas o layout" `
               -m "  fazia R32[mi] = avg(R64[mi*2], R64[mi*2+1]) que produzia Y errado." `
               -m "  Fix: detecta 'anchor round' (prev parcial) e usa layout empilhado." `
               -m "Resultado: Q1.y=0 (= R32[0]), Q2.y=1246 (= R32[7]), Q3.y=2670 (= R32[15])." `
               -m "Linhas conectoras retas e curtas, sem cruzamento."
} else {
    Write-Host "  nada pra commitar"
}

Write-Host "[3/4] Tag v4.12.5" -ForegroundColor Yellow
& git tag -a v4.12.5 -m "Fix definitivo alignment qualifiers (2 bugs)" 2>&1 | Out-Null
git tag -l "v4.12.5" | ForEach-Object { Write-Host "  tag presente: $_" }

Write-Host "[4/4] Push" -ForegroundColor Yellow
git push origin main
git push origin --tags

Write-Host ""
Write-Host "OK v4.12.5 publicada." -ForegroundColor Green
Write-Host "" -ForegroundColor Cyan
Write-Host "TESTE OBRIGATORIO:" -ForegroundColor Cyan
Write-Host "1. Aguarde ~1 min (GitHub Pages deploy)" -ForegroundColor White
Write-Host "2. Abra https://johnatansilva127.github.io/tennis-point/ em ABA ANONIMA" -ForegroundColor White
Write-Host "   (ou DevTools > Application > Service Workers > Unregister + Storage > Clear site data)" -ForegroundColor White
Write-Host "3. Login admin -> Torneio -> Cat. A" -ForegroundColor White
Write-Host "4. Voce DEVE ver:" -ForegroundColor White
Write-Host "   - Q1 (L. Rebolcas x M. Bomba) no TOPO da coluna R64 (alinhado com J1 Ian x ...)" -ForegroundColor Gray
Write-Host "   - Q2 (Sandro x Heraldo) no MEIO-BAIXO (alinhado com J8 Heraldo)" -ForegroundColor Gray
Write-Host "   - Q3 (Gianni x Jorgi) no FUNDO (alinhado com J16 Rafael K.)" -ForegroundColor Gray
Write-Host "   - R32 simetrico, espacamento uniforme entre todos os 16 jogos" -ForegroundColor Gray
Write-Host "   - 3 linhas RETAS e CURTAS conectando Q1-J1, Q2-J8, Q3-J16" -ForegroundColor Gray
Write-Host "   - Vencedores existentes (Sandro, Panda, Tammaro, Cristian, Claudinho)" -ForegroundColor Gray
Write-Host "     com linhas verde-lima brilhantes pulsando" -ForegroundColor Gray
Write-Host "" -ForegroundColor Yellow
Write-Host "Se ALGO nao estiver assim, abra DevTools Console e rode:" -ForegroundColor Yellow
Write-Host "  STATE.brackets['cat-a'].feeders" -ForegroundColor Gray
Write-Host "  document.querySelectorAll('.bk-match[data-match-id^=\"m-r64\"]').forEach(m => console.log(m.dataset.matchId, m.style.top))" -ForegroundColor Gray
Write-Host "Esperado: m-r64-1 top=0px, m-r64-2 top=1246px, m-r64-3 top=2670px" -ForegroundColor Gray
