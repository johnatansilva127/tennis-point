/* ==================================================
   TENNIS POINT — Construtor Modular de Chave (v4.12.0)
   Tela exclusiva do admin pra montar a chave do zero, sem template.

   Estrutura:
   - bracket.feeders[matchId] = { p1: <feeder>, p2: <feeder> }
     onde <feeder> pode ser:
       { type: 'match', matchId: 'X', take: 'winner'|'loser' }
       { type: 'entry', entryId: 'Y' }
       { type: 'bye' }
     ou ausente → fallback pra lógica clássica (mi*2, mi*2+1)
   - bracket.format: 'simple_elim' | 'double_elim' | 'round_robin' | 'swiss' | 'custom'
   ================================================== */

// Estado local do construtor (não persiste, só durante edição)
let BUILDER_STATE = {
  catId: null,           // categoria sendo editada
  selectedMatchId: null, // match selecionado pra ver/editar feeders
  selectedSlot: null,    // 'p1' | 'p2' | null
  showFeederModal: false,
};

/* Templates pré-prontos */
const BUILDER_TEMPLATES = {
  simple_8:  { rounds: ['QF', 'SF', 'F'],            sizes: [4, 2, 1] },
  simple_16: { rounds: ['R16', 'QF', 'SF', 'F'],     sizes: [8, 4, 2, 1] },
  simple_32: { rounds: ['R32', 'R16', 'QF', 'SF', 'F'], sizes: [16, 8, 4, 2, 1] },
  simple_64: { rounds: ['R64', 'R32', 'R16', 'QF', 'SF', 'F'], sizes: [32, 16, 8, 4, 2, 1] },
};

/* Renderiza a tela do Construtor */
function renderBracketBuilder() {
  try {
    return _renderBracketBuilderUnsafe();
  } catch (err) {
    console.error('[Construtor] Erro:', err);
    return `
      <div class="screen" style="padding:20px;color:#f5f5f7">
        <button class="btn-secondary" onclick="navigate('tournament')" style="margin-bottom:16px">‹ Voltar</button>
        <h2 style="font-family:var(--font-display);font-weight:700">⚠️ Erro no Construtor</h2>
        <p class="muted">Algo quebrou ao tentar abrir o Construtor. Detalhes:</p>
        <pre style="background:#1a1a1d;padding:12px;border-radius:8px;font-size:12px;overflow:auto">${(err.message || err) + '\n\n' + (err.stack || '')}</pre>
        <p class="muted" style="margin-top:16px">Tente Ctrl+Shift+R pra forçar reload, ou volte e me avise o erro acima.</p>
      </div>
    `;
  }
}

function _renderBracketBuilderUnsafe() {
  if (typeof STATE === 'undefined' || !STATE.user) {
    return `
      <div class="screen" style="padding:20px;color:#f5f5f7">
        <button class="btn-secondary" onclick="navigate('home')" style="margin-bottom:16px">‹ Início</button>
        <h2>⏳ Carregando...</h2>
        <p class="muted">STATE ainda não foi carregado. Tente Ctrl+Shift+R.</p>
      </div>
    `;
  }
  if (STATE.user.role !== 'admin') {
    return `
      <div class="screen" style="padding:20px;color:#f5f5f7">
        <button class="btn-secondary" onclick="navigate('tournament')" style="margin-bottom:16px">‹ Voltar</button>
        <h2>🔒 Acesso negado</h2>
        <p class="muted">Apenas administradores podem usar o Construtor.</p>
      </div>
    `;
  }

  const catId = BUILDER_STATE.catId || (typeof currentBracketCategory !== 'undefined' ? currentBracketCategory : null) || (STATE.categories && STATE.categories[0] && STATE.categories[0].id);
  if (!catId) {
    return `
      <div class="screen" style="padding:20px;color:#f5f5f7">
        <button class="btn-secondary" onclick="navigate('tournament')" style="margin-bottom:16px">‹ Voltar</button>
        <h2>⚠️ Sem categoria selecionada</h2>
        <p class="muted">Volte ao Torneio, selecione uma categoria, e clique em Construtor.</p>
      </div>
    `;
  }
  BUILDER_STATE.catId = catId;
  const cat = (STATE.categories || []).find(c => c.id === catId) || { name: catId, icon: '🎾' };

  // Garante que STATE.brackets[catId] existe (se não, cria vazio)
  if (!STATE.brackets) STATE.brackets = {};
  if (!STATE.brackets[catId]) STATE.brackets[catId] = _emptyBracket(catId);
  const br = STATE.brackets[catId];
  if (!br.rounds) br.rounds = [];
  if (!br.matches) br.matches = {};
  if (!br.entries) br.entries = [];
  if (!br.feeders) br.feeders = {};

  return `
    <div class="screen builder-screen">
      <div class="builder-header">
        <button class="builder-back" data-action="builder-back">‹ Voltar</button>
        <div class="builder-title">
          <span class="builder-icon">🛠️</span>
          <h1>Construtor de chave</h1>
          <span class="builder-cat-chip">${cat.icon} ${cat.name}</span>
        </div>
        <div class="builder-actions-right">
          <button class="btn-secondary builder-template-btn" data-action="builder-template">📐 Aplicar template</button>
          <button class="btn-primary" data-action="builder-save">💾 Salvar e ver chave</button>
        </div>
      </div>

      <div class="builder-body">
        <aside class="builder-sidebar">
          <h3>Estrutura</h3>
          ${_renderRoundsList(br)}
          <button class="builder-add-round" data-action="builder-add-round">+ Adicionar round</button>
          <div class="builder-sep"></div>
          <h3>Jogadores (${(br.entries || []).length})</h3>
          ${_renderEntriesList(br)}
          <button class="builder-add-entry" data-action="builder-add-entry">+ Adicionar jogador</button>
        </aside>

        <main class="builder-canvas">
          ${_renderBuilderCanvas(br)}
        </main>
      </div>
    </div>
  `;
}

function _emptyBracket(catId) {
  return {
    category_id: catId,
    drawn: true,
    format: 'custom',
    rounds: [],
    matches: {},
    entries: [],
    feeders: {},
  };
}

function _renderRoundsList(br) {
  if (!br.rounds || !br.rounds.length) {
    return '<p class="builder-empty-hint">Nenhum round ainda. Adicione um!</p>';
  }
  return `
    <ul class="builder-rounds-list">
      ${br.rounds.map((r, i) => {
        const count = (br.matches[r] || []).length;
        return `
          <li class="builder-round-item">
            <span class="brl-name">${ROUND_LABELS[r] || r}</span>
            <span class="brl-count">${count} matches</span>
            <button class="brl-rename" data-action="builder-rename-round" data-round="${r}" title="Renomear">✏️</button>
            <button class="brl-add-match" data-action="builder-add-match" data-round="${r}" title="Adicionar match">+</button>
            <button class="brl-remove" data-action="builder-remove-round" data-round="${r}" title="Remover round">🗑️</button>
          </li>
        `;
      }).join('')}
    </ul>
  `;
}

function _renderEntriesList(br) {
  const entries = br.entries || [];
  if (!entries.length) {
    return '<p class="builder-empty-hint">Sem jogadores. Adicione!</p>';
  }
  return `
    <ul class="builder-entries-list">
      ${entries.map(e => `
        <li class="builder-entry-item" data-entry-id="${e.id}" draggable="true">
          <span class="bei-avatar">${initials(e.name)}</span>
          <span class="bei-name">${e.name}</span>
        </li>
      `).join('')}
    </ul>
  `;
}

function _renderBuilderCanvas(br) {
  if (!br.rounds || !br.rounds.length) {
    return `
      <div class="builder-canvas-empty">
        <div class="bce-icon">🛠️</div>
        <h2>Comece adicionando um round</h2>
        <p>Use a barra esquerda pra adicionar rounds (R32, R16, QF, etc) e matches.</p>
        <button class="btn-primary" data-action="builder-quickstart">🚀 Início rápido (template)</button>
      </div>
    `;
  }

  return `
    <div class="builder-canvas-grid">
      ${br.rounds.map((r, ri) => `
        <div class="builder-round-col" data-round="${r}">
          <div class="brc-header">
            <span class="brc-title">${ROUND_LABELS[r] || r}</span>
            <button class="brc-add" data-action="builder-add-match" data-round="${r}">+</button>
          </div>
          <div class="brc-matches">
            ${(br.matches[r] || []).map((m, mi) => _renderBuilderMatch(br, m, ri, mi)).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function _renderBuilderMatch(br, match, ri, mi) {
  const feeders = (br.feeders || {})[match.id] || {};
  const slot1 = _renderSlot(br, match, 'p1', feeders.p1);
  const slot2 = _renderSlot(br, match, 'p2', feeders.p2);
  return `
    <div class="builder-match" data-match-id="${match.id}">
      <div class="bm-header">
        <span class="bm-num">#${match.n}</span>
        <button class="bm-remove" data-action="builder-remove-match" data-match-id="${match.id}" title="Remover match">×</button>
      </div>
      ${slot1}
      ${slot2}
    </div>
  `;
}

function _renderSlot(br, match, slotKey, feeder) {
  const playerId = match[slotKey];
  let label = '+ definir slot';
  let cls = 'builder-slot empty';
  let badge = '';

  if (feeder) {
    if (feeder.type === 'match') {
      const srcMatch = _findMatchById(br, feeder.matchId);
      const takeLbl = feeder.take === 'loser' ? 'Perdedor' : 'Vencedor';
      label = srcMatch ? `${takeLbl} de #${srcMatch.n} (${srcMatch.round})` : `${takeLbl} de match removido`;
      cls = 'builder-slot from-match';
      badge = '🔗';
    } else if (feeder.type === 'entry') {
      const entry = (br.entries || []).find(e => e.id === feeder.entryId);
      label = entry ? entry.name : 'Jogador removido';
      cls = 'builder-slot from-entry';
      badge = '👤';
    } else if (feeder.type === 'bye') {
      label = 'BYE';
      cls = 'builder-slot bye';
      badge = '×';
    }
  } else if (playerId) {
    const entry = (br.entries || []).find(e => e.id === playerId);
    label = entry ? entry.name : 'Jogador';
    cls = 'builder-slot has-player';
    badge = '👤';
  }

  return `
    <div class="${cls}" data-match-id="${match.id}" data-slot="${slotKey}" data-action="builder-edit-slot">
      <span class="bs-badge">${badge}</span>
      <span class="bs-label">${label}</span>
    </div>
  `;
}

function _findMatchById(br, matchId) {
  for (const r of (br.rounds || [])) {
    const m = (br.matches[r] || []).find(x => x.id === matchId);
    if (m) return m;
  }
  return null;
}

/* ============ AÇÕES (chamadas pelo bind do app.js) ============ */

async function builderAction(action, dataset) {
  const catId = BUILDER_STATE.catId;
  let br = STATE.brackets[catId];
  if (!br) {
    br = _emptyBracket(catId);
    STATE.brackets[catId] = br;
  }

  switch (action) {
    case 'builder-back':
      navigate('tournament');
      return;

    case 'builder-save':
      await _builderPersist(catId);
      currentBracketCategory = catId;
      navigate('tournament');
      toast('Chave salva ✅', 'success');
      return;

    case 'builder-add-round':
      _builderAddRound(br);
      navigate('admin-builder');
      return;

    case 'builder-rename-round':
      _builderRenameRound(br, dataset.round);
      return;

    case 'builder-remove-round':
      _builderRemoveRound(br, dataset.round);
      return;

    case 'builder-add-match':
      _builderAddMatch(br, dataset.round);
      navigate('admin-builder');
      return;

    case 'builder-remove-match':
      _builderRemoveMatch(br, dataset.matchId);
      navigate('admin-builder');
      return;

    case 'builder-add-entry':
      _builderAddEntry(br);
      return;

    case 'builder-edit-slot':
      _builderEditSlot(br, dataset.matchId, dataset.slot);
      return;

    case 'builder-template':
      _builderShowTemplates(br);
      return;

    case 'builder-quickstart':
      _builderApplyTemplate(br, 'simple_16');
      navigate('admin-builder');
      return;
  }
}

function _builderAddRound(br) {
  const suggestions = ['R128', 'R64', 'R32', 'R16', 'QF', 'SF', 'F', 'Repescagem', 'Group A', 'Custom'];
  const used = new Set(br.rounds || []);
  const optionsHTML = suggestions.map(s => `<option value="${s}" ${used.has(s) ? 'disabled' : ''}>${ROUND_LABELS[s] || s}${used.has(s) ? ' (já existe)' : ''}</option>`).join('');
  openModal({
    title: '+ Adicionar round',
    body: `
      <div class="field"><label>Tipo de round</label>
        <select id="builder-new-round">${optionsHTML}</select>
      </div>
      <div class="field"><label>Quantidade de matches</label>
        <input type="number" id="builder-new-round-count" value="4" min="1" max="64">
      </div>
      <p class="muted" style="font-size:12px">O round é adicionado AO FINAL da lista. Você poderá reordenar depois.</p>
    `,
    actions: [
      { label: 'Cancelar', class: 'btn-secondary', onClick: closeModal },
      { label: 'Adicionar', class: 'btn-primary', onClick: () => {
        const name = document.getElementById('builder-new-round').value;
        const count = Math.max(1, parseInt(document.getElementById('builder-new-round-count').value, 10) || 1);
        if (!br.rounds) br.rounds = [];
        if (br.rounds.includes(name)) { toast('Round já existe', 'error'); return; }
        br.rounds.push(name);
        if (!br.matches) br.matches = {};
        br.matches[name] = [];
        for (let i = 1; i <= count; i++) {
          br.matches[name].push({
            id: `m-${name.toLowerCase()}-${i}-${Date.now().toString(36).slice(-3)}`,
            n: i, round: name,
            p1: null, p2: null, scores: [], winner: null,
            isBye: false, walkover_reason: null, date: null, time: null,
          });
        }
        saveState();
        closeModal();
        navigate('admin-builder');
      }},
    ],
  });
}

function _builderRenameRound(br, oldName) {
  const newName = prompt(`Novo nome do round (atual: "${oldName}")`, oldName);
  if (!newName || newName === oldName) return;
  if ((br.rounds || []).includes(newName)) { toast('Já existe um round com esse nome', 'error'); return; }
  const idx = br.rounds.indexOf(oldName);
  br.rounds[idx] = newName;
  br.matches[newName] = (br.matches[oldName] || []).map(m => ({ ...m, round: newName }));
  delete br.matches[oldName];
  // Atualiza feeders que apontavam pra matches deste round (matchId não muda, só o round dentro do match)
  saveState();
  navigate('admin-builder');
}

function _builderRemoveRound(br, roundName) {
  if (!confirm(`Remover round "${roundName}" e todos os seus matches?`)) return;
  br.rounds = (br.rounds || []).filter(r => r !== roundName);
  // Coleta IDs dos matches deste round pra limpar feeders
  const removedIds = new Set((br.matches[roundName] || []).map(m => m.id));
  delete br.matches[roundName];
  // Limpa feeders que apontam pra matches removidos
  if (br.feeders) {
    Object.keys(br.feeders).forEach(mid => {
      const f = br.feeders[mid];
      ['p1', 'p2'].forEach(slot => {
        if (f[slot] && f[slot].type === 'match' && removedIds.has(f[slot].matchId)) {
          delete f[slot];
        }
      });
    });
  }
  saveState();
  navigate('admin-builder');
}

function _builderAddMatch(br, roundName) {
  if (!br.matches[roundName]) br.matches[roundName] = [];
  const list = br.matches[roundName];
  const lastN = list.length ? list[list.length - 1].n : 0;
  const newN = lastN + 1;
  list.push({
    id: `m-${roundName.toLowerCase()}-${newN}-${Date.now().toString(36).slice(-3)}`,
    n: newN, round: roundName,
    p1: null, p2: null, scores: [], winner: null,
    isBye: false, walkover_reason: null, date: null, time: null,
  });
  saveState();
}

function _builderRemoveMatch(br, matchId) {
  for (const r of (br.rounds || [])) {
    const list = br.matches[r] || [];
    const idx = list.findIndex(m => m.id === matchId);
    if (idx >= 0) {
      list.splice(idx, 1);
      // Renumera
      list.forEach((m, i) => m.n = i + 1);
      // Limpa feeders apontando pra ele
      if (br.feeders) {
        Object.keys(br.feeders).forEach(mid => {
          ['p1', 'p2'].forEach(slot => {
            const f = br.feeders[mid][slot];
            if (f && f.type === 'match' && f.matchId === matchId) {
              delete br.feeders[mid][slot];
            }
          });
        });
        delete br.feeders[matchId];
      }
      break;
    }
  }
  saveState();
}

function _builderAddEntry(br) {
  const name = prompt('Nome do jogador:');
  if (!name || !name.trim()) return;
  if (!br.entries) br.entries = [];
  const id = `tp-${BUILDER_STATE.catId}-${name.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now().toString(36).slice(-3)}`;
  br.entries.push({ id, name: name.trim() });
  saveState();
  navigate('admin-builder');
}

function _builderEditSlot(br, matchId, slotKey) {
  const match = _findMatchById(br, matchId);
  if (!match) return;
  if (!br.feeders) br.feeders = {};
  if (!br.feeders[matchId]) br.feeders[matchId] = {};
  const currentFeeder = br.feeders[matchId][slotKey];

  // Lista de matches disponíveis pra alimentar este slot (só de rounds anteriores)
  const myRoundIdx = br.rounds.indexOf(match.round);
  const availableMatches = [];
  for (let ri = 0; ri < myRoundIdx; ri++) {
    const r = br.rounds[ri];
    (br.matches[r] || []).forEach(m => {
      if (m.id !== matchId) availableMatches.push({ ...m, round: r });
    });
  }

  const matchOptionsHTML = availableMatches.map(m => `
    <option value="${m.id}">#${m.n} (${m.round})</option>
  `).join('');

  const entryOptionsHTML = (br.entries || []).map(e => `
    <option value="${e.id}">${e.name}</option>
  `).join('');

  let initialType = 'entry';
  let initialMatchId = '';
  let initialEntryId = '';
  let initialTake = 'winner';
  if (currentFeeder) {
    initialType = currentFeeder.type;
    if (currentFeeder.type === 'match') {
      initialMatchId = currentFeeder.matchId;
      initialTake = currentFeeder.take || 'winner';
    } else if (currentFeeder.type === 'entry') {
      initialEntryId = currentFeeder.entryId;
    }
  }

  openModal({
    title: '🎯 Definir slot',
    sub: `Match #${match.n} · ${match.round} · slot ${slotKey === 'p1' ? 'TOPO' : 'BAIXO'}`,
    body: `
      <div class="field">
        <label>Tipo</label>
        <div class="builder-slot-type-tabs">
          <label class="bstt-opt"><input type="radio" name="bs-type" value="entry" ${initialType === 'entry' ? 'checked' : ''}> 👤 Jogador direto</label>
          <label class="bstt-opt"><input type="radio" name="bs-type" value="match" ${initialType === 'match' ? 'checked' : ''}> 🔗 Vencedor de outro match</label>
          <label class="bstt-opt"><input type="radio" name="bs-type" value="bye" ${initialType === 'bye' ? 'checked' : ''}> × BYE</label>
        </div>
      </div>

      <div class="field" id="bs-entry-field" style="display:${initialType === 'entry' ? 'block' : 'none'}">
        <label>Selecione o jogador</label>
        <select id="bs-entry-select">
          <option value="">— escolher —</option>
          ${entryOptionsHTML}
        </select>
      </div>

      <div class="field" id="bs-match-field" style="display:${initialType === 'match' ? 'block' : 'none'}">
        <label>Match alimentador</label>
        <select id="bs-match-select">
          <option value="">— escolher —</option>
          ${matchOptionsHTML}
        </select>
        <label style="margin-top:10px">Pegar:</label>
        <select id="bs-take-select">
          <option value="winner" ${initialTake === 'winner' ? 'selected' : ''}>Vencedor</option>
          <option value="loser" ${initialTake === 'loser' ? 'selected' : ''}>Perdedor (pra repescagem)</option>
        </select>
      </div>

      <p class="muted" style="font-size:12px;margin-top:8px">${availableMatches.length === 0 ? '⚠️ Não há matches em rounds anteriores. Adicione rounds antes.' : ''}</p>
    `,
    actions: [
      { label: 'Cancelar', class: 'btn-secondary', onClick: closeModal },
      currentFeeder ? { label: 'Limpar', class: 'btn-secondary', onClick: () => {
        delete br.feeders[matchId][slotKey];
        saveState();
        closeModal();
        navigate('admin-builder');
      }} : null,
      { label: 'Salvar', class: 'btn-primary', onClick: () => {
        const type = document.querySelector('input[name="bs-type"]:checked').value;
        if (type === 'entry') {
          const entryId = document.getElementById('bs-entry-select').value;
          if (!entryId) { toast('Selecione um jogador', 'error'); return; }
          br.feeders[matchId][slotKey] = { type: 'entry', entryId };
          match[slotKey] = entryId;
        } else if (type === 'match') {
          const srcMatchId = document.getElementById('bs-match-select').value;
          const take = document.getElementById('bs-take-select').value;
          if (!srcMatchId) { toast('Selecione um match alimentador', 'error'); return; }
          br.feeders[matchId][slotKey] = { type: 'match', matchId: srcMatchId, take };
          match[slotKey] = null; // será preenchido quando match alimentador terminar
        } else if (type === 'bye') {
          br.feeders[matchId][slotKey] = { type: 'bye' };
          match[slotKey] = null;
          // Se outro slot tem player, marca BYE e auto-advance
          const otherSlot = slotKey === 'p1' ? 'p2' : 'p1';
          if (match[otherSlot]) {
            match.winner = match[otherSlot];
            match.isBye = true;
          }
        }
        saveState();
        closeModal();
        navigate('admin-builder');
      }},
    ].filter(Boolean),
  });

  // Wire dos radios pra alternar campos
  setTimeout(() => {
    document.querySelectorAll('input[name="bs-type"]').forEach(r => {
      r.addEventListener('change', () => {
        document.getElementById('bs-entry-field').style.display = r.value === 'entry' ? 'block' : 'none';
        document.getElementById('bs-match-field').style.display = r.value === 'match' ? 'block' : 'none';
      });
    });
    if (initialEntryId) document.getElementById('bs-entry-select').value = initialEntryId;
    if (initialMatchId) document.getElementById('bs-match-select').value = initialMatchId;
  }, 50);
}

function _builderShowTemplates(br) {
  const optionsHTML = Object.entries(BUILDER_TEMPLATES).map(([key, t]) => `
    <button class="builder-template-card" data-template="${key}">
      <strong>${key.replace('simple_', 'Simples ')}</strong>
      <span>${t.rounds.join(' → ')}</span>
      <span class="muted" style="font-size:11px">${t.sizes[0] * 2} jogadores</span>
    </button>
  `).join('');
  openModal({
    title: '📐 Aplicar template',
    body: `
      <p class="muted" style="margin-bottom:12px">⚠️ Aplicar um template VAI APAGAR a estrutura atual (rounds, matches, feeders). Os jogadores (entries) ficam.</p>
      <div class="builder-template-grid">${optionsHTML}</div>
    `,
    actions: [{ label: 'Cancelar', class: 'btn-secondary', onClick: closeModal }],
  });
  setTimeout(() => {
    document.querySelectorAll('.builder-template-card').forEach(c => {
      c.addEventListener('click', () => {
        _builderApplyTemplate(br, c.dataset.template);
        closeModal();
        navigate('admin-builder');
      });
    });
  }, 50);
}

function _builderApplyTemplate(br, key) {
  const t = BUILDER_TEMPLATES[key];
  if (!t) return;
  br.rounds = [...t.rounds];
  br.matches = {};
  br.feeders = {};
  t.rounds.forEach((r, ri) => {
    const size = t.sizes[ri];
    br.matches[r] = [];
    for (let i = 1; i <= size; i++) {
      const matchId = `m-${r.toLowerCase()}-${i}`;
      br.matches[r].push({
        id: matchId, n: i, round: r,
        p1: null, p2: null, scores: [], winner: null,
        isBye: false, walkover_reason: null, date: null, time: null,
      });
      // Feeders: round[ri+1].matches[i-1] vem de round[ri].matches[(i-1)*2] e [(i-1)*2+1]
      if (ri > 0) {
        const prevR = t.rounds[ri - 1];
        const fa = `m-${prevR.toLowerCase()}-${(i - 1) * 2 + 1}`;
        const fb = `m-${prevR.toLowerCase()}-${(i - 1) * 2 + 2}`;
        br.feeders[matchId] = {
          p1: { type: 'match', matchId: fa, take: 'winner' },
          p2: { type: 'match', matchId: fb, take: 'winner' },
        };
      }
    }
  });
  br.format = 'simple_elim';
  saveState();
  toast(`Template "${key}" aplicado ✅`, 'success');
}

async function _builderPersist(catId) {
  const br = STATE.brackets[catId];
  if (!br || !STATE._activeTournamentId) return;
  try {
    await TP.Brackets.updateData(STATE._activeTournamentId, catId, br);
  } catch (e) {
    toast('⚠️ Erro ao salvar: ' + (e.message || 'falha'), 'error');
  }
}

/* Bind global: handler que pega cliques [data-action] dentro da tela do builder */
function bindBracketBuilder() {
  if (!STATE.user || STATE.user.role !== 'admin') return;
  document.querySelectorAll('.builder-screen [data-action]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const action = el.dataset.action;
      builderAction(action, { ...el.dataset });
    });
  });

  // Drag-drop: jogador da sidebar → slot vazio
  document.querySelectorAll('.builder-entry-item').forEach(item => {
    item.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'entry', entryId: item.dataset.entryId }));
      item.classList.add('dragging');
    });
    item.addEventListener('dragend', () => item.classList.remove('dragging'));
  });
  document.querySelectorAll('.builder-slot').forEach(slot => {
    slot.addEventListener('dragover', (e) => {
      e.preventDefault();
      slot.classList.add('drag-over');
    });
    slot.addEventListener('dragleave', () => slot.classList.remove('drag-over'));
    slot.addEventListener('drop', (e) => {
      e.preventDefault();
      slot.classList.remove('drag-over');
      try {
        const data = JSON.parse(e.dataTransfer.getData('text/plain'));
        if (data.type === 'entry') {
          const matchId = slot.dataset.matchId;
          const slotKey = slot.dataset.slot;
          const br = STATE.brackets[BUILDER_STATE.catId];
          if (!br.feeders) br.feeders = {};
          if (!br.feeders[matchId]) br.feeders[matchId] = {};
          br.feeders[matchId][slotKey] = { type: 'entry', entryId: data.entryId };
          const match = _findMatchById(br, matchId);
          if (match) match[slotKey] = data.entryId;
          saveState();
          navigate('admin-builder');
        }
      } catch (err) { console.warn('builder drop', err); }
    });
  });
}

// Expõe pras outras camadas
window.tpRenderBracketBuilder = renderBracketBuilder;
window.tpBindBracketBuilder = bindBracketBuilder;
window.tpBuilderAction = builderAction;
