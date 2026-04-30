# Tennis Point v4.9.0 — Análise Técnica e Conclusão do Projeto

**Autor da análise:** revisão consolidada dos patches `0001`, `0002`, `0003`
**Data:** 30 de abril de 2026
**Branch alvo:** `main` (3 commits sequenciais)
**Autor dos patches:** Claude (via Johnatan) — `claude@tennispoint.dev`

---

## 1. Visão geral

O conjunto de três patches encerra um ciclo de correção crítica de UX e ativa o modo "ao vivo" da plataforma. São mudanças de natureza distinta, mas inter-dependentes — por isso entram juntas no bump de versão `v4.9.0`:

1. **Patch 1 — `fix(brackets)`** corrige um bug visual de alta gravidade: as linhas conectoras entre matches do bracket estavam invisíveis em torneios reais (R64 → Final), o que comprometia a leitura da chave inteira.
2. **Patch 2 — `feat(realtime)`** liga o Supabase Realtime no fluxo de torneio e notificações, e conserta o populate de `STATE.tournamentPlayers` em logins sem localStorage.
3. **Patch 3 — `chore: cache-bust`** sobe os parâmetros `?v=` de `4.8.2` → `4.9.0` no `index.html` para forçar todos os clientes a baixarem o JS/CSS corrigidos.

Total: 3 commits, 4 arquivos alterados (`bracket.js`, `styles.css`, `app.js`, `supabase-client.js`, `index.html`), 315 linhas adicionadas e 69 removidas (aproximadamente).

---

## 2. Análise por patch

### 2.1 Patch 1 — `fix(brackets): RESOLVE bug das linhas conectoras invisíveis`

**Causa-raiz identificada:** uma regra CSS no final do `styles.css` (linha 1891) usava `gap: 32px !important` em `.bracket-round`. Isso sobrescrevia silenciosamente o `gap` calculado por `layoutBracket()` em JS. O JS continuava desenhando paths SVG nas coordenadas teóricas, mas como os matches reais ficavam empilhados quase encostados, os paths viravam tracinhos minúsculos em coordenadas erradas — visualmente indistinguíveis de "sem linha".

**Solução em duas frentes:**

**(a) Reescrita do `bracket.js` para v2.0 — posicionamento absoluto.**

A estratégia anterior dependia de `flex` + `gap` + `padding-top` calculados em JS. Qualquer regra CSS conflitante quebrava o alinhamento. A v2.0 muda para `position: absolute`: cada match é colocado em um `top` calculado como o ponto médio entre os dois alimentadores do round anterior. Vantagens:

- Imune a `!important` em `gap`/`padding-top`.
- O botão "+ Match em..." (modo edição admin) também é reposicionado em absoluto, então não encavala mais nas linhas.
- Algoritmo recursivo: `y(match[i] @ ri) = média( y(match[2i] @ ri-1), y(match[2i+1] @ ri-1) )` — equivalente à fórmula clássica de `padding/gap` dobrando a cada round, mas sem depender do CSS.
- Fallback robusto para BYEs estruturais e brackets assimétricos (R32 sem R64 alimentador).
- Re-layout idempotente após `document.fonts.ready` (cobre o caso raro de medição com fonts ainda carregando).
- `MutationObserver` filtra apenas `childList` e `data-has-winner`, com flag `inLayout` para evitar loop infinito quando o próprio JS reescreve `style` dos matches.
- Removida a lógica de RAF (era flaky em iframes throttled, preview e mobile com page hidden — apontada como causa real de medições com `scrollWidth=0`).

**(b) Limpeza do `styles.css`.**

- Removido o `gap: 32px !important` fatídico.
- Removida regra duplicada antiga de `.bracket-svg path` no topo do arquivo (a "boa" mora ~linha 1868).
- **Crítico:** removidos `width: 100%` e `height: 100%` de `.bracket-svg`. Esses valores clipavam o SVG ao viewport visível — em R64, com ~6700px de altura total, as linhas dos rounds da direita simplesmente não existiam no SVG. Agora o JS define `width`/`height` em pixels exatos via `setAttribute`.
- Adicionado `overflow: visible` no `.bracket-svg` por garantia.
- Removidos `!important` desnecessários das regras de path (já não eram precisos depois de remover a regra duplicada).
- `winner-path` em verde-lima (`rgb(200, 255, 61)`) com `drop-shadow` duplo para "iluminar" o trajeto do vencedor de R64 até a Final.

**Validação reportada:** Playwright em viewport mobile (412px) e desktop (1440px) com dados reais do `seedTournament2026`. Resultado: 124 paths no R64 da Categoria A, 54 deles em `winner-path` lima brilhante, alinhamento preciso nos 6 rounds (R64 → R32 → R16 → QF → SF → F).

**Risco residual:** baixo. A mudança de `flex` para `position: absolute` é uma reescrita semântica significativa — vale uma checagem rápida em qualquer plugin/componente que lia `.bracket-round` esperando comportamento de flex container (não vi nenhum nos diffs, mas convém um `grep` rápido).

---

### 2.2 Patch 2 — `feat(realtime): wire Supabase Realtime + fix tournamentPlayers populate`

**Três correções/features encadeadas:**

**(1) `loadAppData` agora popula `STATE.tournamentPlayers`.**

Bug latente: usuários logando pela primeira vez (sem `localStorage` populado) ficavam com `STATE.tournamentSlots = []`, o que quebrava silenciosamente:
- O highlight `'VOCÊ'` nos slots da chave.
- A aba `'Minhas categorias'` no perfil.
- A contagem de slots/categorias.

A correção achata `entries` de todas as `brackets` retornadas em um único array canônico, com fallback de `categoryKey` vindo do `category_id` da bracket — útil para entries legadas que não tinham o campo. Substitui em vez de concatenar para evitar duplicação entre logins na mesma sessão.

**(2) Subscribe Realtime na tabela `brackets`.**

Filtro por `tournament_id`. Quando o admin atualiza scores/winners em qualquer dispositivo, todos os clientes conectados recebem o novo `data` (JSONB) e re-renderizam automaticamente a tela do torneio se estiverem visualizando a categoria afetada. Toast discreto avisa o usuário ("Chave atualizada em tempo real").

Mesmo padrão para a tabela `notifications` filtrada por `user_id`: novos `INSERT` chegam ao vivo, badge do sino atualiza sem reload.

**(3) `supabase-client.js`: `subscribeBrackets` substitui `subscribeMatches`.**

Detalhe importante de modelagem: a tabela `matches` está vazia. Os matches moram dentro de `brackets.data` (JSONB). O patch mantém `subscribeMatches` por compatibilidade, mas `subscribeBrackets` é a chamada correta. Adicionado um helper `unsubscribe(channel)` para limpar canais no logout — previne memory leak e subscriptions órfãs.

**Robustez:** todo o `subscribeRealtime()` está dentro de `try/catch`. Se RLS ou conexão falharem, o app continua funcional via re-navegação manual. Apenas um `console.warn` é emitido. Boa decisão — Realtime nunca deveria ser caminho crítico.

**Risco residual:**
- **RLS na tabela `brackets`:** vale conferir que a policy de `SELECT` permite o `tournament_id` filtrado para o role `authenticated` (e idealmente `anon` se houver leitura pública). Sem isso, o subscribe abre mas não chega payload.
- **Quotas de Realtime do Supabase:** com vários torneios e muitos clientes simultâneos, vale monitorar `Concurrent Connections` no painel. Plano free: 200; pro: 500.
- **`navigate('tournament')` no callback:** re-renderiza a tela inteira a cada change. Em torneios com 128+ matches sendo atualizados em rajada, pode haver flicker. Considerar debouncing futuramente.

---

### 2.3 Patch 3 — `chore: bump cache-bust pra v=4.9.0`

Direto ao ponto: bump de `?v=4.8.2` → `?v=4.9.0` em todos os assets (`styles.css`, `supabase-client.js`, `data.js`, `bracket.js`, `app.js`) e atualização do label `Tennis Point v4.0.0` → `Tennis Point v4.9.0` no rodapé do drawer.

**Observação sobre o label:** o rodapé estava em `v4.0.0` enquanto os assets já iam para `4.8.2`. Foi corrigido para `v4.9.0`, alinhando label com versão real dos assets.

**Risco:** zero. É a forma idiomática de invalidar cache em apps sem build step. Service worker é pass-through (registrado no `index.html` apenas para habilitar instalação PWA no Android Chrome), não há cache estratégia conflitante.

---

## 3. Impacto consolidado

| Área | Antes | Depois |
|---|---|---|
| Linhas conectoras do bracket | Invisíveis ou minúsculas em R64+ | 100% visíveis, winner-path lima de R64 à Final |
| Posicionamento de matches | Flex+gap quebrável por CSS | Absolute, imune a override CSS |
| SVG do bracket | Clipado ao viewport | Cobre toda a árvore (~6700px em R64) |
| `STATE.tournamentPlayers` em login novo | Vazio (UI quebrada) | Populado a partir das entries de todas as brackets |
| Atualização de scores entre dispositivos | Apenas via reload manual | Ao vivo via Realtime, com toast |
| Notificações novas | Aparecem só após reload | Badge do sino atualiza ao vivo |
| Cache de browsers em `v4.8.2` | Serviam JS/CSS bugados | Force-reload para v4.9.0 |

---

## 4. Pré-requisitos para deploy

Para que `v4.9.0` funcione plenamente em produção, garantir que:

1. **Supabase: tabela `brackets` está com Realtime habilitado** (`Database → Replication → supabase_realtime`).
2. **RLS de `brackets`:** policy de `SELECT` permite leitura pelos roles que assinam (`authenticated` no mínimo).
3. **RLS de `notifications`:** policy de `SELECT` filtra por `user_id = auth.uid()` para que cada usuário só receba as próprias.
4. Os módulos JS expõem o namespace `TP.Realtime.{subscribeBrackets, subscribeNotifications, unsubscribe}` — checagem rápida no `supabase-client.js` global.
5. Após deploy, smoke-test em dois browsers diferentes logados como admin e usuário comum: admin atualiza score, usuário vê toast e bracket re-renderizado.

---

## 5. Riscos e pontos de atenção

**Médio:**
- A reescrita do layout do bracket é grande. Vale Playwright cross-browser (Chromium, Safari, Firefox) e em pelo menos: R8, R16, R32, R64. Mobile + desktop. Estados: edit mode on/off, com e sem winners definidos, com BYEs estruturais.
- `MutationObserver` com flag `inLayout` é uma proteção contra loop, mas vale validar que edits rápidos consecutivos no admin não disparam re-layout indefinido.

**Baixo:**
- Realtime em RLS apertada pode silenciar eventos sem erro. Se algo "não atualiza", primeiro lugar para olhar é o painel `Logs → Realtime` do Supabase.
- Toast "Chave atualizada em tempo real" pode incomodar se o usuário próprio é quem disparou a mudança. Considerar suprimir o toast quando `payload.commit_timestamp` for de uma ação local.

**Negligível:**
- Bump de versão é seguro. Único cuidado: se algum CDN/proxy tiver TTL longo, pode demorar minutos para os clientes pegarem o novo `index.html`.

---

## 6. Próximos passos sugeridos (pós-merge)

Em ordem de valor:

1. **Smoke-test pós-deploy** com dois clientes (admin + comum) logados simultaneamente em torneio ao vivo, validando: re-render automático da chave após score, badge de notificação aparecendo sem reload, ausência de console errors.
2. **Telemetria leve** no `subscribeRealtime` — contar quantos eventos chegam por minuto. Útil para detectar desconexão silenciosa.
3. **Debounce do `navigate('tournament')`** quando vários `payload` chegam em rajada (50ms é suficiente).
4. **Suprimir toast** quando o evento veio do próprio usuário (compare `payload.new.updated_by` com `STATE.user.id`).
5. **Cobertura E2E:** consolidar o teste Playwright que validou o patch 1 num arquivo `tests/bracket-connectors.spec.js` checado no CI, para regressão futura.
6. **Review da policy RLS de `brackets`** para confirmar que `SELECT` está aberto para `authenticated` e `anon` (se aplicável). Sem isso, o Realtime abre canal mas não entrega payload.

---

## 7. Conclusão

Os três patches encerram um ciclo claro: o `0001` resolve um bug visual crítico que comprometia a usabilidade de torneios reais; o `0002` transforma a plataforma de "snapshot recarregável" em "ao vivo de verdade", além de corrigir um populate latente de estado; o `0003` garante que todos os clientes peguem a versão nova.

O conjunto está pronto para merge na `main` e deploy. A arquitetura final do bracket (posicionamento absoluto, SVG dimensionado por JS, observers idempotentes, falha-aberta no Realtime) é mais robusta e mais fácil de manter do que a versão `v4.8.x`. A causa-raiz do bug foi identificada com precisão e tratada na origem, não como sintoma.

**Recomendação:** aplicar os três patches em ordem (`git am 0001-*.patch 0002-*.patch 0003-*.patch`), publicar `v4.9.0`, executar smoke-test em produção, e abrir tickets de baixa prioridade para os itens 2-6 da seção 6.
