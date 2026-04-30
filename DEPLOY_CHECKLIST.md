# Checklist de Deploy — Tennis Point v4.9.0

Imprime e marca conforme avança. Cada bloco tem um critério de "passou ou não passou" claro.

---

## Pré-deploy (no Supabase, antes do merge)

- [ ] **Realtime habilitado em `brackets`.**
  Ir em `Database → Replication → supabase_realtime` e confirmar que `brackets` está marcada. Se não estiver, rodar `supabase_realtime_setup.sql` (seção 1).
  *Critério:* a tabela aparece na lista de "Source" da publicação `supabase_realtime`.

- [ ] **Realtime habilitado em `notifications`.**
  Mesmo lugar, mesma checagem.
  *Critério:* idem acima.

- [ ] **RLS de `brackets` permite `SELECT` para `authenticated`.**
  Conferir em `Authentication → Policies → brackets`. Deve haver pelo menos uma policy de `SELECT` ativa. Se houver leitura pública (tela do torneio sem login), checar `anon` também.
  *Critério:* policy ativa com `cmd = SELECT` e expressão que cobre os roles necessários.

- [ ] **RLS de `notifications` filtra por usuário.**
  Policy `SELECT` deve ter `using (user_id = auth.uid())`.
  *Critério:* idem.

- [ ] **Smoke do canal Realtime no painel.**
  Painel Supabase → `Realtime` → escolher canal `brackets:*`. Em outra aba, fazer um `UPDATE` qualquer numa row de `brackets`. O painel deve mostrar o evento chegando em até ~2s.
  *Critério:* evento aparece no monitor do painel.

---

## Deploy (aplicar os patches e publicar)

- [ ] **Branch limpa.**
  ```bash
  git status   # tem que estar clean
  git pull origin main
  ```

- [ ] **Aplicar os 3 patches em ordem.**
  ```bash
  git am 0001-fix-brackets-RESOLVE-bug-das-linhas-conectoras-invis.patch \
         0002-feat-realtime-wire-Supabase-Realtime-fix-tournamentP.patch \
         0003-chore-bump-cache-bust-pra-v-4.9.0-force-reload-em-to.patch
  ```
  *Critério:* `git log --oneline -3` mostra os 3 commits na ordem certa, sem conflitos.

- [ ] **Build local (se aplicável).**
  Esse projeto não tem build step (HTML+JS+CSS direto), então só conferir que `index.html` carrega localmente sem erro de console.
  ```bash
  npx http-server . -p 8080
  ```

- [ ] **Tag de release.**
  ```bash
  git tag -a v4.9.0 -m "Release v4.9.0 — bracket fix + Realtime"
  git push origin main --tags
  ```

- [ ] **Deploy no host.**
  Hostgator/Netlify/Vercel/onde estiver — push do conteúdo. Aguardar propagação.
  *Critério:* `curl -I https://tennispoint.app/index.html` retorna 200 e o `Last-Modified` é recente.

- [ ] **Invalidação de cache do CDN (se houver).**
  Cloudflare/CDN próprio — purgar `index.html`, `bracket.js`, `styles.css`, `app.js`, `supabase-client.js`.
  *Critério:* `curl https://tennispoint.app/index.html | grep "v=4.9.0"` retorna a string.

---

## Pós-deploy (validação em produção)

- [ ] **Smoke-test 2 minutos.**
  Abrir `https://tennispoint.app` em dois browsers diferentes (admin + usuário comum no mesmo torneio).

- [ ] **Conectores visíveis em R64.**
  Como usuário comum, ir até a chave da Categoria A. Visualmente confirmar:
  *Critério:* todas as linhas conectoras aparecem entre os rounds. Pelo menos algumas linhas devem estar em verde-lima brilhante (winner-paths).

- [ ] **Realtime de scores funcionando.**
  Como admin, atualizar score de qualquer match. No outro browser:
  *Critério:* toast "Chave atualizada em tempo real" aparece em ≤ 2s e o card do match mostra o novo score, sem reload.

- [ ] **Realtime de notificações funcionando.**
  Disparar uma notificação para o usuário comum (via admin ou trigger).
  *Critério:* badge do sino atualiza em ≤ 2s sem reload.

- [ ] **Console limpo.**
  DevTools → Console. Filtrar por errors.
  *Critério:* sem `Uncaught`, sem `Failed to load`, sem warnings de Supabase Realtime do tipo "channel timed out".

- [ ] **Cache invalidado nos clientes existentes.**
  Em um browser que já tinha `v4.8.2` cacheado: hard reload (Cmd+Shift+R / Ctrl+F5).
  *Critério:* DevTools → Network → `bracket.js?v=4.9.0` retorna `200` (não `304`).

---

## Monitoramento nas primeiras 24h

- [ ] **Logs do Supabase → Realtime.** Verificar a cada algumas horas se aparecem erros de conexão recorrentes ou desconexões abruptas.

- [ ] **Métricas de Concurrent Connections.** Abrir Supabase → Settings → Usage. Confirmar que não chega perto do limite do plano (Free: 200, Pro: 500).

- [ ] **Sentry / log errors do front.** Se houver, monitorar erros novos com stack trace tocando `bracket.js` ou `app.js`.

- [ ] **Feedback de usuários.** Canal de suporte / WhatsApp da Comunidade. Pergunta-chave: "as linhas da chave estão aparecendo bem?" e "atualização do score apareceu sozinha pra você?"

---

## Plano de rollback (se algo der errado)

**Cenário A — Bug visual no bracket pós-deploy:**
```bash
git revert <hash do commit 0001>
git push origin main
# + invalidar cache
```

**Cenário B — Realtime instável (consumo de quota, errors em massa):**
```bash
git revert <hash do commit 0002>
git push origin main
# Mantém o fix do bracket, desliga só o Realtime.
```

**Cenário C — Tudo deu errado:**
```bash
git reset --hard <commit antes do v4.9.0>
git push --force origin main
# Última opção. Confirmar com a equipe antes.
```

---

## Done?

Se chegou até aqui marcando tudo, o deploy está concluído. Comunicar no canal de equipe:

> **Tennis Point v4.9.0 no ar.** Linhas conectoras voltaram a aparecer e os scores agora atualizam em tempo real entre dispositivos. Reportem qualquer comportamento estranho.
