# ============================================================
# Tennis Point v4.9.0 - Release script (ASCII only)
# ============================================================
# Roda no PowerShell nativo do Windows.
# Uso:
#   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
#   .\complete_v4.9.0_release.ps1
# ============================================================

$ErrorActionPreference = 'Stop'
$repo = 'C:\Users\Douglas\Documents\tennis-point'

function Confirm-Step($msg) {
    $r = Read-Host "$msg [Y/n]"
    return ($r -eq '' -or $r -eq 'Y' -or $r -eq 'y')
}

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "Tennis Point v4.9.0 - Release Script" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path $repo)) {
    Write-Host "ERRO: pasta $repo nao existe" -ForegroundColor Red
    exit 1
}

Set-Location $repo
Write-Host "Working dir: $(Get-Location)"
Write-Host ""

# 1. Limpar locks
Write-Host "[1/7] Limpando locks stale do .git/" -ForegroundColor Yellow
$locks = @('.git\index.lock', '.git\REBASE_HEAD.lock', '.git\packed-refs.lock', '.git\HEAD.lock')
foreach ($lock in $locks) {
    if (Test-Path $lock) {
        try {
            Remove-Item $lock -Force -ErrorAction Stop
            Write-Host "  removido: $lock" -ForegroundColor Green
        } catch {
            Write-Host "  AVISO: nao consegui remover $lock" -ForegroundColor Red
            Write-Host "  Feche apps que seguram o repo (VS Code, GitHub Desktop, etc) e tente de novo." -ForegroundColor Red
            exit 1
        }
    }
}
Write-Host "  OK" -ForegroundColor Green
Write-Host ""

# 2. Abortar am session pendente
Write-Host "[2/7] Abortando am session pendente (se houver)" -ForegroundColor Yellow
if (Test-Path '.git\rebase-apply') {
    git am --abort 2>$null
    Write-Host "  am abortado" -ForegroundColor Green
} else {
    Write-Host "  nenhuma am session pendente" -ForegroundColor Green
}
Write-Host ""

# 3. Conferir working tree
Write-Host "[3/7] Conferindo mudancas no working tree" -ForegroundColor Yellow
$expected = @('app.js', 'bracket.js', 'index.html', 'styles.css', 'supabase-client.js')
$actualModified = (git diff --name-only) -split "`n" | Where-Object { $_ -ne '' }
foreach ($f in $expected) {
    if ($actualModified -contains $f) {
        Write-Host "  modificado: $f" -ForegroundColor Green
    } else {
        Write-Host "  FALTANDO: $f (pode ja ter sido commitado)" -ForegroundColor Yellow
    }
}
Write-Host ""
git diff --stat
Write-Host ""

if (-not (Confirm-Step "Continuar com os commits?")) {
    Write-Host "Abortado pelo usuario." -ForegroundColor Yellow
    exit 0
}

# 4. Commit dos 3 patches
Write-Host ""
Write-Host "[4/7] Commitando os 3 patches" -ForegroundColor Yellow

git add bracket.js styles.css
git commit -m "fix(brackets): RESOLVE bug das linhas conectoras invisiveis" -m "Reescrita do bracket.js para v2.0 com matches em position absolute, SVG dimensionado em pixels via JS, gap !important removido. Validado com Playwright em mobile e desktop."
Write-Host "  commit 1/3 OK" -ForegroundColor Green

git add app.js supabase-client.js
git commit -m "feat(realtime): wire Supabase Realtime + fix tournamentPlayers populate" -m "Liga subscribeBrackets e subscribeNotifications, popula STATE.tournamentPlayers a partir das entries das brackets carregadas."
Write-Host "  commit 2/3 OK" -ForegroundColor Green

git add index.html
git commit -m "chore: bump cache-bust pra v=4.9.0 (force reload em todos os clientes)"
Write-Host "  commit 3/3 OK" -ForegroundColor Green

# 5. Commit dos artefatos
Write-Host ""
Write-Host "[5/7] Commitando artefatos de release" -ForegroundColor Yellow
$artifacts = @(
    'CHANGELOG.md',
    'DEPLOY_CHECKLIST.md',
    'PR_DESCRIPTION.md',
    'CONCLUSAO_PROJETO_TENNIS_POINT_v4.9.0.md',
    'FINAL_STEPS_v4.9.0.md',
    'complete_v4.9.0_release.ps1',
    'migrations\005_realtime_setup_v4_9_0.sql',
    'tests\bracket-connectors.spec.js'
)
$existing = $artifacts | Where-Object { Test-Path $_ }
if ($existing.Count -gt 0) {
    git add $existing
    git commit -m "docs(release): adiciona changelog, checklist, PR description, SQL e teste de regressao v4.9.0"
    Write-Host "  commit de docs OK" -ForegroundColor Green
} else {
    Write-Host "  nenhum artefato encontrado, pulando" -ForegroundColor Yellow
}

# 6. Tag v4.9.0
Write-Host ""
Write-Host "[6/7] Criando tag v4.9.0" -ForegroundColor Yellow
git tag -a v4.9.0 -m "Release v4.9.0 - bracket connectors fix + Supabase Realtime"
Write-Host "  tag v4.9.0 criada" -ForegroundColor Green

git log --oneline -5
Write-Host ""

# 7. Push
if (Confirm-Step "Pushar tudo (origin main + tags)?") {
    Write-Host ""
    Write-Host "[7/7] Pushando..." -ForegroundColor Yellow
    git push origin main
    git push origin --tags
    Write-Host ""
    Write-Host "=============================================" -ForegroundColor Green
    Write-Host "v4.9.0 publicada com sucesso." -ForegroundColor Green
    Write-Host "=============================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Proximos passos:"
    Write-Host "  - Aguarde ~1 minuto para o GitHub Pages atualizar"
    Write-Host "  - Recarregue o site com Ctrl+F5 (limpa cache)"
    Write-Host "  - Smoke-test seguindo DEPLOY_CHECKLIST.md"
} else {
    Write-Host ""
    Write-Host "Push adiado. Quando estiver pronto, rode:" -ForegroundColor Yellow
    Write-Host "  git push origin main" -ForegroundColor Cyan
    Write-Host "  git push origin --tags" -ForegroundColor Cyan
}
