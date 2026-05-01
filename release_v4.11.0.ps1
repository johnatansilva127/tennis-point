# Tennis Point v4.11.0 - Drag-and-drop livre de matches
# - Bracket.js v3.0: canvas unico, posicoes absolutas, customPositions persistidas
# - Drag handle em cada match (modo edicao admin) pra mover livremente em X,Y
# - Snap to grid de 8px
# - Reorder de matches: drag um sobre outro da mesma round = swap completo
# - Auto-save debounced 450ms no Supabase (Realtime propaga)
# - Botao "Resetar layout" volta tudo pro automatico

$ErrorActionPreference = 'Stop'
Set-Location 'C:\Users\Douglas\Documents\tennis-point'

Write-Host "[1/4] Limpando locks" -ForegroundColor Yellow
Remove-Item .git\index.lock, .git\REBASE_HEAD.lock, .git\packed-refs.lock -Force -ErrorAction SilentlyContinue
if (Test-Path .git\rebase-apply) {
    & git am --abort 2>&1 | Out-Null
}

Write-Host "[2/4] Add e commit" -ForegroundColor Yellow
git add bracket.js styles.css app.js index.html
if (Test-Path 'release_v4.11.0.ps1') { git add release_v4.11.0.ps1 }

$staged = git diff --cached --name-only
if ($staged) {
    git commit -m "feat(admin): drag-and-drop livre de matches no bracket (v4.11.0)" `
               -m "- Bracket renderer v3.0: canvas unico (matches em position:absolute)" `
               -m "- Cada match tem drag handle (...) em modo edicao do admin" `
               -m "- Custom positions {x, y} persistidas em bracket.customPositions JSONB" `
               -m "- Snap to grid 8px, conectores SVG redesenham em tempo real" `
               -m "- Reorder: arrastar match sobre outro da mesma round = swap completo" `
               -m "- Auto-save debounced 450ms no Supabase, Realtime propaga" `
               -m "- Botao Resetar layout volta tudo pro automatico" `
               -m "- Pilula 'Salvo' no canto inferior direito apos cada save"
} else {
    Write-Host "  nada pra commitar"
}

Write-Host "[3/4] Tag v4.11.0" -ForegroundColor Yellow
& git tag -a v4.11.0 -m "Release v4.11.0 - drag-and-drop livre admin" 2>&1 | Out-Null
git tag -l "v4.11.0" | ForEach-Object { Write-Host "  tag presente: $_" }

Write-Host "[4/4] Push" -ForegroundColor Yellow
git push origin main
git push origin --tags

Write-Host ""
Write-Host "OK v4.11.0 publicada. Aguarde ~1 min e Ctrl+F5 no site." -ForegroundColor Green
Write-Host "Teste: login admin -> Torneio -> Chave -> ativar Modo Edicao -> arrastar pela alca ::" -ForegroundColor Cyan
