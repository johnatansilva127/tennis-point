# Tennis Point v4.10.2 - Sorteio + UX
# - Botao "Sortear esta categoria" no estado vazio (admin)
# - Botao "Re-sortear" no header da chave (admin)
# - Animacoes fade-in nos cards e tabs
# - Remove a seta decorativa quebrada

$ErrorActionPreference = 'Stop'
Set-Location 'C:\Users\Douglas\Documents\tennis-point'

Write-Host "[1/4] Limpando locks" -ForegroundColor Yellow
Remove-Item .git\index.lock, .git\REBASE_HEAD.lock, .git\packed-refs.lock -Force -ErrorAction SilentlyContinue
if (Test-Path .git\rebase-apply) {
    & git am --abort 2>&1 | Out-Null
}

Write-Host "[2/4] Add e commit" -ForegroundColor Yellow
git add bracket.js styles.css app.js index.html
if (Test-Path 'release_v4.10.2.ps1') { git add release_v4.10.2.ps1 }

$staged = git diff --cached --name-only
if ($staged) {
    git commit -m "feat(bracket): sorteio direto da tela + UX desrobotizada (v4.10.2)" -m "- Botao 'Sortear esta categoria' aparece no estado vazio para admin" -m "- Botao 'Re-sortear' no header da chave (substitui seta decorativa quebrada)" -m "- Pilula 'X jogos' no header para usuario comum" -m "- Animacao fade-in nos cards (320ms cubic-bezier) com prefers-reduced-motion" -m "- Transicao smooth nas tabs com underline lima no hover" -m "- bindBracketSortActions: handlers para goto-draw e resort-bracket"
} else {
    Write-Host "  nada pra commitar"
}

Write-Host "[3/4] Tag v4.10.2" -ForegroundColor Yellow
& git tag -a v4.10.2 -m "Release v4.10.2 - sorteio direto + UX refinement" 2>&1 | Out-Null
git tag -l "v4.10.2" | ForEach-Object { Write-Host "  tag presente: $_" }

Write-Host "[4/4] Push" -ForegroundColor Yellow
git push origin main
git push origin --tags

Write-Host ""
Write-Host "OK v4.10.2 publicada. Aguarde ~1 min e Ctrl+F5 no site." -ForegroundColor Green
