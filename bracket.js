/* ==================================================
   TENNIS POINT — Bracket Renderer
   Estilo inspirado em plataformas profissionais (LetzPlay)
   ================================================== */

const ROUND_LABELS = {
  R32: 'R32',
  R16: 'R16',
  QF: 'Quartas de Final',
  SF: 'Semifinal',
  F: 'Final',
};

function avatarHTML(memberId, size = 28) {
  const m = memberId ? getMember(memberId) : null;
  if (!m || !memberId) {
    return `<div class="avatar bye" style="width:${size}px;height:${size}px;font-size:${Math.round(size*0.4)}px">×</div>`;
  }
  const color = `var(--${m.id ? AVATAR_COLORS[hashStr(m.name) % AVATAR_COLORS.length] : 'av-gray'})`;
  return `<div class="avatar" style="background:${color};width:${size}px;height:${size}px;font-size:${Math.round(size*0.4)}px">${initials(m.name)}</div>`;
}

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
  const colorVar = m ? AVATAR_COLORS[hashStr(m.name) % AVATAR_COLORS.length] : 'av-gray';

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
    <div class="bk-player-row${isWinner === true ? ' winner' : ''}">
      <div class="avatar" style="background:var(--${colorVar})">
        ${initials(name)}
        ${statusIcon}
      </div>
      <div class="bk-player-name">${name}</div>
      <div class="bk-scores">${scoresHTML}</div>
    </div>
  `;
}

function renderMatch(match) {
  const w = match.winner;
  const p1IsWinner = w ? (w === match.p1) : null;
  const p2IsWinner = w ? (w === match.p2) : null;

  const dateStr = match.date && match.time
    ? `${fmtDate(match.date)} às ${match.time}hs`
    : match.isBye ? '' : 'A definir';

  const optionsCount = match.winner ? '1' : (match.p1 && match.p2 ? '0' : '0');

  // Calculate sets won for the dropdown indicator
  let setsP1 = 0, setsP2 = 0;
  if (match.scores) {
    match.scores.forEach(s => {
      if (s[0] > s[1]) setsP1++;
      else if (s[1] > s[0]) setsP2++;
    });
  }
  const headerCount = setsP1 + setsP2;

  return `
    <div class="bk-match" data-match-id="${match.id}">
      <div class="bk-match-head">
        <div class="bk-trophy">#${match.n} • ${match.round}${match.round !== 'R32' && match.round !== 'F' ? ' • Tennis' : (match.round === 'R32' && !match.isBye ? ' • Tennis' : '')}</div>
        <div class="bk-options">${headerCount}</div>
      </div>
      ${renderPlayerRow(match.p1, match.scores, p1IsWinner, match.isBye, 0)}
      ${renderPlayerRow(match.p2, match.scores, p2IsWinner, match.isBye, 1)}
      ${dateStr ? `
        <div class="bk-match-foot">
          <span>${dateStr}</span>
          <a class="bk-h2h">H2H</a>
        </div>
      ` : ''}
    </div>
  `;
}

function renderBracket(bracket, container) {
  if (!bracket || !bracket.drawn) {
    container.innerHTML = `
      <div class="bracket-empty">
        <div class="be-icon">🎾</div>
        <h3>Chave ainda não sorteada</h3>
        <p>Aguarde o administrador realizar o sorteio.</p>
      </div>
    `;
    return;
  }

  const rounds = bracket.rounds;

  // Header com nomes das rodadas
  const headerHTML = `
    <div class="bracket-rounds-header">
      ${rounds.map(r => `<div class="bracket-round-label">${ROUND_LABELS[r] || r}</div>`).join('')}
      <div class="bracket-next-btn"></div>
    </div>
  `;

  // Conteúdo das rodadas
  const roundsHTML = rounds.map((roundName, ri) => {
    const matches = bracket.matches[roundName] || [];
    return `
      <div class="bracket-round" data-round="${roundName}" data-round-idx="${ri}">
        ${matches.map(m => renderMatch(m)).join('')}
      </div>
    `;
  }).join('');

  container.innerHTML = `
    ${headerHTML}
    <div class="bracket" id="bracket-inner">
      ${roundsHTML}
      <svg class="bracket-svg" id="bracket-svg"></svg>
    </div>
  `;

  // Layout — calcular posições
  requestAnimationFrame(() => layoutBracket(container));
}

function layoutBracket(container) {
  const inner = container.querySelector('#bracket-inner');
  if (!inner) return;

  const rounds = inner.querySelectorAll('.bracket-round');
  if (!rounds.length) return;

  // Mede altura real do primeiro card pra calcular gaps com precisão
  const firstMatch = inner.querySelector('.bk-match');
  const matchHeight = firstMatch ? firstMatch.offsetHeight : 130;
  const baseGap = 28; // gap base entre matches da R1

  // Calcula gaps de cada rodada
  rounds.forEach((round, ri) => {
    if (ri === 0) {
      round.style.gap = `${baseGap}px`;
      round.style.paddingTop = '0px';
    } else {
      const gap = (matchHeight + baseGap) * Math.pow(2, ri) - matchHeight;
      const padding = ((matchHeight + baseGap) * Math.pow(2, ri) - matchHeight) / 2 - baseGap / 2;
      round.style.gap = `${gap}px`;
      round.style.paddingTop = `${padding}px`;
    }
    round.style.display = 'flex';
    round.style.flexDirection = 'column';
  });

  // Desenhar conectores SVG
  drawConnectors(container);
}

function drawConnectors(container) {
  const inner = container.querySelector('#bracket-inner');
  const svg = container.querySelector('#bracket-svg');
  if (!inner || !svg) return;

  // Aguardar layout
  requestAnimationFrame(() => {
    const innerRect = inner.getBoundingClientRect();
    const w = inner.scrollWidth;
    const h = inner.scrollHeight;
    svg.setAttribute('width', w);
    svg.setAttribute('height', h);
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);

    const rounds = inner.querySelectorAll('.bracket-round');
    const paths = [];

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

        // Linha do match 1 ao mid
        paths.push(`M ${x1} ${y1} H ${midX}`);

        if (r2) {
          const y2 = r2.top + r2.height / 2 - innerRect.top;
          // Linha do match 2 ao mid
          paths.push(`M ${x1} ${y2} H ${midX}`);
          // Linha vertical conectando os dois
          paths.push(`M ${midX} ${y1} V ${y2}`);
        }

        // Linha do mid até o target
        paths.push(`M ${midX} ${yt} H ${xt}`);
      }
    }

    svg.innerHTML = paths.map(p => `<path d="${p}"/>`).join('');
  });
}

/* Re-layout em resize */
window.addEventListener('resize', () => {
  const containers = document.querySelectorAll('.bracket-scroll');
  containers.forEach(c => layoutBracket(c));
});
