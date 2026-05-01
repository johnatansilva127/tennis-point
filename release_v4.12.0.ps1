# Tennis Point v4.12.0 - Construtor Modular de chave
# - Tela nova: admin-builder (acessivel pelo botao "Construtor" na toolbar)
# - Estrutura nova: bracket.feeders[matchId] = { p1, p2 } onde cada slot pode ser:
#     {type: 'match', matchId, take: 'winner'|'loser'}  (auto-advance)
#     {type: 'entry', entryId}                            (jogador direto)
#     {type: 'bye'}                                       (vazio)
# - Templates pre-prontos: simples 8/16/32/64
# - Drag-drop: jogador da sidebar -> slot vazio
# - Click no slot abre modal pra escolher feeder (jogador, vencedor de match, ou BYE)
# - Renderer adapta drawConnectors pra ler feeders quando disponivel
# - autoAdvance respeita feeders (incluindo "loser" pra repescagens)
# - Fallback total pro layout classico se feeders nao definido (sem regressao)

$ErrorActionPreference = 'Stop'
Set-Location 'C:\Users\Douglas\Documents\tennis-point'

Write-Host "[1/4] Limpando locks" -ForegroundColor Yellow
Remove-Item .git\index.lock, .git\REBASE_HEAD.lock, .git\packed-refs.lock -Force -ErrorAction SilentlyContinue
if (Test-Path .git\rebase-apply) {
    & git am --abort 2>&1 | Out-Null
}

Write-Host "[2/4] Add e commit" -ForegroundColor Yellow
# -f garante que arquivos sao adicionados mesmo com gitattributes/eol confusos
git add -f bracket.js bracket-builder.js styles.css app.js index.html
if (Test-Path 'release_v4.12.0.ps1') { git add -f release_v4.12.0.ps1 }
# Re-checa se ha algo realmente diferente (algumas vezes CRLF mascara mudancas)
git diff --cached --name-only | ForEach-Object { Write-Host "  staged: $_" }

$staged = git diff --cached --name-only
if ($staged) {
    git commit -m "feat(admin): Construtor Modular de chave (v4.12.0)" `
               -m "- Tela admin-builder: monta a chave do zero, sem template fixo" `
               -m "- bracket.feeders[matchId] define quem alimenta cada slot:" `
               -m "  match (auto-advance vencedor/perdedor), entry (jogador direto), bye" `
               -m "- Templates pre-prontos: simples 8, 16, 32, 64 (1 click)" `
               -m "- Sidebar com lista de rounds (add/renomear/remover) + jogadores draggable" `
               -m "- Canvas com colunas por round: cada match clicavel, slots editaveis" `
               -m "- Drag-drop de jogador (sidebar) pra slot vazio" `
               -m "- Modal feeder: escolhe entre jogador direto, vencedor de outro match, ou BYE" `
               -m "- bracket.js drawConnectors agora le feeders (linha solida=winner, tracejada=loser)" `
               -m "- autoAdvanceWinnerInBracket respeita feeders (suporta repescagem com loser path)" `
               -m "- Fallback total pra logica classica quando feeders nao definido (zero regressao)"
} else {
    Write-Host "  nada pra commitar"
}

Write-Host "[3/4] Tag v4.12.0" -ForegroundColor Yellow
& git tag -a v4.12.0 -m "Release v4.12.0 - Construtor Modular" 2>&1 | Out-Null
git tag -l "v4.12.0" | ForEach-Object { Write-Host "  tag presente: $_" }

Write-Host "[4/4] Push" -ForegroundColor Yellow
git push origin main
git push origin --tags

Write-Host ""
Write-Host "OK v4.12.0 publicada. Aguarde ~1 min e Ctrl+Shift+R no site." -ForegroundColor Green
Write-Host "" -ForegroundColor Cyan
Write-Host "COMO USAR:" -ForegroundColor Cyan
Write-Host "1. Login admin -> Torneio -> Chave" -ForegroundColor White
Write-Host "2. Clica em 'Construtor' (botao azul na toolbar)" -ForegroundColor White
Write-Host "3. Botao 'Inicio rapido (template)' pra criar chave em 1 clique" -ForegroundColor White
Write-Host "4. OU: 'Adicionar round' -> escolhe nome -> '+' adiciona match" -ForegroundColor White
Write-Host "5. Clica em qualquer slot vazio pra escolher: jogador, vencedor de outro match, ou BYE" -ForegroundColor White
Write-Host "6. 'Salvar e ver chave' persiste no Supabase e mostra a chave renderizada" -ForegroundColor White
