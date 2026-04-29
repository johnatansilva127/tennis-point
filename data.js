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
    tournamentName: 'Torneio Tênis Point 2026',
    tournamentVenue: 'Tennis Point Academia',
    tournamentDateStart: '2026-04-01',
    tournamentDateEnd: '2026-06-30',
    showSponsors: true,
    enableNotifications: true,
    bracketStyle: 'classic', // classic | compact
    enableLiveScoring: true,
    publicBracket: true,
    autoAdvanceWinners: true,
    seedingProtection: true,
  },

  categories: [
    { id: 'cat-a',  name: 'Cat. A', icon: '🥇', color: '--av-amber' },
    { id: 'cat-5a', name: '5ªA',    icon: '🎾', color: '--av-pink' },
    { id: 'cat-5b', name: '5ªB',    icon: '🎾', color: '--av-blue' },
    { id: 'cat-c',  name: 'Cat. C', icon: '🎾', color: '--av-teal' },
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

  // Jogadores do Torneio Tênis Point 2026 (registry separado dos members do Supabase)
  // Preenchido em seedTournament2026() — ver runtime
  tournamentPlayers: [],

  // Brackets / Chaves
  // Estrutura por categoria — preenchida em seedTournament2026()
  brackets: {
    'cat-a':  null,
    'cat-5a': null,
    'cat-5b': null,
    'cat-c':  null,
  },

  // Notificações
  notifications: [
    { id: 'n-1', icon: '🏆', title: 'Chave sorteada! Cat. 5ªA — Você enfrenta Pedro Alves na Rodada 1', time: 'há 1 hora', read: false },
    { id: 'n-2', icon: '📅', title: 'Nova quadra disponível: Sáb 26/04 às 08:00', time: 'há 2 horas', read: false },
    { id: 'n-3', icon: '✅', title: 'Resultado confirmado: Você 6-4, 7-5 vs Carlos M.', time: 'há 1 dia', read: true },
    { id: 'n-4', icon: '📣', title: 'Inscrições abertas: Categoria Iniciante — vagas limitadas!', time: 'há 2 dias', read: true },
  ],
};

/* -------- Torneio Tênis Point 2026 — chaves reais -------- */
/* Construtor de match para reduzir boilerplate */
function _mk(round, n, p1, p2, opts = {}) {
  return {
    id: `m-${round.toLowerCase()}-${n}`,
    n,
    round,
    p1: p1 || null,
    p2: p2 || null,
    scores: opts.scores || [],
    winner: opts.winner || null,
    date: opts.date || null,
    time: opts.time || null,
    isBye: !!opts.isBye,
  };
}

/* Constrói rounds vazios subsequentes com auto-advance de winners conhecidos */
function _buildRoundsAfterFirst(firstMatches, firstRoundName, totalSize) {
  const rounds = [];
  if (totalSize === 64) rounds.push('R64');
  if (totalSize >= 32) rounds.push('R32');
  if (totalSize >= 16) rounds.push('R16');
  if (totalSize >= 8)  rounds.push('QF');
  if (totalSize >= 4)  rounds.push('SF');
  rounds.push('F');

  // Trim rounds anteriores ao first round
  const startIdx = rounds.indexOf(firstRoundName);
  const activeRounds = rounds.slice(startIdx);

  const matches = { [firstRoundName]: firstMatches };
  let mid = firstMatches.length + 1;

  for (let i = 1; i < activeRounds.length; i++) {
    const rn = activeRounds[i];
    const num = firstMatches.length / Math.pow(2, i);
    matches[rn] = [];
    for (let j = 0; j < num; j++) {
      matches[rn].push(_mk(rn, mid++, null, null));
    }
  }

  // Auto-advance winners
  for (let i = 0; i < activeRounds.length - 1; i++) {
    const cur = matches[activeRounds[i]];
    const nxt = matches[activeRounds[i + 1]];
    for (let j = 0; j < nxt.length; j++) {
      const m1 = cur[j * 2];
      const m2 = cur[j * 2 + 1];
      if (m1?.winner) nxt[j].p1 = m1.winner;
      if (m2?.winner) nxt[j].p2 = m2.winner;
    }
  }

  return {
    rounds: activeRounds,
    matches,
    drawn: true,
    publishedAt: '2026-04-28T00:00:00Z',
  };
}

function seedTournament2026() {
  // Registry de jogadores do torneio (id sintético → usado pelos brackets)
  // Nota: alguns nomes aparecem em mais de uma categoria. Usamos IDs únicos por categoria
  // via prefixo (ex.: a-ian, b-bueno) pra evitar colisão.
  // accountEmails: array de e-mails das contas Supabase associadas ao slot.
  // Solo entry → 1 e-mail. Pair (ex: "Sandro / Heraldo") → 2 e-mails.
  // Usado pra casar usuário logado ↔ jogador depois do login.
  const players = {};
  const _slugify = name =>
    name.normalize('NFD').replace(/[̀-ͯ]/g, '')
        .toLowerCase().replace(/[^a-z0-9]/g, '');
  const _emailsFor = name =>
    name.split(/\s*\/\s*/).map(p => p.trim()).filter(Boolean)
        .map(p => `${_slugify(p)}@tennispointt.com.br`);
  function P(catKey, slug, name) {
    const id = `tp26-${catKey}-${slug}`;
    players[id] = {
      id,
      name,
      categoryKey: `cat-${catKey}`,
      accountEmails: _emailsFor(name),
    };
    return id;
  }

  // ============ Cat A — 32 draw, 16 R32 matches ============
  const A = {};
  // top half
  A.ian       = P('a','ian','Ian');
  A.rebolMb   = P('a','rebol-mb','L. Rebolças / M. Bomba');
  A.paulao    = P('a','paulao','Paulão');
  A.pan       = P('a','pan','Pan');
  A.fabinho   = P('a','fabinho','Fabinho');
  A.joaoRossi = P('a','joao-rossi','João Rossi');
  A.fcarvoli  = P('a','fcarvoli','F. Carvoli');
  A.brunnoC   = P('a','brunno-c','Brunno C.');
  A.marceloR  = P('a','marcelo-r','Marcelo R.');
  A.panda     = P('a','panda','Panda');
  A.breno     = P('a','breno','Breno');
  A.tammaro   = P('a','tammaro','Tammaro');
  A.lucasN    = P('a','lucas-n','Lucas N.');
  A.thais     = P('a','thais','Thais');
  A.sandroH   = P('a','sandro-h','Sandro / Heraldo');
  A.sandro    = P('a','sandro','Sandro');
  A.rodrigoV  = P('a','rodrigo-v','Rodrigo V.');
  // bottom half
  A.fabioI    = P('a','fabio-i','Fábio I.');
  A.cristian  = P('a','cristian','Cristian');
  A.eduCap    = P('a','edu-cap','Edu Cap.');
  A.felipeC   = P('a','felipe-c','Felipe C.');
  A.magno     = P('a','magno','Magno');
  A.lucianoUb = P('a','luciano-ub','Luciano Ub.');
  A.mCaldera  = P('a','m-caldera','M. Caldera');
  A.martin    = P('a','martin','Martin');
  A.flavio    = P('a','flavio','Flávio');
  A.joaoCurti = P('a','joao-curti','João Curti');
  A.rogester  = P('a','rogester','Rogester');
  A.claudinho = P('a','claudinho','Claudinho');
  A.johnatan  = P('a','johnatan','Johnatan');
  A.rsetor    = P('a','r-setor','R. Setor');
  A.gianniJ   = P('a','gianni-j','Gianni / Jorgi');
  A.jorgi     = P('a','jorgi','Jorgi');
  A.rafaelK   = P('a','rafael-k','Rafael K.');

  // 16 R32 matches (ordem: top half → bottom half)
  const aR32 = [
    _mk('R32', 1,  A.ian,       A.rebolMb),
    _mk('R32', 2,  A.paulao,    A.pan),
    _mk('R32', 3,  A.fabinho,   A.joaoRossi),
    _mk('R32', 4,  A.fcarvoli,  A.brunnoC),
    _mk('R32', 5,  A.marceloR,  A.panda,    { scores: [[3,6],[6,0],[11,9]], winner: A.panda }),
    _mk('R32', 6,  A.breno,     A.tammaro,  { scores: [[2,6],[6,1],[10,2]], winner: A.tammaro }),
    _mk('R32', 7,  A.lucasN,    A.thais),
    _mk('R32', 8,  A.sandroH,   A.sandro,   { scores: [[6,0],[6,1]], winner: A.sandro }),
    // bottom half
    _mk('R32', 9,  A.fabioI,    A.cristian, { scores: [[6,1],[4,6],[11,9]], winner: A.cristian }),
    _mk('R32', 10, A.eduCap,    A.felipeC),
    _mk('R32', 11, A.magno,     A.lucianoUb),
    _mk('R32', 12, A.mCaldera,  A.martin),
    _mk('R32', 13, A.flavio,    A.joaoCurti),
    _mk('R32', 14, A.rogester,  A.claudinho,{ scores: [[6,1],[7,6]], winner: A.claudinho }),
    _mk('R32', 15, A.johnatan,  A.rsetor),
    _mk('R32', 16, A.gianniJ,   A.jorgi,    { scores: [[6,4]], winner: A.jorgi }),
    // (R16 match Sandro x Rodrigo V. e Jorgi x Rafael K. ficam pra segunda rodada)
  ];
  // R16 já tem alguns winners conhecidos vindos do Sandro x Rodrigo V. e Jorgi x Rafael K.
  // (modelados como "match já decidido" via auto-advance + score adicional)
  const aBracket = _buildRoundsAfterFirst(aR32, 'R32', 32);
  // Aplica scores conhecidos do R16 já jogados:
  // R16 #4 (top): Sandro vs Rodrigo V. → Sandro 6/0 6/1
  if (aBracket.matches.R16[3]) {
    aBracket.matches.R16[3].p1 = A.sandro;
    aBracket.matches.R16[3].p2 = A.rodrigoV;
    aBracket.matches.R16[3].scores = [[6,0],[6,1]];
    aBracket.matches.R16[3].winner = A.sandro;
  }
  // R16 #8 (bottom): Jorgi (lesão) vs Rafael K. → Jorgi 6/4 (lesão)
  if (aBracket.matches.R16[7]) {
    aBracket.matches.R16[7].p1 = A.jorgi;
    aBracket.matches.R16[7].p2 = A.rafaelK;
    aBracket.matches.R16[7].scores = [[6,4]];
    aBracket.matches.R16[7].winner = A.jorgi;
  }

  // ============ Cat 5A — 32 draw, 16 R32 matches ============
  // Lendo a imagem: 16 entradas na "main column" (segunda coluna) → 8 R16 visíveis,
  // mas estruturalmente é um 32-draw onde cada cell tem feeders. Modelamos como R32
  // de 32 slots representando os 16 R16 + 16 feeders.
  const B = {};
  // Top half (16 slots)
  B.marceloR  = P('5a','marcelo-ribeiro','Marcelo Ribeiro');
  B.guilherme = P('5a','guilherme','Guilherme');
  B.thiagoC   = P('5a','thiago-c','Thiago C.');
  B.bueno     = P('5a','bueno','Bueno');
  B.lucianoUb = P('5a','luciano-ub','Luciano Ub.');
  B.eduCap    = P('5a','edu-cap','Edu Cap.');
  B.brunoP    = P('5a','bruno-p','Bruno P.');
  B.celio     = P('5a','celio','Célio');
  B.panda     = P('5a','panda','Panda');
  B.lucasBur  = P('5a','lucas-bur','Lucas Bur.');
  B.fcarvoli  = P('5a','f-carvoli','F. Carvoli');
  B.rogester  = P('5a','rogester','Rogester');
  B.reinaldo  = P('5a','reinaldo','Reinaldo');
  B.marcelinho= P('5a','marcelinho','Marcelinho');
  B.henrique  = P('5a','henrique','Henrique');
  B.arthur    = P('5a','arthur','Arthur');
  B.titis     = P('5a','titis','Titis');
  B.mCaldera  = P('5a','m-caldera','M. Caldera');
  B.gianni    = P('5a','gianni','Gianni');
  B.augusto   = P('5a','augusto','Augusto');
  B.juliano   = P('5a','juliano','Juliano');
  B.duarte    = P('5a','duarte','Duarte');
  B.alvaro    = P('5a','alvaro','Alvaro');
  B.magno     = P('5a','magno','Magno');
  // Bottom half
  B.johnatan  = P('5a','johnatan','Johnatan');
  B.silvio    = P('5a','silvio','Sílvio');
  B.mBomba    = P('5a','m-bomba','M. Bomba');
  B.pepe      = P('5a','pepe','Pepe');
  B.rBarros   = P('5a','r-barros','R. Barros');
  B.breno     = P('5a','breno','Breno');
  B.joaoCurti = P('5a','joao-curti','João Curti');
  B.mCanete   = P('5a','m-canete','M. Canete');
  B.guto      = P('5a','guto','Guto');
  B.thiaguinho= P('5a','thiaguinho','Thiaguinho');
  B.thais     = P('5a','thais','Thais');
  B.joaoRossi = P('5a','joao-rossi','João Rossi');
  B.jorgi     = P('5a','jorgi','Jorgi');
  B.paulao    = P('5a','paulao','Paulão');
  B.tBispo    = P('5a','t-bispo','T. Bispo');
  B.gabrielUb = P('5a','gabriel-ub','Gabriel Ub.');
  B.rebolcas  = P('5a','rebolcas','L. Rebolças');
  B.heraldo   = P('5a','heraldo','Heraldo');
  B.marioChile= P('5a','mario-chile','Mário Chile');
  B.marcaoH   = P('5a','marcao-h','Marcão H.');
  B.rsetor    = P('5a','r-setor','R. Setor');
  B.lCastro   = P('5a','l-castro','L. Castro');
  B.leoCurti  = P('5a','leo-curti','Léo Curti');
  B.longueti  = P('5a','longueti','Longueti');
  B.rodrigoUb = P('5a','rodrigo-ub','Rodrigo Ub.');
  B.riad      = P('5a','riad','Riad');
  B.cristianUb= P('5a','cristian-ub','Cristian Ub.');

  // Modelagem: 16 R32 matches (cada uma representando um "card" do print).
  // Slots com vários nomes empilhados viram um único string composto, exceto
  // quando o slot é claramente um "vencedor" mostrado na chave (vai como winner).
  // Os 16 cards do print:
  // Top half:
  //   1. Marcelo Ribeiro vs Guilherme/Thiago C.
  //   2. Bueno/Luciano Ub. vs Luciano Ub.            (BYE feeder + nome direto na 2ª col)
  //   Hmm, melhor seguir literal: cada match com 2 slots.
  // Vou modelar conforme os pares visualmente formados (top-down):
  const bR32 = [
    _mk('R32', 1,  B.marceloR,                                          P('5a','feeder-1','Guilherme / Thiago C.')),
    _mk('R32', 2,  P('5a','feeder-2','Bueno / Luciano Ub.'),            B.lucianoUb),
    _mk('R32', 3,  B.eduCap,                                            B.celio,                                  { scores: [[6,1],[7,6]], winner: B.celio }),
    _mk('R32', 4,  P('5a','feeder-4','Panda / Lucas Bur.'),             B.fcarvoli),
    _mk('R32', 5,  B.rogester,                                          P('5a','feeder-5','Reinaldo / Marcelinho')),
    _mk('R32', 6,  B.henrique,                                          P('5a','feeder-7','Titis / M. Caldera'), { winner: B.henrique }),
    _mk('R32', 7,  B.gianni,                                            P('5a','feeder-8','Augusto / Juliano')),
    _mk('R32', 8,  P('5a','feeder-9','Duarte / Alvaro'),                B.magno),
    // bottom half
    _mk('R32', 9,  B.johnatan,                                          P('5a','feeder-10','Sílvio / M. Bomba')),
    _mk('R32', 10, P('5a','feeder-11','Pepe / R. Barros'),              B.breno),
    _mk('R32', 11, B.joaoCurti,                                         P('5a','feeder-12','M. Canete / Guto')),
    _mk('R32', 12, P('5a','feeder-13','Thiaguinho / Thais'),            P('5a','feeder-14','João Rossi / Jorgi')),
    _mk('R32', 13, B.paulao,                                            B.gabrielUb,                              { scores: [[5,7],[6,0],[10,2]], winner: B.gabrielUb }),
    _mk('R32', 14, P('5a','feeder-16','L. Rebolças / Heraldo'),         P('5a','feeder-17','Mário Chile / Marcão H.')),
    _mk('R32', 15, B.rsetor,                                            P('5a','feeder-18','L. Castro / Léo Curti')),
    _mk('R32', 16, P('5a','feeder-19','Longueti / Rodrigo Ub.'),        P('5a','feeder-20','Riad / Cristian Ub.')),
  ];
  const bBracket = _buildRoundsAfterFirst(bR32, 'R32', 32);

  // ============ Cat 5°B — 64 draw ============
  const C = {};
  // Top half
  C.edenC    = P('5b','eden-cleiton','Éden / Cleiton');
  C.thiagoCo = P('5b','thiago-costa','Thiago Costa');
  C.guilhermo= P('5b','guilhermo','Guilhermo');
  C.duarte   = P('5b','duarte','Duarte');
  C.flavioM  = P('5b','flavio-m','Flávio M.');
  C.aldecir  = P('5b','aldecir','Aldecir');
  C.pedroH   = P('5b','pedro-henrique','Pedro Henrique');
  C.tiagoBu  = P('5b','tiago-burihan','Tiago Burihan');
  C.celio    = P('5b','celio','Célio');
  C.wando    = P('5b','wando','Wando');
  C.alexJG   = P('5b','alex-japa-giovani','Alex Japa / Giovani');
  C.tiagoBis = P('5b','tiago-bispo','Tiago Bispo');
  C.magal    = P('5b','magal','Magal');
  C.brunoOl  = P('5b','bruno-oliv','Bruno Oliv.');
  C.jaco     = P('5b','jaco','Jaco');
  C.bueno    = P('5b','bueno','Bueno');
  C.rodrigoUb= P('5b','rodrigo-ub','Rodrigo Ub.');
  C.pedroKok = P('5b','pedro-kokol','Pedro Kokol');
  C.leandroN = P('5b','leandro-neves','Leandro Neves');
  C.reinaldo = P('5b','reinaldo','Reinaldo');
  C.joaoGoul = P('5b','joao-goulart','João Goulart');
  C.china    = P('5b','china','China');
  C.riad     = P('5b','riad','Riad');
  C.wilson   = P('5b','wilson','Wilson');
  C.cristLodi= P('5b','cristiano-lodi','Cristiano Lodi');
  C.marcoQ   = P('5b','marco-q','Marco Q.');
  C.serginho = P('5b','serginho','Serginho');
  C.marioChi = P('5b','mario-chile','Mário Chile');
  C.joaoV    = P('5b','joao-v','João V.');
  C.julioP   = P('5b','julio-p','Júlio P.');
  C.guilhUb  = P('5b','guilherme-ub','Guilherme Ub.');
  C.guilherme= P('5b','guilherme','Guilherme');
  // Bottom half
  C.gabrielUb= P('5b','gabriel-ub','Gabriel Ub.');
  C.lFelipe  = P('5b','l-felipe','L. Felipe');
  C.augusto  = P('5b','augusto','Augusto');
  C.glaucoB  = P('5b','glauco-beach','Glauco Beach');
  C.miro     = P('5b','miro','Miro');
  C.lucasRam = P('5b','lucas-ramos','Lucas Ramos');
  C.lucasB   = P('5b','lucas-b','Lucas B.');
  C.sharlesG = P('5b','sharles-gimenes','Sharles / R. Gimenes');
  C.brunoPo  = P('5b','bruno-pozzatti','Bruno Pozzatti');
  C.joaoG    = P('5b','joao-g','João G.');
  C.guto     = P('5b','guto','Guto');
  C.mCanete  = P('5b','m-canete','M. Canete');
  C.aRentes  = P('5b','a-rentes','A. Rentes');
  C.salomao  = P('5b','salomao','Salomão');
  C.arthur   = P('5b','arthur','Arthur');
  C.rodrigoB = P('5b','rodrigo-barros','Rodrigo Barros');
  C.fernSSeb = P('5b','fernando-s-seb','Fernando S. Seb.');
  C.quina    = P('5b','quina','Quina');
  C.leoCurti = P('5b','leo-curti','Léo Curti');
  C.lucasCa  = P('5b','lucas-castro','Lucas Castro');
  C.rodrigoR = P('5b','rodrigo-rib','Rodrigo Rib.');
  C.rogerio  = P('5b','rogerio','Rogério');
  C.silvio   = P('5b','silvio','Sílvio');
  C.renan    = P('5b','renan','Renan');
  C.zuca     = P('5b','zuca','Zuca');
  C.peruLE   = P('5b','peru-luis-e','Peru / Luís E.');
  C.gustavoSc= P('5b','gustavo-sc','Gustavo sc');
  C.brunoDi  = P('5b','bruno-diniz','Bruno Diniz');
  C.yan      = P('5b','yan','Yan');
  C.igor     = P('5b','igor','Igor');
  C.pepe     = P('5b','pepe','Pepe');

  // 32 R64 matches (64 slots) — top half (16) + bottom half (16)
  const cR64 = [
    // ===== Top half =====
    _mk('R64', 1,  C.edenC,    C.thiagoCo, { isBye: true, winner: C.thiagoCo }),
    _mk('R64', 2,  C.guilhermo,C.duarte),
    _mk('R64', 3,  C.flavioM,  C.aldecir),
    _mk('R64', 4,  C.pedroH,   C.tiagoBu),
    _mk('R64', 5,  C.celio,    C.wando),
    _mk('R64', 6,  C.alexJG,   C.tiagoBis,{ isBye: true, winner: C.tiagoBis }),
    _mk('R64', 7,  C.magal,    C.brunoOl),
    _mk('R64', 8,  C.jaco,     C.bueno),
    _mk('R64', 9,  null,       C.rodrigoUb,{ isBye: true, winner: C.rodrigoUb }),
    _mk('R64', 10, C.pedroKok, C.leandroN),
    _mk('R64', 11, C.reinaldo, C.joaoGoul, { scores: [[6,4],[3,6],[10,8]], winner: C.joaoGoul }),
    _mk('R64', 12, C.china,    C.riad),
    _mk('R64', 13, C.wilson,   C.cristLodi),
    _mk('R64', 14, C.marcoQ,   C.serginho),
    _mk('R64', 15, C.marioChi, C.joaoV),
    _mk('R64', 16, C.julioP,   C.guilhUb,  { scores: [[6,3],[6,0]], winner: C.guilhUb }),
    // ===== Bottom half =====
    _mk('R64', 17, C.gabrielUb,C.lFelipe,  { scores: [[6,4],[6,0]], winner: C.lFelipe }),
    _mk('R64', 18, C.augusto,  null,       { isBye: true, winner: C.augusto }),
    _mk('R64', 19, C.glaucoB,  C.miro),
    _mk('R64', 20, C.lucasRam, C.lucasB,   { scores: [[6,3],[1,6],[10,5]], winner: C.lucasB }),
    _mk('R64', 21, C.sharlesG, C.brunoPo,  { isBye: true, winner: C.brunoPo }),
    _mk('R64', 22, C.joaoG,    C.guto),
    _mk('R64', 23, C.mCanete,  C.aRentes),
    _mk('R64', 24, C.salomao,  C.arthur),
    _mk('R64', 25, C.rodrigoB, C.fernSSeb),
    _mk('R64', 26, C.quina,    C.leoCurti),
    _mk('R64', 27, C.lucasCa,  C.rodrigoR),
    _mk('R64', 28, C.rogerio,  C.silvio),
    _mk('R64', 29, C.renan,    C.zuca),
    _mk('R64', 30, C.peruLE,   C.gustavoSc,{ isBye: true, winner: C.gustavoSc }),
    _mk('R64', 31, C.brunoDi,  C.yan),
    _mk('R64', 32, C.igor,     C.pepe),
  ];
  const cBracket = _buildRoundsAfterFirst(cR64, 'R64', 64);

  // ============ Cat C — 64 draw ============
  const D = {};
  // Top half
  D.ratinho   = P('c','ratinho','Ratinho');
  D.sharles   = P('c','sharles','Sharles');
  D.cleiton   = P('c','cleiton','Cleiton');
  D.lucasRam  = P('c','lucas-ramos','Lucas Ramos');
  D.alanR     = P('c','alan-r','Alan R.');
  D.humberto  = P('c','humberto','Humberto');
  D.marcoQ    = P('c','marco-q','Marco Q.');
  D.china     = P('c','china','China');
  D.leoPaes   = P('c','leo-paes','Léo Paes');
  D.baduca    = P('c','baduca','Baduca');
  D.brunoO    = P('c','bruno-o','Bruno O.');
  D.wando     = P('c','wando','Wando');
  D.fredi     = P('c','fredi','Fredi');
  D.joaoRJ    = P('c','joao-rj','João RJ');
  D.guilhermo = P('c','guilhermo','Guilhermo');
  D.paulo     = P('c','paulo','Paulo');
  D.edmilson  = P('c','edmilson','Edmilson');
  D.fagner    = P('c','fagner','Fagner');
  D.luisFelipe= P('c','luis-felipe','Luis Felipe');
  D.elaine    = P('c','elaine','Elaine');
  D.aPeru     = P('c','a-peru','A. Peru');
  D.romeu     = P('c','romeu','Romeu');
  D.andreR    = P('c','andre-r','André R.');
  D.rodrigoR  = P('c','rodrigo-rib','Rodrigo Rib.');
  D.lukas     = P('c','lukas','Lukas');
  D.rafaelE   = P('c','rafael-e','Rafael E.');
  D.rafaelGim = P('c','rafael-gim','Rafael Gim.');
  D.zuca      = P('c','zuca','Zuca');
  D.luisEd    = P('c','luis-eduardo','Luis Eduardo');
  D.miro      = P('c','miro','Miro');
  // Bottom half
  D.yan       = P('c','yan','Yan');
  D.lucasGal  = P('c','lucas-gallina','Lucas Gallina');
  D.robertinho= P('c','robertinho','Robertinho');
  D.rogerio   = P('c','rogerio','Rogério');
  D.aldecir   = P('c','aldecir','Aldecir');
  D.cristLodi = P('c','cristiano-lodi','Cristiano Lodi');
  D.julioG    = P('c','julio-guto','Júlio Guto');
  D.pedroH    = P('c','pedro-henrique','Pedro Henrique');
  D.caio      = P('c','caio','Caio');
  D.ton       = P('c','ton','Ton');
  D.alexJ     = P('c','alex-japa','Alex Japa');
  D.vitor     = P('c','vitor','Vitor');
  D.igor      = P('c','igor','Igor');
  D.ulisses   = P('c','ulisses','Ulisses');
  D.drDouglas = P('c','dr-douglas','Dr Douglas');
  D.rogester  = P('c','rogester','Rogester');
  D.fernRuf   = P('c','fernando-rufino','Fernando Rufino');
  D.danilo    = P('c','danilo','Danilo');
  D.rodrigoQ  = P('c','rodrigo-quina','Rodrigo Quina');
  D.joaoGoul  = P('c','joao-goulart','João Goulart');
  D.vinicius  = P('c','vinicius','Vinícius');
  D.nicolas   = P('c','nicolas','Nícolas');
  D.julioP    = P('c','julio-p','Júlio P.');
  D.jaco      = P('c','jaco','Jacó');
  D.pedroKok  = P('c','pedro-kokol','Pedro Kokol');
  D.giovani   = P('c','giovani','Giovani');
  D.joaoG     = P('c','joao-guilherme','João Guilherme');
  D.eden      = P('c','eden','Éden');
  D.juscelino = P('c','juscelino','Juscelino');
  D.salomao   = P('c','salomao','Salomão');

  const dR64 = [
    // Top half (matches 1-16)
    _mk('R64', 1,  null,        D.ratinho,    { isBye: true, winner: D.ratinho }),
    _mk('R64', 2,  D.sharles,   D.cleiton),
    _mk('R64', 3,  D.lucasRam,  D.alanR),
    _mk('R64', 4,  D.humberto,  D.marcoQ),
    _mk('R64', 5,  D.china,     D.leoPaes),
    _mk('R64', 6,  D.baduca,    D.brunoO),
    _mk('R64', 7,  D.wando,     D.fredi,      { scores: [[6,1],[6,3]], winner: D.wando }),
    _mk('R64', 8,  D.joaoRJ,    D.guilhermo,  { scores: [[6,1],[6,2]], winner: D.guilhermo }),
    _mk('R64', 9,  D.paulo,     D.edmilson),
    _mk('R64', 10, D.fagner,    D.luisFelipe),
    _mk('R64', 11, D.elaine,    D.aPeru),
    _mk('R64', 12, D.romeu,     D.andreR,     { scores: [[6,3],[6,1]], winner: D.andreR }),
    _mk('R64', 13, D.rodrigoR,  D.lukas),
    _mk('R64', 14, D.rafaelE,   D.rafaelGim),
    _mk('R64', 15, D.zuca,      D.luisEd),
    _mk('R64', 16, null,        D.miro,       { isBye: true, winner: D.miro }),
    // Bottom half (matches 17-32)
    _mk('R64', 17, D.yan,       D.lucasGal),
    _mk('R64', 18, D.robertinho,D.rogerio),
    _mk('R64', 19, D.aldecir,   D.cristLodi),
    _mk('R64', 20, D.julioG,    D.pedroH),
    _mk('R64', 21, D.caio,      D.ton),
    _mk('R64', 22, D.alexJ,     D.vitor,      { scores: [[7,6],[3,6],[10,8]], winner: D.vitor }),
    _mk('R64', 23, D.igor,      D.ulisses),
    _mk('R64', 24, D.drDouglas, D.rogester),
    _mk('R64', 25, null,        D.fernRuf,    { isBye: true, winner: D.fernRuf }),
    _mk('R64', 26, D.danilo,    D.rodrigoQ),
    _mk('R64', 27, D.joaoGoul,  D.vinicius),
    _mk('R64', 28, D.nicolas,   D.julioP),
    _mk('R64', 29, D.jaco,      D.pedroKok),
    _mk('R64', 30, D.giovani,   D.joaoG),
    _mk('R64', 31, D.eden,      D.juscelino,  { scores: [[6,3],[7,6]], winner: D.eden }),
    _mk('R64', 32, D.salomao,   null,         { isBye: true, winner: D.salomao }),
  ];
  const dBracket = _buildRoundsAfterFirst(dR64, 'R64', 64);

  return {
    players: Object.values(players),
    brackets: {
      'cat-a':  aBracket,
      'cat-5a': bBracket,
      'cat-5b': cBracket,
      'cat-c':  dBracket,
    },
  };
}

/* -------- State manager -------- */
const STORAGE_KEY = 'tennispoint-state-v404-tp2026';

function _seedFresh() {
  const fresh = JSON.parse(JSON.stringify(DEFAULT_STATE));
  const t26 = seedTournament2026();
  fresh.tournamentPlayers = t26.players;
  fresh.brackets = t26.brackets;
  return fresh;
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // merge com defaults para garantir novos campos
      const merged = {
        ..._seedFresh(),
        ...parsed,
        settings: { ...DEFAULT_STATE.settings, ...(parsed.settings || {}) },
      };
      // Garante que tournamentPlayers e brackets do seed sempre existam
      // (mesmo se localStorage tiver versão velha sem essas chaves)
      if (!merged.tournamentPlayers || !merged.tournamentPlayers.length) {
        const t26 = seedTournament2026();
        merged.tournamentPlayers = t26.players;
        merged.brackets = t26.brackets;
      }
      return merged;
    }
  } catch (e) { console.warn('State load failed', e); }
  return _seedFresh();
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
// getMember busca primeiro nos members do Supabase, depois no registry de tournament players
function getMember(id) {
  if (!id) return null;
  const m = STATE.members.find(x => x.id === id);
  if (m) return m;
  return (STATE.tournamentPlayers || []).find(x => x.id === id) || null;
}
function getCategory(id) { return STATE.categories.find(c => c.id === id); }
function getCourt(id) { return STATE.courts.find(c => c.id === id); }

function memberName(id) {
  if (!id) return 'BYE';
  const m = getMember(id);
  return m ? m.name : 'BYE';
}

function categoryMembers(catId) {
  // Combina members + tournament players da categoria, ambos visíveis na lista de inscritos
  const fromMembers = STATE.members.filter(m => m.category === catId && m.status === 'active');
  const fromTournament = (STATE.tournamentPlayers || [])
    .filter(p => p.categoryKey === catId)
    .map(p => ({ id: p.id, name: p.name, email: '', category: catId, status: 'active', matches: 0, wins: 0 }));
  return [...fromMembers, ...fromTournament];
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
  if (size >= 64) rounds.push('R64');
  if (size >= 32) rounds.push('R32');
  if (size >= 16) rounds.push('R16');
  if (size >= 8)  rounds.push('QF');
  if (size >= 4)  rounds.push('SF');
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
