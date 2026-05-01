# Tennis Point v4.11.1 - HOTFIX: chaves voltam ao normal
# - Reverte arquitetura "canvas unico" do v4.11.0 que estava sumindo as chaves
# - Mantem layout em COLUNAS (.bracket-round) que ja funcionava em v4.10.5
# - Drag livre vira camada OPCIONAL via transform:translate sobre a posicao natural
# - Custom positions aplicadas com fallback: se STATE nao acessivel, layout natural intacto
# - Sem regressao: usuarios sem mover nada veem exatamente o mesmo de v4.10.5

$ErrorActionPreference = 'Stop'
Set-Location 'C:\Users\Douglas\Documents\tennis-point'

Write-Host "[1/4] Limpando locks" -ForegroundColor Yellow
Remove-Item .git\index.lock, .git\REBASE_HEAD.lock, .git\packed-refs.lock -Force -ErrorAction SilentlyContinue
if (Test-Path .git\rebase-apply) {
    & git am --abort 2>&1 | Out-Null
}

Write-Host "[2/4] Add e commit" -ForegroundColor Yellow
git add bracket.js styles.css app.js index.html
if (Test-Path 'release_v4.11.1.ps1') { git add release_v4.11.1.ps1 }

$staged = git diff --cached --name-only
if ($staged) {
    git commit -m "fix(bracket): hotfix v4.11.1 - chaves voltam ao normal" `
               -m "v4.11.0 trocou colunas por canvas unico e quebrou render em alguns cenarios" `
               -m "v4.11.1 reverte pra layout em colunas (igual v4.10.5) e adiciona drag livre" `
               -m "como camada OPCIONAL: customPositions aplicado via transform:translate sobre" `
               -m "a posicao natural. Se algo falhar, fallback automatico pro layout antigo." `
               -m "Funcoes admin novas (bindBracketFreeDrag, bindMatchReorder, scheduleBracketSave)" `
               -m "permanecem disponiveis. CSS limpo: bk-drag-handle, bk-saved-pill, has-custom-pos."
} else {
    Write-Host "  nada pra commitar"
}

Write-Host "[3/4] Tag v4.11.1" -ForegroundColor Yellow
& git tag -a v4.11.1 -m "Hotfix v4.11.1 - chaves voltam ao normal" 2>&1 | Out-Null
git tag -l "v4.11.1" | ForEach-Object { Write-Host "  tag presente: $_" }

Write-Host "[4/4] Push" -ForegroundColor Yellow
git push origin main
git push origin --tags

Write-Host ""
Write-Host "OK v4.11.1 publicada. Aguarde ~1 min e Ctrl+F5 no site." -ForegroundColor Green
Write-Host "Validacao: chaves voltam a aparecer normais. Drag livre fica disponivel" -ForegroundColor Cyan
Write-Host "no Modo Edicao via alca :: no canto do match." -ForegroundColor Cyan
