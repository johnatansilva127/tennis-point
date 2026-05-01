# Tennis Point v4.12.1 - HOTFIX: Construtor abria tela vazia
# - Envolve renderBracketBuilder em try/catch
# - Mostra erro VISIVEL na tela em vez de tela em branco
# - Fallbacks pra STATE nao carregado, sem categoria, role nao admin
# - Garante STATE.brackets[catId] existe antes de usar (cria vazio se nao tiver)
# - Bump v=4.12.1 pra forcar reload do cache do browser

$ErrorActionPreference = 'Stop'
Set-Location 'C:\Users\Douglas\Documents\tennis-point'

Write-Host "[1/4] Limpando locks" -ForegroundColor Yellow
Remove-Item .git\index.lock, .git\REBASE_HEAD.lock, .git\packed-refs.lock -Force -ErrorAction SilentlyContinue
if (Test-Path .git\rebase-apply) {
    & git am --abort 2>&1 | Out-Null
}

Write-Host "[2/4] Add e commit" -ForegroundColor Yellow
git add -f bracket.js bracket-builder.js styles.css app.js index.html
if (Test-Path 'release_v4.12.1.ps1') { git add -f release_v4.12.1.ps1 }
git diff --cached --name-only | ForEach-Object { Write-Host "  staged: $_" }

$staged = git diff --cached --name-only
if ($staged) {
    git commit -m "fix(builder): hotfix v4.12.1 - tela em branco virou erro visivel" `
               -m "renderBracketBuilder agora envolve toda logica em try/catch e mostra" `
               -m "stack trace na tela quando algo quebra. Adiciona fallbacks pra:" `
               -m "STATE nao carregado, role nao-admin, sem categoria selecionada." `
               -m "Garante STATE.brackets[catId] existe antes de operar (cria vazio)." `
               -m "Bump v=4.12.1 pra forcar reload do cache do browser."
} else {
    Write-Host "  nada pra commitar"
}

Write-Host "[3/4] Tag v4.12.1" -ForegroundColor Yellow
& git tag -a v4.12.1 -m "Hotfix v4.12.1 - Construtor robusto" 2>&1 | Out-Null
git tag -l "v4.12.1" | ForEach-Object { Write-Host "  tag presente: $_" }

Write-Host "[4/4] Push" -ForegroundColor Yellow
git push origin main
git push origin --tags

Write-Host ""
Write-Host "OK v4.12.1 publicada. Agora:" -ForegroundColor Green
Write-Host "  1. Aguarde ~1 min (GitHub Pages deploy)" -ForegroundColor Cyan
Write-Host "  2. Ctrl+Shift+R no browser (limpa cache obrigatorio)" -ForegroundColor Cyan
Write-Host "  3. Login admin -> Torneio -> Chave -> Construtor" -ForegroundColor Cyan
Write-Host "  4. Se ainda der tela em branco/erro, manda print da tela" -ForegroundColor Cyan
Write-Host "     (vai mostrar mensagem de erro detalhada agora)" -ForegroundColor Cyan
