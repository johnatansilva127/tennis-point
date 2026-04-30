# Tennis Point v4.9.0 — Conectores do bracket + Realtime ao vivo

## Sumário

Release de correção crítica de UX e ativação do modo "ao vivo" da plataforma. Três commits sequenciais que resolvem o bug das linhas conectoras invisíveis, ligam o Supabase Realtime no fluxo de torneio e notificações, e forçam invalidação de cache em todos os clientes.

## O que muda

**Para o usuário final**

- As linhas conectoras do bracket voltam a aparecer em torneios reais (R64 → Final), com o trajeto do vencedor pintado em verde-lima de ponta a ponta.
- Scores atualizados pelo admin em qualquer dispositivo aparecem em tempo real para todos os clientes conectados, com toast discreto avisando da atualização.
- Notificações novas atualizam o badge do sino sem precisar de reload.
- Em primeiro login (sem localStorage), o highlight "VOCÊ", a aba "Minhas categorias" e a contagem de slots/categorias passam a funcionar.

**Para o time**

- `bracket.js` v2.0: matches em `position: absolute` com Y calculado pela média dos alimentadores. Imune a override de CSS em `gap`/`padding-top`.
- SVG do bracket é dimensionado em pixels via JS (não mais clipado ao viewport).
- `STATE.tournamentPlayers` é populado a partir das entries das brackets carregadas do Supabase.
- Helpers de Realtime: `TP.Realtime.subscribeBrackets(tournamentId, cb)`, `subscribeNotifications(userId, cb)`, `unsubscribe(channel)`.
- Cache-bust de `?v=4.8.2` para `?v=4.9.0` em todos os assets.

## Commits incluídos

1. `fix(brackets): RESOLVE bug das linhas conectoras invisíveis` (`29e7424`)
2. `feat(realtime): wire Supabase Realtime + fix tournamentPlayers populate` (`4db7bb0`)
3. `chore: bump cache-bust pra v=4.9.0 (force reload em todos os clientes)` (`f2640bf`)

## Arquivos alterados

| Arquivo | + | − |
|---|---|---|
| `bracket.js` | 167 | 44 |
| `styles.css` | 19 | 22 |
| `app.js` | 96 | 1 |
| `supabase-client.js` | 21 | 0 |
| `index.html` | 6 | 6 |

## Por que `position: absolute` em vez de `flex+gap`

A causa-raiz do bug das conectoras invisíveis era um `gap: 32px !important` no fim do `styles.css` que sobrescrevia silenciosamente o gap calculado em `layoutBracket()`. O JS desenhava paths nas coordenadas teóricas, mas os matches reais ficavam empilhados — paths viravam tracinhos minúsculos em coordenadas erradas.

Em vez de só remover o `!important` (frágil — qualquer regra futura pode reintroduzir o problema), reescrevemos o layout para `position: absolute`. Cada match recebe um `top` calculado como o ponto médio entre os dois alimentadores do round anterior. Vantagens:

- Imune a `!important` em `gap`/`padding-top` de qualquer regra CSS.
- Botão "+ Match em..." (modo edição admin) também é reposicionado em absoluto, deixando de encavalar nos cards.
- Algoritmo recursivo, equivalente à fórmula clássica de padding/gap dobrando, mas robusto a BYEs estruturais e brackets assimétricos.

## Como testar

**Smoke-test mínimo (2 minutos)**

1. Abrir torneio em produção em dois browsers diferentes (admin + usuário comum).
2. Admin atualiza score de um match na Categoria A.
3. Usuário deve ver toast "Chave atualizada em tempo real" e o card re-renderizado em até ~1s, sem reload.
4. Usuário comum entra na chave de R64 → vê todas as linhas conectoras visíveis, com winner-path lima nos rounds já decididos.
5. Trigger uma notificação para o usuário comum → badge do sino atualiza sem reload.

**Playwright regressão**

Ver `tests/bracket-connectors.spec.js` neste PR — cobre R64 mobile e desktop, com asserções de quantidade de paths e classes `winner-path`.

## Pré-requisitos no Supabase

Antes do merge:

- [ ] Tabela `brackets` com Realtime habilitado (`Database → Replication → supabase_realtime`).
- [ ] Tabela `notifications` com Realtime habilitado.
- [ ] RLS de `brackets`: policy `SELECT` para `authenticated` (e `anon` se houver leitura pública).
- [ ] RLS de `notifications`: policy `SELECT WHERE user_id = auth.uid()`.

SQL de configuração: `supabase_realtime_setup.sql` neste PR.

## Riscos

**Médio:** reescrita do layout do bracket é grande. Validei com Playwright em mobile (412px) e desktop (1440px) usando dados reais do `seedTournament2026` — 124 paths no R64 da Cat A, 54 winner-paths em lima. Mas vale rodar cross-browser (Safari, Firefox) antes do merge.

**Baixo:** Realtime em RLS apertada pode silenciar eventos sem erro. Se algo "não atualiza" pós-deploy, primeiro lugar para olhar é Supabase → Logs → Realtime.

**Negligível:** o bump de `?v=` é a forma idiomática de invalidar cache. Único cuidado: CDN/proxy com TTL longo no `index.html` pode demorar minutos para clientes pegarem o novo.

## Rollback

Cada commit é independente. Em caso de problema:

```bash
git revert f2640bf  # cache bust  — sem efeito sozinho
git revert 4db7bb0  # realtime    — desliga Realtime, mantém populate fix
git revert 29e7424  # bracket fix — volta ao bug das conectoras
```

Recomendação: se Realtime causar instabilidade em produção, reverter só o `4db7bb0` (mantém o fix do bracket, que é o crítico).

## Próximos passos pós-merge

Tickets de baixa prioridade já mapeados (ver `CONCLUSAO_PROJETO_TENNIS_POINT_v4.9.0.md`):

1. Telemetria leve no `subscribeRealtime` — eventos/minuto.
2. Debounce do `navigate('tournament')` em rajadas (50ms).
3. Suprimir toast quando o evento veio do próprio usuário.
4. Promover o teste Playwright para CI permanente.
