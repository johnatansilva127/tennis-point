/* ==================================================
   TENNIS POINT — Bracket Renderer v2.0
   Estratégia: posicionamento ABSOLUTO dos matches dentro do round
   (em vez de flex+gap+padding), o que dá controle exato sobre Y de
   cada match. Conectores SVG ficam triviais e sempre alinhados,
   independente de regras CSS conflitantes em outras camadas.
   ================================================== */

const ROUND_LABELS = {
  R128: 'R128',
  R64: 'R64',
  R32: 'R32',
  R16: 'Oitavas de Final',
  QF: 'Quartas de Final',
  SF: 'Semifinal',
  F: 'Final',
};

// Espaçamento base entre matches do round mais à esquerda (R1).
// Outros rounds calculam relativo a este (cada round dobra o espaço).
const BASE_GAP = 48;
const ADD_BTN_HEIGHT = 44; // espaço pro "+ Match em..." (edit mode)

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function renderPlayerRow(memberId, scores, isWinner, isBye, idx) {
  if (!memberId) {
    return `
      <div class="bk-player-row bye">
        <div class="avatar bye">×</div>
        <div class="bk-player-name">BYE</div>
      </div>
    `;
  }

  const m = getMember(memberId);
  const name = m ? m.name : 'BYE';
  // AVATAR_COLORS já vem com prefixo "--" (ex: "--av-pink"), então usamos var(${colorVar}) sem "--"
  const colorVar = m ? AVATAR_COLORS[hashStr(m.name) % AVATAR_COLORS.length] : '--av-gray';
  // É o usuário logado? Marca pra highlight visual
  const mySlots = (typeof STATE !== 'undefined' && STATE.user && STATE.user.tournamentSlots) || [];
  const isMe = !!memberId && mySlots.some(s => s.id === memberId);

  let scoresHTML = '';
  if (scores && scores.length) {
    scoresHTML = scores.map((set, i) => {
      const myScore = set[idx];
      const oppScore = set[1 - idx];
      const isSetWinner = myScore > oppScore;
      const isTiebreak = (myScore === 6 && oppScore === 7) || (myScore === 7 && oppScore === 6);
      const tbVal = isTiebreak && set[2] !== undefined ? set[2 + idx] : null;

      return `<div class="bk-score${isSetWinner ? ' winner' : ''}${tbVal != null ? ' tiebreak' : ''}"${tbVal != null ? ` data-tb="${tbVal}"` : ''}>${myScore}</div>`;
    }).join('');
  }

  const statusIcon = isBye ? '' : isWinner === true
    ? '<span class="bk-player-status win">✓</span>'
    : isWinner === false
    ? '<span class="bk-player-status loss">✕</span>'
    : '';

  return `
    <div class="bk-player-row${isWinner === true ? ' winner' : ''}${isMe ? ' is-me' : ''}">
      <div class="avatar" style="background:var(${colorVar})">
        ${initials(name)}
        ${statusIcon}
      </div>
      <div class="bk-player-name">${name}${isMe ? ' <span class="me-badge">VOCÊ</span>' : ''}</div>
      <div class="bk-scores">${scoresHTML}</div>
    </div>
  `;
}

function renderMatch(match, categoryLabel) {
  const w = match.winner;
  const p1IsWinner = w ? (w === match.p1) : null;
  const p2IsWinner = w ? (w === match.p2) : null;

  const dateStr = match.date && match.time
    ? `${fmtDate(match.date)} às ${match.time}hs`
    : match.isBye ? '' : 'A definir';

  // Walkover/lesão chip — se walkover_reason setado, mostra
  const walkoverChip = match.walkover_reason
    ? `<span class="walkover-chip" title="Walkover">${match.walkover_reason}</span>` : '';

  // Sets vencidos por jogador (pra contador discreto no header)
  let setsP1 = 0, setsP2 = 0;
  if (match.scores) {
    match.scores.forEach(s => {
      if (s[0] > s[1]) setsP1++;
      else if (s[1] > s[0]) setsP2++;
    });
  }
  const headerCount = setsP1 + setsP2;

  const roundLabel = ROUND_LABELS[match.round] || match.round;
  const catChip = categoryLabel
    ? `<span class="bk-divider">·</span><span class="bk-category-label">${categoryLabel}</span>`
    : '';

  // Trophy SVG inline (Heroicons-style, sem emoji)
  const trophyIcon = `<svg class="bk-trophy-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M4 3h8v2.5a4 4 0 0 1-8 0V3z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>
    <path d="M4 4H2.5a1 1 0 0 0-1 1v.5a2 2 0 0 0 2 2H4M12 4h1.5a1 1 0 0 1 1 1v.5a2 2 0 0 1-2 2H12" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
    <path d="M6.5 9.5h3v2.5h-3zM5 12.5h6v1H5z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>
  </svg>`;

  return `
    <div class="bk-match" data-match-id="${match.id}"${match.winner ? ' data-has-winner="true"' : ''}>
      <div class="bk-match-head">
        <div class="bk-trophy">
          ${trophyIcon}
          <span class="bk-match-num">#${match.n}</span>
          <span class="bk-divider">·</span>
          <span class="bk-round-label">${roundLabel}</span>
          ${catChip}
        </div>
        <div class="bk-options" aria-label="Sets jogados">${walkoverChip}${headerCount}</div>
      </div>
      ${renderPlayerRow(match.p1, match.scores, p1IsWinner, match.isBye, 0)}
      ${renderPlayerRow(match.p2, match.scores, p2IsWinner, match.isBye, 1)}
      ${dateStr ? `
        <div class="bk-match-foot">
          <span class="bk-match-date">${dateStr}</span>
          <a class="bk-h2h" role="button" tabindex="0">H2H</a>
        </div>
      ` : ''}
    </div>
  `;
}

function renderBracket(bracket, container) {
  if (!bracket || !bracket.drawn) {
    const isAdminLocal = typeof STATE !== 'undefined' && STATE.user && STATE.user.role === 'admin';
    container.innerHTML = `
      <div class="bracket-empty">
        <div class="be-icon">🎾</div>
        <h3>Chave ainda não sorteada</h3>
        <p>${isAdminLocal ? 'Configure os jogadores e clique em sortear pra montar a chave.' : 'Aguarde o administrador realizar o sorteio.'}</p>
        ${isAdminLocal ? `
          <button class="btn-primary be-action" data-action="goto-draw" style="margin-top:14px">
            🎲 Sortear esta categoria
          </button>
        ` : ''}
      </div>
    `;
    return;
  }

  const rounds = bracket.rounds;

  // Header com nomes das rodadas + barra de ação separada (não overlap)
  const isAdmin = typeof STATE !== 'undefined' && STATE.user && STATE.user.role === 'admin';
  const totalMatches = rounds.reduce((s, r) => s + (bracket.matches[r] || []).length, 0);

  const toolbarHTML = `
    <div class="bracket-toolbar">
      <span class="bracket-toolbar-info">${totalMatches} jogos · ${rounds.length} rodadas</span>
      ${isAdmin ? `
        <button class="bracket-action-btn" data-action="resort-bracket" title="Re-sortear esta categoria">
          <svg viewBox="0 0 16 16" width="13" height="13" fill="none" aria-hidden="true">
            <path d="M3 6h7M10 6L7 3M10 6L7 9M13 10H6M6 10l3 3M6 10l3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>Re-sortear</span>
        </button>
      ` : ''}
    </div>
  `;

  const headerHTML = `
    ${toolbarHTML}
    <div class="bracket-rounds-header">
      ${rounds.map(r => `<div class="bracket-round-label">${ROUND_LABELS[r] || r}</div>`).join('')}
    </div>
  `;

  // Categoria pro chip do header — usa STATE.categories se disponível
  let catLabel = '';
  try {
    const catId = bracket.category_id || (typeof currentBracketCategory !== 'undefined' && currentBracketCategory);
    if (catId && typeof STATE !== 'undefined' && STATE.categories) {
      const c = STATE.categories.find(x => x.id === catId);
      if (c) catLabel = c.name;
    }
  } catch (e) { /* fallback silencioso */ }

  // Conteúdo das rodadas (matches são posicionados via JS - position:absolute)
  const roundsHTML = rounds.map((roundName, ri) => {
    const matches = bracket.matches[roundName] || [];
    return `
      <div class="bracket-round" data-round="${roundName}" data-round-idx="${ri}">
        ${matches.map(m => renderMatch(m, catLabel)).join('')}
      </div>
    `;
  }).join('');

  container.innerHTML = `
    ${headerHTML}
    <div class="bracket" id="bracket-inner">
      ${roundsHTML}
      <svg class="bracket-svg" id="bracket-svg" aria-hidden="true"></svg>
    </div>
  `;

  // Layout síncrono — calcula altura dos matches reais e posiciona absoluto.
  layoutBracket(container);

  // Re-tenta após fonts settled (raro precisar, mas blindagem)
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      // Apenas re-layout se container ainda existe no DOM
      if (container.isConnected) layoutBracket(container);
    }).catch(() => {});
  }

  // Observers: redesenha quando layout muda (resize, edit mode, drag-drop, etc)
  attachBracketObservers(container);
}

/* layoutBracket: posiciona TODO match com position:absolute em coordenadas
   calculadas. Cada round[ri] tem N matches, e o match[i] do round[ri] é
   o "vencedor" das matches[i*2] e matches[i*2+1] do round[ri-1]. Pra que o
   match no round seguinte fique exatamente no MEIO dos dois que o alimentam,
   calculamos: y(match[i] @ round[ri]) = (y(match[2i] @ round[ri-1]) + y(match[2i+1] @ round[ri-1])) / 2

   Isso é equivalente à fórmula clássica: paddingTop e gap dobram a cada round.
   Vantagem do absolute: não depende de gap/padding-top do flex (que CSS pode
   sobrescrever via !important), e o admin "+ Match" não bagunça posições. */
function layoutBracket(container) {
  const inner = container.querySelector('#bracket-inner');
  if (!inner) return;

  const rounds = Array.from(inner.querySelectorAll('.bracket-round'));
  if (!rounds.length) return;

  // Mede altura real do PRIMEIRO card pra calcular gaps com precisão.
  // Como ainda não sabemos a altura final (cards usam content-based sizing),
  // tornamos os matches "livres" temporariamente, medimos, e então aplicamos
  // posicionamento absoluto.
  const firstMatch = inner.querySelector('.bk-match');
  if (!firstMatch) return;

  // Reset: tira posicionamento absoluto antes de medir
  inner.querySelectorAll('.bk-match').forEach(m => {
    m.style.position = '';
    m.style.top = '';
    m.style.left = '';
  });
  rounds.forEach(r => {
    r.style.position = '';
    r.style.height = '';
  });

  // Mede altura real
  const matchHeight = firstMatch.offsetHeight || 130;
  const baseGap = BASE_GAP;

  // Calcula posições Y dos matches em CADA round
  const yPositions = []; // yPositions[ri][mi] = topPx
  rounds.forEach((roundEl, ri) => {
    const matches = roundEl.querySelectorAll('.bk-match');
    yPositions[ri] = [];
    if (ri === 0) {
      // Round mais à esquerda: matches empilhados com gap baseGap
      for (let mi = 0; mi < matches.length; mi++) {
        yPositions[ri][mi] = mi * (matchHeight + baseGap);
      }
    } else {
      // Round derivado: cada match[mi] está no MEIO de matches[mi*2] e matches[mi*2+1]
      // do round anterior. Se não tem match alimentador (caso de R32 sem R64 vindo),
      // cai no fallback de gap dobrado.
      const prevYs = yPositions[ri - 1];
      const prevCount = prevYs.length;
      for (let mi = 0; mi < matches.length; mi++) {
        const fa = mi * 2;
        const fb = mi * 2 + 1;
        if (prevYs[fa] != null && prevYs[fb] != null) {
          // Centro entre os dois alimentadores (em coordenada de TOP, então
          // o centro do match novo deve estar no centro dos dois antigos)
          const centerA = prevYs[fa] + matchHeight / 2;
          const centerB = prevYs[fb] + matchHeight / 2;
          const targetCenter = (centerA + centerB) / 2;
          yPositions[ri][mi] = targetCenter - matchHeight / 2;
        } else if (prevYs[fa] != null) {
          // Apenas um alimentador (BYE estrutural ou bracket assimétrico)
          yPositions[ri][mi] = prevYs[fa];
        } else {
          // Fallback puro de spacing dobrado
          const gap = (matchHeight + baseGap) * Math.pow(2, ri) - matchHeight;
          const padding = ((matchHeight + baseGap) * Math.pow(2, ri) - matchHeight) / 2 - baseGap / 2;
          yPositions[ri][mi] = padding + mi * (matchHeight + gap);
        }
      }
    }
  });

  // Aplica position:absolute em cada match com Y calculado.
  // Pra altura do round, pegamos o ÚLTIMO match top + matchHeight + um pad pro
  // botão "+ Match em..." caber se em edit mode.
  let maxRoundHeight = 0;
  rounds.forEach((roundEl, ri) => {
    const matches = roundEl.querySelectorAll('.bk-match');
    roundEl.style.position = 'relative';
    roundEl.style.display = 'block';      // sai do flex
    roundEl.style.gap = '';                // limpa qualquer override
    roundEl.style.paddingTop = '';
    matches.forEach((m, mi) => {
      m.style.position = 'absolute';
      m.style.top = `${yPositions[ri][mi]}px`;
      m.style.left = '0';
      m.style.right = '0';
    });
    const lastY = yPositions[ri].length
      ? yPositions[ri][yPositions[ri].length - 1] + matchHeight
      : matchHeight;
    const heightWithBtn = lastY + ADD_BTN_HEIGHT;
    roundEl.style.height = `${heightWithBtn}px`;
    if (heightWithBtn > maxRoundHeight) maxRoundHeight = heightWithBtn;
  });

  // Garante que o inner tem altura suficiente pra TUDO (necessário pra SVG cobrir)
  inner.style.minHeight = `${maxRoundHeight}px`;

  // Posiciona "+ Match em..." (botão de edit mode) no fim de cada round,
  // já que mudamos pra position:absolute (do contrário ele encavala nos matches).
  rounds.forEach((roundEl, ri) => {
    const addBtn = roundEl.querySelector('.add-match-btn');
    if (addBtn) {
      const matches = roundEl.querySelectorAll('.bk-match');
      const lastY = matches.length
        ? yPositions[ri][matches.length - 1] + matchHeight + 8
        : 8;
      addBtn.style.position = 'absolute';
      addBtn.style.top = `${lastY}px`;
      addBtn.style.left = '0';
      addBtn.style.right = '0';
    }
  });

  // Desenha conectores agora que tudo está posicionado
  drawConnectors(container);
}

/* Síncrono: assume que layoutBracket já posicionou tudo. Mede via
   getBoundingClientRect (consistente com posicionamento absoluto) e desenha
   paths conectando match[mi*2] e match[mi*2+1] do round atual ao match[mi]
   do próximo round. */
function drawConnectors(container) {
  const inner = container.querySelector('#bracket-inner');
  const svg = container.querySelector('#bracket-svg');
  if (!inner || !svg) return;

  const innerRect = inner.getBoundingClientRect();
  const w = inner.scrollWidth;
  const h = Math.max(inner.scrollHeight, parseFloat(inner.style.minHeight) || 0);
  if (w === 0 || h === 0) return;

  svg.setAttribute('width', w);
  svg.setAttribute('height', h);
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`);

  const rounds = inner.querySelectorAll('.bracket-round');
  const paths = [];

  // Raio dos cantos (arcos) dos conectores. 0 = canto reto.
  // Nota: stroke-linejoin: round já dá um leve arredondamento via CSS,
  // mas Q-curves nos próprios paths fazem o arco real visível.
  const CORNER_R = 10;

  // Helper: constrói path L-shape de um source até o target com cantos arredondados.
  // sX,sY = ponto saindo do match source (na borda direita do card)
  // mX = midX (vertical de junção entre os dois sources)
  // tY = altura do centro do target (também é o midpoint vertical entre y1 e y2)
  // tX = borda esquerda do target
  // Direção da segunda dobra depende de sY vs tY (sY acima → desce, abaixo → sobe).
  function lShapePath(sX, sY, mX, tY, tX) {
    const r = Math.min(CORNER_R, Math.abs(mX - sX) / 2, Math.abs(tY - sY) / 2 || CORNER_R, Math.abs(tX - mX) / 2);
    if (r < 2 || sY === tY) {
      // Caso degenerado: linha reta (sem curva)
      return `M ${sX} ${sY} H ${mX} V ${tY} H ${tX}`;
    }
    const dirV = tY > sY ? 1 : -1;   // descendo (+) ou subindo (-)
    // M source → reta horizontal até pouco antes de mX
    // Q curva no canto (mX, sY) saindo vertical
    // V até pouco antes de tY
    // Q curva no canto (mX, tY) saindo horizontal
    // H até tX
    return [
      `M ${sX} ${sY}`,
      `H ${mX - r}`,
      `Q ${mX} ${sY} ${mX} ${sY + r * dirV}`,
      `V ${tY - r * dirV}`,
      `Q ${mX} ${tY} ${mX + r} ${tY}`,
      `H ${tX}`,
    ].join(' ');
  }

  for (let ri = 0; ri < rounds.length - 1; ri++) {
    const currentMatches = rounds[ri].querySelectorAll('.bk-match');
    const nextMatches = rounds[ri + 1].querySelectorAll('.bk-match');

    for (let mi = 0; mi < nextMatches.length; mi++) {
      const m1 = currentMatches[mi * 2];
      const m2 = currentMatches[mi * 2 + 1];
      const target = nextMatches[mi];

      if (!m1 || !target) continue;

      const r1 = m1.getBoundingClientRect();
      const r2 = m2 ? m2.getBoundingClientRect() : null;
      const rt = target.getBoundingClientRect();

      const x1 = r1.right - innerRect.left;
      const y1 = r1.top + r1.height / 2 - innerRect.top;
      const xt = rt.left - innerRect.left;
      const yt = rt.top + rt.height / 2 - innerRect.top;

      const midX = x1 + (xt - x1) / 2;

      const m1Won = m1.dataset.hasWinner === 'true';
      const m2Won = m2 && m2.dataset.hasWinner === 'true';

      // Constroi uma path L continua de cada source ate o target.
      // Render order: losers/neutros primeiro, winner por cima — garante que o
      // trajeto vencedor (lima brilhante) fica visualmente sobre os outros.
      const sources = [{ x: x1, y: y1, won: m1Won }];
      if (r2) {
        const y2 = r2.top + r2.height / 2 - innerRect.top;
        sources.push({ x: x1, y: y2, won: m2Won });
      }
      // Sort: losers (false) primeiro, winners (true) depois
      sources.sort((a, b) => (a.won ? 1 : 0) - (b.won ? 1 : 0));

      for (const s of sources) {
        const cls = s.won ? ' class="winner-path"' : '';
        paths.push('<path d="' + lShapePath(s.x, s.y, midX, yt, xt) + '"' + cls + '/>');
      }
    }
  }

  svg.innerHTML = paths.join('');
}

/* ResizeObserver + MutationObserver: redesenha sempre que dimensoes ou DOM
   dos matches mudam (resize de janela, fontes carregando, admin edit mode
   adicionando/removendo matches, drag-drop trocando jogadores). */
const _bracketObservers = new WeakMap();
function attachBracketObservers(container) {
  const inner = container.querySelector('#bracket-inner');
  if (!inner) return;

  const prev = _bracketObservers.get(container);
  if (prev) {
    prev.ro?.disconnect();
    prev.mo?.disconnect();
  }

  let scheduled = null;
  let inLayout = false;
  const redraw = () => {
    if (inLayout) return;
    if (scheduled) return;
    scheduled = setTimeout(() => {
      scheduled = null;
      const live = container.querySelector('#bracket-inner');
      if (live) {
        inLayout = true;
        try { layoutBracket(container); }
        finally { inLayout = false; }
      }
    }, 16);
  };

  const ro = new ResizeObserver(redraw);
  ro.observe(inner);

  const mo = new MutationObserver((muts) => {
    let needs = false;
    for (const mut of muts) {
      if (mut.type === 'childList') { needs = true; break; }
      if (mut.type === 'attributes' && mut.attributeName === 'data-has-winner') {
        needs = true; break;
      }
    }
    if (needs) redraw();
  });
  mo.observe(inner, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-has-winner'] });

  _bracketObservers.set(container, { ro, mo });
}

/* Re-layout em resize de janela (fallback alem do ResizeObserver). */
window.addEventListener('resize', () => {
  document.querySelectorAll('.bracket-scroll').forEach(c => layoutBracket(c));
});
