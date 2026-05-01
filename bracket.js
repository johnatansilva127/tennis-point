/* ==================================================
   TENNIS POINT — Bracket Renderer v3.0
   Estratégia: posicionamento ABSOLUTO dos matches dentro de um CANVAS
   único (não mais por round-column). Suporta posições customizadas
   (drag livre do admin) preservadas em bracket.customPositions.

   Mudanças v3.0:
   - Canvas único (.bracket-canvas) substitui as colunas por round
   - bracket.customPositions = { 'm-r32-1': {x, y}, ... } persiste posição
     escolhida pelo admin
   - Cada match tem drag handle (⋮⋮) em edit mode pra mover livre
   - Conectores SVG continuam dinâmicos via getBoundingClientRect
   - Fallback: se sem customPosition, cai no layout calculado
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
const ROUND_WIDTH = 320;          // largura padrão de cada coluna de round
const ROUND_X_GAP = 64;           // espaçamento horizontal entre colunas
const ADD_BTN_HEIGHT = 44;        // espaço pro "+ Match em..." (edit mode)
const SNAP_GRID = 8;              // grid de snap pro drag livre (px)

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

// Snap value to grid
function snapToGrid(v) {
  return Math.round(v / SNAP_GRID) * SNAP_GRID;
}

function renderPlayerRow(memberId, scores, isWinner, isBye, idx) {
  if (!memberId) {
    return `
      <div class="bk-player-row bye" data-slot-idx="${idx}">
        <div class="avatar bye">×</div>
        <div class="bk-player-name">BYE</div>
      </div>
    `;
  }

  const m = getMember(memberId);
  const name = m ? m.name : 'BYE';
  const colorVar = m ? AVATAR_COLORS[hashStr(m.name) % AVATAR_COLORS.length] : '--av-gray';
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
    <div class="bk-player-row${isWinner === true ? ' winner' : ''}${isMe ? ' is-me' : ''}" data-slot-idx="${idx}">
      <div class="avatar" style="background:var(${colorVar})">
        ${initials(name)}
        ${statusIcon}
      </div>
      <div class="bk-player-name">${name}${isMe ? ' <span class="me-badge">VOCÊ</span>' : ''}</div>
      <div class="bk-scores">${scoresHTML}</div>
    </div>
  `;
}

function renderMatch(match, categoryLabel, isAdmin, editMode) {
  const w = match.winner;
  const p1IsWinner = w ? (w === match.p1) : null;
  const p2IsWinner = w ? (w === match.p2) : null;

  const dateStr = match.date && match.time
    ? `${fmtDate(match.date)} às ${match.time}hs`
    : match.isBye ? '' : 'A definir';

  const walkoverChip = match.walkover_reason
    ? `<span class="walkover-chip" title="Walkover">${match.walkover_reason}</span>` : '';

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

  const trophyIcon = `<svg class="bk-trophy-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M4 3h8v2.5a4 4 0 0 1-8 0V3z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>
    <path d="M4 4H2.5a1 1 0 0 0-1 1v.5a2 2 0 0 0 2 2H4M12 4h1.5a1 1 0 0 1 1 1v.5a2 2 0 0 1-2 2H12" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
    <path d="M6.5 9.5h3v2.5h-3zM5 12.5h6v1H5z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>
  </svg>`;

  // Drag handle (só visível em edit mode + admin)
  const dragHandle = (isAdmin && editMode) ? `
    <div class="bk-drag-handle" data-drag-handle title="Arrastar este match" aria-label="Arrastar match">
      <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true">
        <circle cx="5" cy="3" r="1.3"/><circle cx="11" cy="3" r="1.3"/>
        <circle cx="5" cy="8" r="1.3"/><circle cx="11" cy="8" r="1.3"/>
        <circle cx="5" cy="13" r="1.3"/><circle cx="11" cy="13" r="1.3"/>
      </svg>
    </div>
  ` : '';

  return `
    <div class="bk-match" data-match-id="${match.id}" data-round="${match.round}"${match.winner ? ' data-has-winner="true"' : ''}>
      ${dragHandle}
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
      ${(dateStr || isAdmin) ? `
        <div class="bk-match-foot${isAdmin ? ' is-admin-clickable' : ''}" ${isAdmin ? `data-action="edit-match-details" data-match-id="${match.id}" role="button" tabindex="0"` : ''}>
          <span class="bk-match-date">${dateStr || (isAdmin ? '+ definir data e hora' : '')}</span>
          ${isAdmin ? `<span class="bk-edit-pencil" aria-label="Editar match">
            <svg viewBox="0 0 14 14" width="11" height="11" fill="none" aria-hidden="true">
              <path d="M2 12l1.5-4 6.5-6.5a1.5 1.5 0 1 1 2 2L5.5 10 1 11.5l1-2.5z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>
            </svg>
          </span>` : `<a class="bk-h2h" role="button" tabindex="0">H2H</a>`}
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
  const isAdmin = typeof STATE !== 'undefined' && STATE.user && STATE.user.role === 'admin';
  const editMode = typeof bracketEditMode !== 'undefined' && bracketEditMode && isAdmin;
  const totalMatches = rounds.reduce((s, r) => s + (bracket.matches[r] || []).length, 0);
  const hasCustom = bracket.customPositions && Object.keys(bracket.customPositions).length > 0;

  const toolbarHTML = `
    <div class="bracket-toolbar">
      <span class="bracket-toolbar-info">${totalMatches} jogos · ${rounds.length} rodadas${hasCustom ? ' · 🎯 layout custom' : ''}</span>
      ${isAdmin ? `
        <div class="bracket-toolbar-actions">
          ${editMode && hasCustom ? `
            <button class="bracket-action-btn bracket-action-reset" data-action="reset-layout" title="Voltar pro layout automático">
              <svg viewBox="0 0 16 16" width="13" height="13" fill="none" aria-hidden="true">
                <path d="M3 8a5 5 0 1 0 1.5-3.5M3 3v3h3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>Resetar layout</span>
            </button>
          ` : ''}
          <button class="bracket-action-btn" data-action="resort-bracket" title="Re-sortear esta categoria">
            <svg viewBox="0 0 16 16" width="13" height="13" fill="none" aria-hidden="true">
              <path d="M3 6h7M10 6L7 3M10 6L7 9M13 10H6M6 10l3 3M6 10l3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>Re-sortear</span>
          </button>
        </div>
      ` : ''}
    </div>
  `;

  const headerHTML = `
    ${toolbarHTML}
    <div class="bracket-rounds-header" id="bracket-rounds-header">
      ${rounds.map((r, ri) => `<div class="bracket-round-label" data-round-idx="${ri}" data-round="${r}">${ROUND_LABELS[r] || r}</div>`).join('')}
    </div>
  `;

  let catLabel = '';
  try {
    const catId = bracket.category_id || (typeof currentBracketCategory !== 'undefined' && currentBracketCategory);
    if (catId && typeof STATE !== 'undefined' && STATE.categories) {
      const c = STATE.categories.find(x => x.id === catId);
      if (c) catLabel = c.name;
    }
  } catch (e) { /* fallback silencioso */ }

  // Canvas único: TODOS os matches em um plano. Posições calculadas via JS.
  const matchesHTML = rounds.map((roundName, ri) => {
    const matches = bracket.matches[roundName] || [];
    return matches.map(m => renderMatch(m, catLabel, isAdmin, editMode)).join('');
  }).join('');

  // Drop indicators per round (pra reordenação) — usado em edit mode
  const dropIndicators = editMode ? rounds.map((r, ri) => `
    <div class="bk-round-dropzone" data-round="${r}" data-round-idx="${ri}"></div>
  `).join('') : '';

  container.innerHTML = `
    ${headerHTML}
    <div class="bracket bracket-canvas${editMode ? ' edit-layout' : ''}" id="bracket-inner">
      ${dropIndicators}
      ${matchesHTML}
      <svg class="bracket-svg" id="bracket-svg" aria-hidden="true"></svg>
    </div>
  `;

  // Layout síncrono
  layoutBracket(container);

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      if (container.isConnected) layoutBracket(container);
    }).catch(() => {});
  }

  attachBracketObservers(container);
}

/* layoutBracket v3.0: posiciona TODOS os matches em coordenadas absolutas
   no canvas único. Se match tiver customPositions[matchId], usa ele;
   senão calcula automático. */
function layoutBracket(container) {
  const inner = container.querySelector('#bracket-inner');
  if (!inner) return;

  const matches = Array.from(inner.querySelectorAll('.bk-match'));
  if (!matches.length) return;

  // Pega o bracket do STATE pra ler customPositions
  const catId = (typeof currentBracketCategory !== 'undefined') ? currentBracketCategory : null;
  const bracket = (catId && typeof STATE !== 'undefined' && STATE.brackets) ? STATE.brackets[catId] : null;
  if (!bracket) return;

  const customPositions = bracket.customPositions || {};
  const rounds = bracket.rounds;

  // Reset visual
  matches.forEach(m => {
    m.style.position = 'absolute';
    m.style.width = `${ROUND_WIDTH}px`;
  });

  // Mede altura real do primeiro match
  matches[0].style.left = '0';
  matches[0].style.top = '0';
  const matchHeight = matches[0].offsetHeight || 130;
  const baseGap = BASE_GAP;

  // Indexa matches por ID pra acesso rápido
  const matchEls = {};
  matches.forEach(el => { matchEls[el.dataset.matchId] = el; });

  // Calcula posições AUTOMÁTICAS (fallback) por round
  const autoPositions = {}; // matchId -> {x, y}
  rounds.forEach((roundName, ri) => {
    const list = bracket.matches[roundName] || [];
    const x = ri * (ROUND_WIDTH + ROUND_X_GAP);

    list.forEach((m, mi) => {
      let y;
      if (ri === 0) {
        y = mi * (matchHeight + baseGap);
      } else {
        // Centro entre os dois alimentadores do round anterior
        const prevRound = rounds[ri - 1];
        const prevList = bracket.matches[prevRound] || [];
        const fa = prevList[mi * 2];
        const fb = prevList[mi * 2 + 1];
        const yA = fa ? autoPositions[fa.id]?.y : null;
        const yB = fb ? autoPositions[fb.id]?.y : null;
        if (yA != null && yB != null) {
          const centerA = yA + matchHeight / 2;
          const centerB = yB + matchHeight / 2;
          y = (centerA + centerB) / 2 - matchHeight / 2;
        } else if (yA != null) {
          y = yA;
        } else {
          const gap = (matchHeight + baseGap) * Math.pow(2, ri) - matchHeight;
          const padding = ((matchHeight + baseGap) * Math.pow(2, ri) - matchHeight) / 2 - baseGap / 2;
          y = padding + mi * (matchHeight + gap);
        }
      }
      autoPositions[m.id] = { x, y };
    });
  });

  // Aplica posições (custom > automático)
  let maxX = 0, maxY = 0;
  matches.forEach(el => {
    const id = el.dataset.matchId;
    const custom = customPositions[id];
    const pos = custom || autoPositions[id] || { x: 0, y: 0 };
    el.style.left = `${pos.x}px`;
    el.style.top = `${pos.y}px`;
    el.dataset.autoX = autoPositions[id]?.x ?? 0;
    el.dataset.autoY = autoPositions[id]?.y ?? 0;
    el.classList.toggle('has-custom-pos', !!custom);
    if (pos.x + ROUND_WIDTH > maxX) maxX = pos.x + ROUND_WIDTH;
    if (pos.y + matchHeight > maxY) maxY = pos.y + matchHeight;
  });

  // Ajusta tamanho do canvas
  inner.style.position = 'relative';
  inner.style.minWidth = `${maxX + 40}px`;
  inner.style.minHeight = `${maxY + ADD_BTN_HEIGHT + 40}px`;

  // Posiciona os labels dos rounds em cima da posição auto X de cada coluna
  const header = container.querySelector('#bracket-rounds-header');
  if (header) {
    const labels = header.querySelectorAll('.bracket-round-label');
    labels.forEach((lbl, ri) => {
      lbl.style.position = 'absolute';
      lbl.style.left = `${ri * (ROUND_WIDTH + ROUND_X_GAP)}px`;
      lbl.style.width = `${ROUND_WIDTH}px`;
    });
    header.style.position = 'relative';
    header.style.minWidth = `${maxX + 40}px`;
    header.style.height = '36px';
  }

  // Posiciona drop zones (uma por round, full-height)
  const dropzones = inner.querySelectorAll('.bk-round-dropzone');
  dropzones.forEach((dz, ri) => {
    dz.style.position = 'absolute';
    dz.style.left = `${ri * (ROUND_WIDTH + ROUND_X_GAP) - ROUND_X_GAP / 2}px`;
    dz.style.top = '0';
    dz.style.width = `${ROUND_WIDTH + ROUND_X_GAP}px`;
    dz.style.height = `${maxY + 40}px`;
  });

  // Posiciona "+ Match em..." (botão de edit mode) no fim da coluna do round
  const addBtns = inner.querySelectorAll('.add-match-btn');
  addBtns.forEach(btn => {
    const roundName = btn.dataset.round;
    if (!roundName) return;
    const ri = rounds.indexOf(roundName);
    if (ri < 0) return;
    // Ymax dos matches desse round
    const list = bracket.matches[roundName] || [];
    let yMax = 0;
    list.forEach(m => {
      const p = customPositions[m.id] || autoPositions[m.id];
      if (p && p.y + matchHeight > yMax) yMax = p.y + matchHeight;
    });
    btn.style.position = 'absolute';
    btn.style.left = `${ri * (ROUND_WIDTH + ROUND_X_GAP) + 16}px`;
    btn.style.top = `${yMax + 12}px`;
    btn.style.width = `${ROUND_WIDTH - 32}px`;
  });

  // Conectores
  drawConnectors(container);
}

/* Síncrono: assume que layoutBracket já posicionou tudo. Conecta cada
   match[mi*2] e match[mi*2+1] do round atual ao match[mi] do próximo round. */
function drawConnectors(container) {
  const inner = container.querySelector('#bracket-inner');
  const svg = container.querySelector('#bracket-svg');
  if (!inner || !svg) return;

  const innerRect = inner.getBoundingClientRect();
  const w = Math.max(inner.scrollWidth, parseFloat(inner.style.minWidth) || 0);
  const h = Math.max(inner.scrollHeight, parseFloat(inner.style.minHeight) || 0);
  if (w === 0 || h === 0) return;

  svg.setAttribute('width', w);
  svg.setAttribute('height', h);
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  svg.style.position = 'absolute';
  svg.style.top = '0';
  svg.style.left = '0';
  svg.style.pointerEvents = 'none';

  const catId = (typeof currentBracketCategory !== 'undefined') ? currentBracketCategory : null;
  const bracket = (catId && typeof STATE !== 'undefined' && STATE.brackets) ? STATE.brackets[catId] : null;
  if (!bracket) { svg.innerHTML = ''; return; }

  const rounds = bracket.rounds;
  const paths = [];
  const CORNER_R = 10;

  function lShapePath(sX, sY, mX, tY, tX) {
    const r = Math.min(CORNER_R, Math.abs(mX - sX) / 2 || CORNER_R, Math.abs(tY - sY) / 2 || CORNER_R, Math.abs(tX - mX) / 2 || CORNER_R);
    if (r < 2 || sY === tY) {
      return `M ${sX} ${sY} H ${mX} V ${tY} H ${tX}`;
    }
    const dirV = tY > sY ? 1 : -1;
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
    const cur = bracket.matches[rounds[ri]] || [];
    const nxt = bracket.matches[rounds[ri + 1]] || [];

    for (let mi = 0; mi < nxt.length; mi++) {
      const m1 = cur[mi * 2];
      const m2 = cur[mi * 2 + 1];
      const target = nxt[mi];
      if (!m1 || !target) continue;

      const e1 = inner.querySelector(`.bk-match[data-match-id="${m1.id}"]`);
      const e2 = m2 ? inner.querySelector(`.bk-match[data-match-id="${m2.id}"]`) : null;
      const et = inner.querySelector(`.bk-match[data-match-id="${target.id}"]`);
      if (!e1 || !et) continue;

      const r1 = e1.getBoundingClientRect();
      const r2 = e2 ? e2.getBoundingClientRect() : null;
      const rt = et.getBoundingClientRect();

      const x1 = r1.right - innerRect.left;
      const y1 = r1.top + r1.height / 2 - innerRect.top;
      const xt = rt.left - innerRect.left;
      const yt = rt.top + rt.height / 2 - innerRect.top;

      const midX = x1 + (xt - x1) / 2;

      const m1Won = e1.dataset.hasWinner === 'true';
      const m2Won = e2 && e2.dataset.hasWinner === 'true';

      const sources = [{ x: x1, y: y1, won: m1Won }];
      if (r2) {
        const y2 = r2.top + r2.height / 2 - innerRect.top;
        sources.push({ x: r2.right - innerRect.left, y: y2, won: m2Won });
      }
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
   mudam. */
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

window.addEventListener('resize', () => {
  document.querySelectorAll('.bracket-scroll').forEach(c => layoutBracket(c));
});

/* Helper exposto: redesenhar apenas conectores (usado durante drag pra
   performance) */
window.tpRedrawConnectorsOnly = function(container) {
  drawConnectors(container);
};

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

window.addEventListener('resize', () => {
  document.querySelectorAll('.bracket-scroll').forEach(c => layoutBracket(c));
});

/* Helper exposto: redesenhar apenas conectores (usado durante drag pra
   performance) */
window.tpRedrawConnectorsOnly = function(container) {
  drawConnectors(container);
};
