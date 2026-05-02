# Tennis Point v4.12.4 - Alignment SELETIVO de qualifiers (fix definitivo)
# - v4.12.3 alinhava TODOS os matches com seus destinos (incluia R32, R16, etc)
#   o que quebrava o layout natural dos rounds intermediarios.
# - v4.12.4 alinha SO matches que estao FORA do padrao classico:
#     padrao classico = round[ri+1].matches[mi] vem de round[ri].matches[mi*2] (p1)
#                       e round[ri].matches[mi*2+1] (p2)
#   se feeder casa com isso → NAO mexe (R32→R16, R16→QF, QF→SF, SF→F sao classicos)
#   se feeder diverge → ALINHA com Y do destino (Q1→J1, Q2→J8, Q3→J16 sao non-classicos)
# - Trace validado: Q1.y=0, Q2.y=1246, Q3.y=2670 (alinhados com J1, J8, J16)
#   distancia vertical Q-to-J = 0px → linhas conectoras retas e curtas

$ErrorActionPreference = 'Stop'
Set-Location 'C:\Users\Douglas\Documents\tennis-point'

Write-Host "[1/4] Limpando locks" -ForegroundColor Yellow
Remove-Item .git\index.lock, .git\REBASE_HEAD.lock, .git\packed-refs.lock -Force -ErrorAction SilentlyContinue
if (Test-Path .git\rebase-apply) { & git am --abort 2>&1 | Out-Null }

Write-Host "[2/4] Add e commit" -ForegroundColor Yellow
git add -f bracket.js bracket-builder.js styles.css app.js index.html
if (Test-Path 'release_v4.12.4.ps1') { git add -f release_v4.12.4.ps1 }
git diff --cached --name-only | ForEach-Object { Write-Host "  staged: $_" }

$staged = git diff --cached --name-only
if ($staged) {
    git commit -m "fix(layout): alignment seletivo so de matches non-classicos (v4.12.4)" `
               -m "v4.12.3 estava alinhando TODOS matches com seus destinos via feeders," `
               -m "incluindo R32 que ja estavam na posicao correta (mi*2 padrao). Isso" `
               -m "criava posicionamento errado em cascata pra R16, QF, SF, F." `
               -m "v4.12.4 verifica se srcIdx.mi casa com expectedSrcMi (mi*2 ou mi*2+1" `
               -m "do destino). Se sim = padrao classico → mantem layout normal." `
               -m "Se nao = qualifier ou outro caso especial → alinha Y com destino." `
               -m "Resultado: Q1, Q2, Q3 alinhados verticalmente com J1, J8, J16," `
               -m "demais matches preservam layout simetrico classico."
} else {
    Write-Host "  nada pra commitar"
}

Write-Host "[3/4] Tag v4.12.4" -ForegroundColor Yellow
& git tag -a v4.12.4 -m "Alignment seletivo definitivo" 2>&1 | Out-Null
git tag -l "v4.12.4" | ForEach-Object { Write-Host "  tag presente: $_" }

Write-Host "[4/4] Push" -ForegroundColor Yellow
git push origin main
git push origin --tags

Write-Host ""
Write-Host "OK v4.12.4 publicada." -ForegroundColor Green
Write-Host "" -ForegroundColor Cyan
Write-Host "TESTE OBRIGATORIO:" -ForegroundColor Cyan
Write-Host "1. Aguarde 1 min" -ForegroundColor White
Write-Host "2. Ctrl+Shift+R no site" -ForegroundColor White
Write-Host "3. Login admin -> Torneio -> Cat. A" -ForegroundColor White
Write-Host "4. Voce DEVE ver:" -ForegroundColor White
Write-Host "   - Q1 (L. Rebolcas x M. Bomba) no TOPO da coluna R64 (alinhado com J1 Ian)" -ForegroundColor Gray
Write-Host "   - Q2 (Sandro x Heraldo) no MEIO-BAIXO (alinhado com J8 Rodrigo V.)" -ForegroundColor Gray
Write-Host "   - Q3 (Gianni x Jorgi) no FUNDO (alinhado com J16 Rafael K.)" -ForegroundColor Gray
Write-Host "   - 3 linhas retas e curtas conectando os qualifiers aos R32" -ForegroundColor Gray
Write-Host "   - Sem linhas cruzadas (X) longas pelo meio" -ForegroundColor Gray
