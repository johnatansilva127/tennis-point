# Changelog

Todas as mudanças notáveis deste projeto são documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/), e o projeto adere ao [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [4.9.0] - 2026-04-30

### Fixed

- **Linhas conectoras do bracket invisíveis em torneios reais (R64+).** Causa-raiz: regra `gap: 32px !important` em `.bracket-round` (`styles.css:1891`) sobrescrevia o gap calculado por `layoutBracket()`. Os matches ficavam empilhados próximos enquanto os paths SVG eram desenhados nas coordenadas teóricas, resultando em tracinhos minúsculos em posições erradas.
- **SVG do bracket clipado ao viewport.** `width: 100%; height: 100%` em `.bracket-svg` impedia que linhas dos rounds da direita aparecessem em R64 (~6700px de altura). Agora `width`/`height` são definidos em pixels via JS para cobrir toda a árvore.
- **`STATE.tournamentPlayers` vazio em primeiro login.** Usuários sem `localStorage` populado tinham `tournamentSlots = []`, quebrando o highlight "VOCÊ" nos slots, a aba "Minhas categorias" no perfil e a contagem de slots/categorias. Agora o array é populado a partir das `entries` das brackets carregadas do Supabase a cada login.
- **`bracket.js` vulnerável a iframes throttled.** A lógica anterior usava `requestAnimationFrame` que falha silenciosamente em preview iframes, background tabs e mobile com page hidden. Substituída por layout síncrono.

### Added

- **Realtime nos brackets.** Quando o admin atualiza scores ou winners em qualquer dispositivo, todos os clientes conectados ao torneio recebem o novo estado em tempo real e re-renderizam a tela automaticamente. Toast discreto avisa o usuário ("Chave atualizada em tempo real").
- **Realtime nas notificações.** Novas notificações fazem o badge do sino atualizar sem reload.
- **`TP.Realtime.subscribeBrackets(tournamentId, callback)`** — assina mudanças em todas as brackets de um torneio, filtradas por `tournament_id`.
- **`TP.Realtime.unsubscribe(channel)`** — helper para desinscrever subscriptions limpas no logout, prevenindo memory leak.
- **`bracket.js` v2.0** — algoritmo de layout com matches em `position: absolute`, Y calculado como ponto médio dos alimentadores do round anterior. Imune a override de CSS em `gap`/`padding-top`.
- **Suporte a R128** no `ROUND_LABELS`.
- **Walkover chip** no card do match quando `match.walkover_reason` está setado.
- **`MutationObserver`** no bracket detecta novos matches (edit mode admin) e mudança de winner para re-renderizar conectores automaticamente, com flag `inLayout` que previne loop infinito.

### Changed

- **`subscribeMatches` → `subscribeBrackets`** como subscription canônica. A tabela `matches` está vazia; os dados moram em `brackets.data` (JSONB). `subscribeMatches` mantida por compat, mas marcada como não-usada.
- **Cache-bust de assets** atualizado de `?v=4.8.2` para `?v=4.9.0` em `index.html` para forçar invalidação em todos os clientes.
- **Label do drawer** atualizado de `Tennis Point v4.0.0` para `Tennis Point v4.9.0`.
- **Visual dos conectores** revisado: paths neutros em branco translúcido (`rgba(255, 255, 255, 0.45)`, stroke 3px), `winner-path` em verde-lima (`rgb(200, 255, 61)`, stroke 4px) com duplo `drop-shadow` para iluminar o trajeto vencedor de R64 até a Final.

### Removed

- Regra duplicada de `.bracket-svg path` no topo do `styles.css` (a "boa" mora ~linha 1868).
- `!important` desnecessários nas regras de path (não eram mais precisos depois de remover a regra duplicada).
- Lógica de retry com `setTimeout(layoutBracket, 80)` quando `scrollWidth === 0` — substituída por `document.fonts.ready.then(...)`.

### Security

- Sem mudanças de segurança nesta versão.

### Compatibilidade

- Pré-requisito Supabase: Realtime habilitado nas tabelas `brackets` e `notifications`. Ver `supabase_realtime_setup.sql`.
- Sem breaking changes na API pública.

---

## [4.8.2] - data anterior

Versão estável anterior, sem changelog público registrado neste arquivo.

[4.9.0]: https://github.com/SEU_ORG/tennis-point/compare/v4.8.2...v4.9.0
[4.8.2]: https://github.com/SEU_ORG/tennis-point/releases/tag/v4.8.2
