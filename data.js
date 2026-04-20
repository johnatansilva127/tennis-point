/* ==================================================
   TENNIS POINT — Data Store
   ================================================== */

const AVATAR_COLORS = [
  '--av-pink', '--av-orange', '--av-blue', '--av-purple',
  '--av-teal', '--av-amber', '--av-rose', '--av-green',
  '--av-indigo', '--av-gray'
];

function avatarColor(name) {
  if (!name) return 'var(--av-gray)';
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return `var(${AVATAR_COLORS[h % AVATAR_COLORS.length]})`;
}

function initials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/* -------- Default state -------- */
const DEFAULT_STATE = {
  user: null, // { name, role: 'member'|'admin', email, category }

  // Customização (salva no localStorage)
  settings: {
    theme: 'dark',
    brandColor: '#c8ff3d',
    accentColor: '#0a0a0a',
    tournamentName: 'Master 1000 Tennis Point',
    tournamentVenue: 'Tennis Point Club',
    tournamentDateStart: '2026-04-25',
    tournamentDateEnd: '2026-05-10',
    showSponsors: true,
    enableNotifications: true,
    bracketStyle: 'classic', // classic | compact
    enableLiveScoring: true,
    publicBracket: true,
    autoAdvanceWinners: true,
    seedingProtection: true,
  },

  categories: [
    { id: 'cat-a', name: 'Cat. A', icon: '🥇', color: '--av-amber' },
    { id: 'cat-5a', name: '5ªA', icon: '🎾', color: '--av-pink' },
    { id: 'cat-5b', name: '5ªB', icon: '🎾', color: '--av-blue' },
    { id: 'cat-c', name: 'Cat. C', icon: '🎾', color: '--av-teal' },
    { id: 'cat-ini', name: 'Iniciante', icon: '🌱', color: '--av-green' },
    { id: 'cat-fem', name: 'Feminino', icon: '🩷', color: '--av-rose' },
  ],

  // Membros / Jogadores
  members: [
    { id: 'm-1',  name: 'Ryan Santos',     email: 'ryan@ex.com',     category: 'cat-5a',  status: 'active', matches: 3, wins: 3 },
    { id: 'm-2',  name: 'Gustavo Moraes',  email: 'gustavo@ex.com',  category: 'cat-5a',  status: 'active', matches: 2, wins: 1 },
    { id: 'm-3',  name: 'Glauco Junior',   email: 'glauco@ex.com',   category: 'cat-5a',  status: 'active', matches: 2, wins: 1 },
    { id: 'm-4',  name: 'Gabriel Batagin', email: 'gabriel@ex.com',  category: 'cat-5a',  status: 'active', matches: 3, wins: 2 },
    { id: 'm-5',  name: 'Julio Silva',     email: 'julio@ex.com',    category: 'cat-5a',  status: 'active', matches: 1, wins: 1 },
    { id: 'm-6',  name: 'Luka Ono',        email: 'luka@ex.com',     category: 'cat-5a',  status: 'active', matches: 2, wins: 1 },
    { id: 'm-7',  name: 'Leonardo Zancheta', email: 'leo@ex.com',    category: 'cat-5a',  status: 'active', matches: 1, wins: 0 },
    { id: 'm-8',  name: 'Conta Removida',  email: 'rem@ex.com',      category: 'cat-5a',  status: 'inactive', matches: 1, wins: 0 },
    { id: 'm-9',  name: 'Pedro Alves',     email: 'pedro@ex.com',    category: 'cat-5a',  status: 'active', matches: 0, wins: 0 },
    { id: 'm-10', name: 'Rafael Souza',    email: 'rafael@ex.com',   category: 'cat-a',   status: 'active', matches: 5, wins: 3 },
    { id: 'm-11', name: 'Carlos Mendes',   email: 'carlos@ex.com',   category: 'cat-5a',  status: 'active', matches: 4, wins: 2 },
    { id: 'm-12', name: 'Fernanda Lima',   email: 'fernanda@ex.com', category: 'cat-fem', status: 'active', matches: 3, wins: 2 },
    { id: 'm-13', name: 'Ana Silva',       email: 'ana@ex.com',      category: 'cat-fem', status: 'active', matches: 2, wins: 1 },
    { id: 'm-14', name: 'Beatriz Lima',    email: 'bia@ex.com',      category: 'cat-fem', status: 'active', matches: 2, wins: 1 },
    { id: 'm-15', name: 'Marco Tulio',     email: 'marco@ex.com',    category: 'cat-a',   status: 'active', matches: 4, wins: 3 },
    { id: 'm-16', name: 'Sofia Costa',     email: 'sofia@ex.com',    category: 'cat-fem', status: 'pending', matches: 0, wins: 0 },
    { id: 'm-17', name: 'Thiago Reis',     email: 'thiago@ex.com',   category: 'cat-5b',  status: 'active', matches: 2, wins: 1 },
    { id: 'm-18', name: 'Helena Dias',     email: 'helena@ex.com',   category: 'cat-fem', status: 'active', matches: 1, wins: 0 },
    { id: 'm-19', name: 'Diego Faria',     email: 'diego@ex.com',    category: 'cat-5b',  status: 'active', matches: 3, wins: 2 },
    { id: 'm-20', name: 'Vinicius Rocha',  email: 'vini@ex.com',     category: 'cat-c',   status: 'active', matches: 1, wins: 0 },
  ],

  // Quadras
  courts: [
    { id: 'q-1', name: 'Quadra 1 — Central', surface: 'Saibro' },
    { id: 'q-2', name: 'Quadra 2', surface: 'Saibro' },
    { id: 'q-3', name: 'Quadra 3', surface: 'Hard' },
  ],

  // Reservas/horários
  schedules: [
    { id: 's-1', courtId: 'q-1', date: '2026-04-19', start: '08:00', end: '10:00', type: 'Treino livre', spots: 4, taken: 1 },
    { id: 's-2', courtId: 'q-2', date: '2026-04-19', start: '11:00', end: '13:00', type: 'Aula em grupo', spots: 4, taken: 4 },
    { id: 's-3', courtId: 'q-3', date: '2026-04-19', start: '14:00', end: '16:00', type: 'Treino livre', spots: 2, taken: 0 },
  ],

  // Brackets / Chaves
  // Estrutura por categoria — armazenamos os matches gerados
  brackets: {
    'cat-5a': null, // Será preenchido com sorteio padrão de demo abaixo
  },

  // Notificações
  notifications: [
    { id: 'n-1', icon: '🏆', title: 'Chave sorteada! Cat. 5ªA — Você enfrenta Pedro Alves na Rodada 1', time: 'há 1 hora', read: false },
    { id: 'n-2', icon: '📅', title: 'Nova quadra disponível: Sáb 26/04 às 08:00', time: 'há 2 horas', read: false },
    { id: 'n-3', icon: '✅', title: 'Resultado confirmado: Você 6-4, 7-5 vs Carlos M.', time: 'há 1 dia', read: true },
    { id: 'n-4', icon: '📣', title: 'Inscrições abertas: Categoria Iniciante — vagas limitadas!', time: 'há 2 dias', read: true },
  ],
};

/* -------- Demo bracket pré-populado (estilo da imagem) -------- */
function seedDemoBracket() {
  const r32 = [
    { id: 'm-r32-1', n: 1,  round: 'R32', p1: 'm-1', p2: null,  scores: [], winner: 'm-1', date: null, time: null, isBye: true },
    { id: 'm-r32-2', n: 2,  round: 'R32', p1: 'm-2', p2: 'm-8', scores: [[6,1],[6,1]], winner: 'm-2', date: '2026-03-27', time: '21:00' },
    { id: 'm-r32-3', n: 3,  round: 'R32', p1: 'm-3', p2: 'm-7', scores: [[6,1],[6,0]], winner: 'm-3', date: '2026-03-27', time: '20:00' },
    { id: 'm-r32-4', n: 4,  round: 'R32', p1: null,  p2: 'm-4', scores: [], winner: 'm-4', date: null, time: null, isBye: true },
    { id: 'm-r32-5', n: 5,  round: 'R32', p1: 'm-5', p2: null,  scores: [], winner: 'm-5', date: null, time: null, isBye: true },
    { id: 'm-r32-6', n: 6,  round: 'R32', p1: 'm-6', p2: 'm-9', scores: [[6,1],[6,3]], winner: 'm-6', date: null, time: null },
    { id: 'm-r32-7', n: 7,  round: 'R32', p1: 'm-11', p2: null, scores: [], winner: 'm-11', date: null, time: null, isBye: true },
    { id: 'm-r32-8', n: 8,  round: 'R32', p1: 'm-17', p2: 'm-19', scores: [[6,4],[7,5]], winner: 'm-17', date: null, time: null },
  ];

  const r16 = [
    { id: 'm-r16-1', n: 17, round: 'R16', p1: 'm-1', p2: 'm-2', scores: [[6,0],[6,0]], winner: 'm-1', date: '2026-03-28', time: '11:30' },
    { id: 'm-r16-2', n: 18, round: 'R16', p1: 'm-3', p2: 'm-4', scores: [[6,4],[2,6],[5,10]], winner: 'm-4', date: '2026-03-28', time: '09:00' },
    { id: 'm-r16-3', n: 19, round: 'R16', p1: 'm-5', p2: 'm-6', scores: [[6,1],[6,3]], winner: 'm-5', date: '2026-03-28', time: '09:00' },
    { id: 'm-r16-4', n: 20, round: 'R16', p1: 'm-11', p2: 'm-17', scores: [], winner: null, date: null, time: null },
  ];

  const qf = [
    { id: 'm-qf-1', n: 25, round: 'QF', p1: 'm-1', p2: 'm-4', scores: [[6,7],[7,5],[10,5]], winner: 'm-1', date: '2026-03-28', time: '17:00', tiebreaks: [[6,7]] },
    { id: 'm-qf-2', n: 26, round: 'QF', p1: 'm-5', p2: null, scores: [], winner: null, date: null, time: null },
  ];

  const sf = [
    { id: 'm-sf-1', n: 29, round: 'SF', p1: 'm-1', p2: null, scores: [], winner: null, date: null, time: null },
  ];

  const f = [
    { id: 'm-f-1', n: 31, round: 'F', p1: null, p2: null, scores: [], winner: null, date: null, time: null },
  ];

  return {
    rounds: ['R32', 'R16', 'QF', 'SF', 'F'],
    matches: { R32: r32, R16: r16, QF: qf, SF: sf, F: f },
    drawn: true,
    publishedAt: new Date().toISOString(),
  };
}

/* -------- State manager -------- */
const STORAGE_KEY = 'tennispoint-state-v303-dark';

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // merge com defaults para garantir novos campos
      return {
        ...DEFAULT_STATE,
        ...parsed,
        settings: { ...DEFAULT_STATE.settings, ...(parsed.settings || {}) },
      };
    }
  } catch (e) { console.warn('State load failed', e); }
  const fresh = JSON.parse(JSON.stringify(DEFAULT_STATE));
  fresh.brackets['cat-5a'] = seedDemoBracket();
  return fresh;
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(STATE));
  } catch (e) { console.warn('State save failed', e); }
}

let STATE = loadState();

function resetState() {
  localStorage.removeItem(STORAGE_KEY);
  STATE = loadState();
}

/* -------- Helpers de acesso -------- */
function getMember(id) { return STATE.members.find(m => m.id === id); }
function getCategory(id) { return STATE.categories.find(c => c.id === id); }
function getCourt(id) { return STATE.courts.find(c => c.id === id); }

function memberName(id) {
  if (!id) return 'BYE';
  const m = getMember(id);
  return m ? m.name : 'BYE';
}

function categoryMembers(catId) {
  return STATE.members.filter(m => m.category === catId && m.status === 'active');
}

function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  const days = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
  const dd = String(d.getDate()).padStart(2,'0');
  const mm = String(d.getMonth()+1).padStart(2,'0');
  const yy = String(d.getFullYear()).slice(2);
  return `${days[d.getDay()]}, ${dd}/${mm}/${yy}`;
}
function fmtDateShort(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getFullYear()).slice(2)}`;
}

/* -------- Bracket generation -------- */
function generateBracket(playerIds, seedIds = []) {
  if (playerIds.length < 2) return null;

  // Determine bracket size (next power of 2)
  let size = 2;
  while (size < playerIds.length) size *= 2;

  const seeds = seedIds.filter(id => playerIds.includes(id));
  const others = playerIds.filter(id => !seeds.includes(id));

  // Shuffle others
  const shuffled = [...others].sort(() => Math.random() - 0.5);

  // Place seeds in opposite quadrants then fill
  const slots = new Array(size).fill(null);

  if (seeds.length >= 1) slots[0] = seeds[0];
  if (seeds.length >= 2) slots[size - 1] = seeds[1];
  if (seeds.length >= 3) slots[size / 2] = seeds[2];
  if (seeds.length >= 4) slots[size / 2 - 1] = seeds[3];

  // Add remaining seeds (5+)
  for (let i = 4; i < seeds.length; i++) {
    const idx = slots.findIndex(s => s === null);
    if (idx >= 0) slots[idx] = seeds[i];
  }

  // Fill remaining slots with shuffled players
  for (const p of shuffled) {
    const idx = slots.findIndex(s => s === null);
    if (idx >= 0) slots[idx] = p;
  }

  // Build rounds
  const rounds = [];
  let roundName;
  if (size === 32) rounds.push('R32');
  if (size >= 16) rounds.push('R16');
  if (size >= 8) rounds.push('QF');
  if (size >= 4) rounds.push('SF');
  rounds.push('F');

  const matches = {};
  let matchCounter = 1;

  // Round 1
  const r1Name = rounds[0];
  matches[r1Name] = [];
  for (let i = 0; i < size; i += 2) {
    const p1 = slots[i];
    const p2 = slots[i + 1];
    const isBye = !p1 || !p2;
    matches[r1Name].push({
      id: `m-${r1Name.toLowerCase()}-${matchCounter}`,
      n: matchCounter,
      round: r1Name,
      p1, p2,
      scores: [],
      winner: isBye ? (p1 || p2) : null,
      date: null, time: null,
      isBye,
    });
    matchCounter++;
  }

  // Subsequent rounds (empty)
  for (let r = 1; r < rounds.length; r++) {
    const roundName = rounds[r];
    const numMatches = size / Math.pow(2, r + 1);
    matches[roundName] = [];
    for (let i = 0; i < numMatches; i++) {
      matches[roundName].push({
        id: `m-${roundName.toLowerCase()}-${matchCounter}`,
        n: matchCounter,
        round: roundName,
        p1: null, p2: null,
        scores: [],
        winner: null,
        date: null, time: null,
      });
      matchCounter++;
    }
  }

  // Auto-advance BYE winners
  if (STATE.settings.autoAdvanceWinners) {
    autoAdvance({ rounds, matches });
  }

  return {
    rounds,
    matches,
    drawn: true,
    publishedAt: new Date().toISOString(),
  };
}

function autoAdvance(bracket) {
  for (let i = 0; i < bracket.rounds.length - 1; i++) {
    const currentRound = bracket.rounds[i];
    const nextRound = bracket.rounds[i + 1];
    const current = bracket.matches[currentRound];
    const next = bracket.matches[nextRound];

    for (let j = 0; j < next.length; j++) {
      const m1 = current[j * 2];
      const m2 = current[j * 2 + 1];
      if (m1?.winner) next[j].p1 = m1.winner;
      if (m2?.winner) next[j].p2 = m2.winner;
    }
  }
}

/* -------- Demo current user -------- */
function setCurrentUser(role) {
  if (role === 'admin') {
    STATE.user = { name: 'Administrador', role: 'admin', email: 'admin@tennispoint.com', category: null };
  } else {
    STATE.user = { name: 'Você', role: 'member', email: 'membro@tennispoint.com', category: 'cat-5a' };
  }
  saveState();
}
