# Tennis Point v4.9.0 — Passos finais

Os 3 patches já foram aplicados ao **working tree** do repo (não estão commitados). Eu não consegui rodar `git commit` porque o `.git/index.lock` está preso pelo Windows (algum processo segura o repo — VS Code, Sourcetree, GitHub Desktop ou similar).

Para fechar o release, siga os passos abaixo no terminal **nativo do Windows** (PowerShell ou Git Bash), na pasta `C:\Users\Douglas\Documents\tennis-point`:

## 1. Liberar os locks do git

Feche qualquer aplicativo que esteja com o repo aberto (VS Code, Sourcetree, GitHub Desktop, etc) e remova os locks stale:

```powershell
cd C:\Users\Douglas\Documents\tennis-point
Remove-Item .git\index.lock, .git\REBASE_HEAD.lock, .git\packed-refs.lock -ErrorAction SilentlyContinue
git am --abort
git status
```

O `git status` deve mostrar apenas mudanças nos 5 arquivos: `app.js`, `bracket.js`, `index.html`, `styles.css`, `supabase-client.js` — mais novos arquivos `CHANGELOG.md`, `DEPLOY_CHECKLIST.md`, `PR_DESCRIPTION.md`, `CONCLUSAO_PROJETO_TENNIS_POINT_v4.9.0.md`, `FINAL_STEPS_v4.9.0.md`, `migrations/005_realtime_setup_v4_9_0.sql`, `tests/bracket-connectors.spec.js`.

## 2. Confirmar que as mudanças estão certas

```powershell
git diff --stat
```

Esperado:

```
 app.js             |  99 +++++++++++++++++++++++++-
 bracket.js         | 211 +++++++++++++++++++++++++++++++++++----
 index.html         |  12 +--
 styles.css         |  41 +++++------
 supabase-client.js |  21 ++++++
 5 files changed, 315 insertions(+), 69 deletions(-)
```

## 3. Commitar os 3 patches separadamente (preserva histórico limpo)

```powershell
# Patch 1 — bracket fix
git add bracket.js styles.css
git commit -m "fix(brackets): RESOLVE bug das linhas conectoras invisiveis" `
           -m "Causa raiz: gap 32px !important em .bracket-round sobrescrevia gap" `
           -m "calculado em layoutBracket(). Reescrita pra position:absolute, SVG" `
           -m "dimensionado em px via JS, !important removidos."

# Patch 2 — realtime + populate fix
git add app.js supabase-client.js
git commit -m "feat(realtime): wire Supabase Realtime + fix tournamentPlayers populate" `
           -m "Liga subscribeBrackets e subscribeNotifications, popula" `
           -m "STATE.tournamentPlayers a partir das entries das brackets."

# Patch 3 — cache bust
git add index.html
git commit -m "chore: bump cache-bust pra v=4.9.0 (force reload em todos os clientes)"
```

> Alternativa mais simples (1 commit só, perde a granularidade):
> ```powershell
> git add app.js bracket.js index.html styles.css supabase-client.js
> git commit -m "release v4.9.0 — bracket fix + realtime + cache bust"
> ```

## 4. Commitar os artefatos de release

```powershell
git add CHANGELOG.md DEPLOY_CHECKLIST.md PR_DESCRIPTION.md `
        CONCLUSAO_PROJETO_TENNIS_POINT_v4.9.0.md FINAL_STEPS_v4.9.0.md `
        migrations/005_realtime_setup_v4_9_0.sql `
        tests/bracket-connectors.spec.js
git commit -m "docs(release): adiciona changelog, checklist, PR description e teste de regressao v4.9.0"
```

## 5. Criar a tag v4.9.0

```powershell
git tag -a v4.9.0 -m "Release v4.9.0 — bracket connectors fix + Supabase Realtime"
```

## 6. Push

```powershell
git push origin main --tags
```

## 7. Configurar o Supabase

No SQL Editor do Supabase, rodar:

```
migrations/005_realtime_setup_v4_9_0.sql
```

Confirmar no painel `Database → Replication → supabase_realtime` que `brackets` e `notifications` aparecem listadas.

## 8. Smoke-test em produção

Seguir o `DEPLOY_CHECKLIST.md` seção "Pós-deploy".

---

## Por que precisei parar aqui?

O Cowork roda comandos `bash` num sandbox Linux que monta sua pasta do Windows como NTFS. O git da pasta cria arquivos de lock (`.git/index.lock`, `.git/packed-refs.lock`) e tenta deletá-los logo depois — mas o NTFS bloqueou o `unlink` quando outro processo Windows segurou os arquivos. Resultado: cada `git commit` falha com "Operation not permitted".

A boa notícia: as **mudanças de código já estão aplicadas** no working tree. É só commitar do seu lado.

---

## Resumo do que está pronto neste momento

- [x] 3 patches aplicados via `git apply` no working tree
- [x] Sintaxe validada com `node --check` em bracket.js, app.js, supabase-client.js
- [x] HTML balanceado em index.html (`?v=4.9.0` em todos os 4 assets)
- [x] CHANGELOG.md no formato Keep a Changelog
- [x] DEPLOY_CHECKLIST.md com pré/durante/pós-deploy
- [x] PR_DESCRIPTION.md pronto pra colar no GitHub/GitLab
- [x] CONCLUSAO_PROJETO_TENNIS_POINT_v4.9.0.md (análise técnica completa)
- [x] migrations/005_realtime_setup_v4_9_0.sql (idempotente)
- [x] tests/bracket-connectors.spec.js (Playwright, mobile + desktop)
- [ ] **Commits** — depende de você (passos 3-4 acima)
- [ ] **Tag v4.9.0** — depende de você (passo 5)
- [ ] **Push** — depende de você (passo 6)
- [ ] **Supabase config** — depende de você (passo 7)
- [ ] **Deploy + smoke-test** — depende de você (passo 8)
