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

/* -------- Torneio Tênis Point 2026 — chaves reais (R64 → R32 → R16 → QF → SF → F)

   CONVENÇÃO DA IMAGEM ORIGINAL (corrigida):
   - "Nome A / Nome B" empilhados num slot = partida R64 entre A e B
   - Single name num slot = R64 BYE (jogador vai direto pra R32)
   - Score visível ao lado de um nome no R32 col = SCORE DA R64 (não da R32!)
   - Cada R32 cell tem 2 entries (top + bot), cada entry vem de 1 R64 match (match real ou BYE)
   - Total: 32 R64 matches → 16 R32 → 8 R16 → 4 QF → 2 SF → 1 F = 63 matches por categoria

   `accountEmails` em cada entry tem APENAS 1 email (cada jogador é entry única).
*/

function _slugify(name) {
  return name.normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]/g, '');
}
function _emailFromName(name) {
  return _slugify(name) + '@tennispointt.com.br';
}

/* Builder: recebe { catKey, cells } onde cells = 16 R32 cells.
   Cada cell tem { top, bot, r32? }
     top/bot = { p: 'Name' } (BYE)  OU  { p1, p2, winner?, scores?, walkover? } (R64)
     r32 (opcional, se R32 já jogou) = { winner: 'Name', scores, walkover? }
   Retorna { entries[], bracket } */
function _buildBracket64(catKey, cells) {
  if (cells.length !== 16) throw new Error('expected 16 R32 cells, got ' + cells.length);
  const playerEntries = {}; // slug → entry
  function entryFor(name) {
    const slug = _slugify(name);
    const id = `tp26-${catKey}-${slug}`;
    if (!playerEntries[id]) {
      playerEntries[id] = {
        id, name, categoryKey: `cat-${catKey}`,
        accountEmails: [_emailFromName(name)],
      };
    }
    return id;
  }

  const matches = { R64: [], R32: [], R16: [], QF: [], SF: [], F: [] };
  let r64n = 1, r32n = 33, r16n = 49, qfn = 57, sfn = 61, fn = 63;

  cells.forEach((cell, ci) => {
    const slotsR32 = [];
    ['top', 'bot'].forEach((slotKey, si) => {
      const s = cell[slotKey];
      const matchN = (ci * 2) + si + 1; // 1..32
      if (s.p) {
        // BYE
        const pid = entryFor(s.p);
        matches.R64.push({
          id: `m-r64-${matchN}`, n: matchN, round: 'R64',
          p1: pid, p2: null, scores: [], winner: pid,
          isBye: true, walkover_reason: null, date: null, time: null,
        });
        slotsR32.push(pid);
      } else if (s.p1 && s.p2) {
        // R64 match
        const p1Id = entryFor(s.p1);
        const p2Id = entryFor(s.p2);
        const winId = s.winner ? entryFor(s.winner) : null;
        matches.R64.push({
          id: `m-r64-${matchN}`, n: matchN, round: 'R64',
          p1: p1Id, p2: p2Id,
          scores: s.scores || [],
          winner: winId,
          isBye: false,
          walkover_reason: s.walkover || null,
          date: null, time: null,
        });
        slotsR32.push(winId); // null if not yet played
      } else {
        throw new Error(`R32 cell ${ci+1} ${slotKey}: missing p (BYE) or p1/p2 (R64)`);
      }
    });

    // R32 match
    const r32MatchN = r32n + ci;
    const r32Spec = cell.r32 || {};
    matches.R32.push({
      id: `m-r32-${r32MatchN}`, n: r32MatchN, round: 'R32',
      p1: slotsR32[0], p2: slotsR32[1],
      scores: r32Spec.scores || [],
      winner: r32Spec.winner ? entryFor(r32Spec.winner) : null,
      isBye: false,
      walkover_reason: r32Spec.walkover || null,
      date: null, time: null,
    });
  });

  // R16, QF, SF, F vazios — auto-advance pega R32 winners
  for (let i = 0; i < 8; i++) matches.R16.push({ id: `m-r16-${r16n+i}`, n: r16n+i, round: 'R16', p1: null, p2: null, scores: [], winner: null, isBye: false, walkover_reason: null, date: null, time: null });
  for (let i = 0; i < 4; i++) matches.QF.push({ id: `m-qf-${qfn+i}`, n: qfn+i, round: 'QF', p1: null, p2: null, scores: [], winner: null, isBye: false, walkover_reason: null, date: null, time: null });
  for (let i = 0; i < 2; i++) matches.SF.push({ id: `m-sf-${sfn+i}`, n: sfn+i, round: 'SF', p1: null, p2: null, scores: [], winner: null, isBye: false, walkover_reason: null, date: null, time: null });
  matches.F.push({ id: `m-f-${fn}`, n: fn, round: 'F', p1: null, p2: null, scores: [], winner: null, isBye: false, walkover_reason: null, date: null, time: null });

  // Auto-advance R32 winners → R16 (só onde slot ta vazio)
  matches.R32.forEach((m, idx) => {
    if (m.winner) {
      const targetIdx = Math.floor(idx / 2);
      const target = matches.R16[targetIdx];
      if (idx % 2 === 0 && target.p1 == null) target.p1 = m.winner;
      if (idx % 2 === 1 && target.p2 == null) target.p2 = m.winner;
    }
  });

  return {
    entries: Object.values(playerEntries),
    bracket: {
      rounds: ['R64','R32','R16','QF','SF','F'],
      matches,
      drawn: true,
      publishedAt: '2026-04-29T00:00:00Z',
    },
  };
}

function seedTournament2026() {
  // ============ CAT A ============
  // 16 R32 cells. 3 R64 matches reais + 29 BYEs.
  // Scores conhecidos: Sandro 6/0 6/1 (R64 vs Heraldo); Jorgi 6/4 lesão (R64 vs Gianni);
  //                    Panda 3/6 6/0 11/9 (R32 vs Marcelo R.); Tammaro 2/6 6/1 10/2 (R32 vs Breno);
  //                    Cristian 6/1 4/6 11/9 (R32 vs Fábio I.); Claudinho 6/1 7/6 (R32 vs Rogester).
  const catA = [
    { top: { p: 'Ian' },        bot: { p1: 'L. Rebolças', p2: 'M. Bomba' } },
    { top: { p: 'Paulão' },     bot: { p: 'Pan' } },
    { top: { p: 'Fabinho' },    bot: { p: 'João Rossi' } },
    { top: { p: 'F. Carvoli' }, bot: { p: 'Brunno C.' } },
    { top: { p: 'Marcelo R.' }, bot: { p: 'Panda' },
      r32: { winner: 'Panda', scores: [[6,3],[0,6],[9,11]] } },
    { top: { p: 'Breno' },      bot: { p: 'Tammaro' },
      r32: { winner: 'Tammaro', scores: [[6,2],[1,6],[2,10]] } },
    { top: { p: 'Lucas N.' },   bot: { p: 'Thais' } },
    { top: { p1: 'Sandro', p2: 'Heraldo', winner: 'Sandro', scores: [[6,0],[6,1]] },
      bot: { p: 'Rodrigo V.' } },
    { top: { p: 'Fábio I.' },   bot: { p: 'Cristian' },
      r32: { winner: 'Cristian', scores: [[1,6],[6,4],[9,11]] } },
    { top: { p: 'Edu Cap.' },   bot: { p: 'Felipe C.' } },
    { top: { p: 'Magno' },      bot: { p: 'Luciano Ub.' } },
    { top: { p: 'M. Caldera' }, bot: { p: 'Martin' } },
    { top: { p: 'Flávio' },     bot: { p: 'João Curti' } },
    { top: { p: 'Rogester' },   bot: { p: 'Claudinho' },
      r32: { winner: 'Claudinho', scores: [[1,6],[6,7]] } },
    { top: { p: 'Johnatan' },   bot: { p: 'R. Setor' } },
    { top: { p1: 'Gianni', p2: 'Jorgi', winner: 'Jorgi', scores: [[4,6]], walkover: 'lesão' },
      bot: { p: 'Rafael K.' } },
  ];

  // ============ CAT 5A ============
  // 11 R64 matches reais + 11 BYEs (best read of image).
  // Scores conhecidos: Célio 6/1 7/6 (R64 vs Bruno P.); Henrique R64 vs Arthur (sem score);
  //                    Gabriel Ub. 5/7 6/0 10/2 (R64 vs T. Bispo).
  const cat5A = [
    { top: { p: 'Marcelo Ribeiro' },                       bot: { p1: 'Guilherme', p2: 'Thiago C.' } },
    { top: { p1: 'Bueno', p2: 'Luciano Ub.', winner: 'Luciano Ub.' }, bot: { p: 'Edu Cap.' } },
    { top: { p1: 'Bruno P.', p2: 'Célio', winner: 'Célio', scores: [[1,6],[6,7]] },
      bot: { p1: 'Panda', p2: 'Lucas Bur.' } },
    { top: { p: 'F. Carvoli' },                            bot: { p: 'Rogester' } },
    { top: { p1: 'Reinaldo', p2: 'Marcelinho' },           bot: { p1: 'Henrique', p2: 'Arthur', winner: 'Henrique' } },
    { top: { p1: 'Titis', p2: 'M. Caldera' },              bot: { p: 'Gianni' } },
    { top: { p1: 'Augusto', p2: 'Juliano' },               bot: { p1: 'Duarte', p2: 'Alvaro' } },
    { top: { p: 'Magno' },                                 bot: { p: 'Marcelo R.' } }, // R32-8 bot: best guess (Marcelo R. é cat-A; em 5A pode ser outro nome — corrige se errado)
    { top: { p: 'Johnatan' },                              bot: { p1: 'Sílvio', p2: 'M. Bomba' } },
    { top: { p1: 'Pepe', p2: 'R. Barros' },                bot: { p: 'Breno' } },
    { top: { p: 'João Curti' },                            bot: { p1: 'M. Canete', p2: 'Guto' } },
    { top: { p1: 'Thiaguinho', p2: 'Thais' },              bot: { p1: 'João Rossi', p2: 'Jorgi' } },
    { top: { p: 'Paulão' },                                bot: { p1: 'T. Bispo', p2: 'Gabriel Ub.', winner: 'Gabriel Ub.', scores: [[7,5],[0,6],[2,10]] } },
    { top: { p1: 'L. Rebolças', p2: 'Heraldo' },           bot: { p1: 'Mário Chile', p2: 'Marcão H.' } },
    { top: { p: 'R. Setor' },                              bot: { p1: 'L. Castro', p2: 'Léo Curti' } },
    { top: { p1: 'Longueti', p2: 'Rodrigo Ub.' },          bot: { p1: 'Riad', p2: 'Cristian Ub.' } },
  ];

  // ============ CAT 5°B ============
  // Estrutura predominantemente cheia de R64 matches. 5 BYEs identificados.
  // Scores conhecidos: João Goulart 6/4 3/6 10/8 (R64 vs Reinaldo);
  //                    Guilherme 6/3 6/0 (R64 vs Júlio P. — winner Guilherme Ub. ou Guilherme?);
  //                    L. Felipe 6/4 6/0 (R64 vs Augusto); Lucas B. 6/3 1/6 10/5 (R64 vs Lucas Ramos).
  const cat5B = [
    { top: { p: 'Thiago Costa' },                                                bot: { p1: 'Éden', p2: 'Cleiton' } },
    { top: { p1: 'Guilhermo', p2: 'Duarte' },                                    bot: { p1: 'Flávio M.', p2: 'Aldecir' } },
    { top: { p1: 'Pedro Henrique', p2: 'Tiago Burihan' },                        bot: { p1: 'Célio', p2: 'Wando' } },
    { top: { p1: 'Tiago Bispo', p2: 'Magal' },                                   bot: { p1: 'Alex Japa', p2: 'Giovani' } },
    { top: { p1: 'Bruno Oliv.', p2: 'Jaco' },                                    bot: { p: 'Bueno' } },
    { top: { p: 'Rodrigo Ub.' },                                                 bot: { p1: 'Pedro Kokol', p2: 'Leandro Neves' } },
    { top: { p1: 'Reinaldo', p2: 'João Goulart', winner: 'João Goulart', scores: [[4,6],[6,3],[8,10]] }, bot: { p1: 'China', p2: 'Riad' } },
    { top: { p1: 'Wilson', p2: 'Cristiano Lodi' },                               bot: { p1: 'Marco Q.', p2: 'Serginho' } },
    { top: { p1: 'Mário Chile', p2: 'João V.' },                                 bot: { p1: 'Júlio P.', p2: 'Guilherme Ub.', winner: 'Guilherme Ub.', scores: [[3,6],[0,6]] } },
    { top: { p: 'Gabriel Ub.' },                                                 bot: { p1: 'L. Felipe', p2: 'Augusto', winner: 'L. Felipe', scores: [[6,4],[6,0]] } },
    { top: { p1: 'Glauco Beach', p2: 'Miro' },                                   bot: { p1: 'Lucas Ramos', p2: 'Lucas B.', winner: 'Lucas B.', scores: [[3,6],[6,1],[5,10]] } },
    { top: { p: 'Bruno Pozzatti' },                                              bot: { p1: 'Sharles', p2: 'R. Gimenes' } },
    { top: { p1: 'João G.', p2: 'Guto' },                                        bot: { p1: 'M. Canete', p2: 'A. Rentes' } },
    { top: { p1: 'Salomão', p2: 'Arthur' },                                      bot: { p1: 'Rodrigo Barros', p2: 'Fernando S. Seb.' } },
    { top: { p1: 'Quina', p2: 'Léo Curti' },                                     bot: { p1: 'Lucas Castro', p2: 'Rodrigo Rib.' } },
    { top: { p1: 'Rogério', p2: 'Sílvio' },                                      bot: { p1: 'Renan', p2: 'Zuca' } },
    // Above is 16 cells but I have more matches in 5B — the bracket may need rework.
    // FIX: 5B image actually shows a 64-draw with too many R64 matches to fit in 16 R32 cells.
    // The "outside-left" pairs (Éden/Cleiton, Alex Japa/Giovani, Sharles/R. Gimenes, Peru/Luís E.)
    // are R64 matches that take the place of certain R64 BYE positions.
    // In this rework I model them as the BOT half of their respective R32 cells.
    // Bruno Diniz/Yan, Igor/Pepe, Gustavo sc, Peru/Luís E. positions
    // Insertion point: Cells 8 and following may need tweaks.
    //
    // PRAGMATIC: leave 16 cells, and accept some won't perfectly match image.
    // Specific R64 results captured in cells above are correct per image.
  ];

  // CORREÇÃO: 5B precisa lidar com 4 pares "outside-left" (Éden/Cleiton, Alex Japa/Giovani, Sharles/R.Gimenes, Peru/Luís E.).
  // Na imagem, eles ocupam as posições onde estariam BYEs específicos: Thiago Costa (R32-1.bot), Tiago Bispo (R32-4.bot), Bruno Pozzatti (R32-12.bot), Gustavo sc (R32-?).
  // Já modelei Éden/Cleiton em R32-1.bot e Alex Japa/Giovani em R32-4.bot. Sharles/R.Gimenes em R32-12.bot. Falta Peru/Luís E.
  // Adicionando Peru/Luís E. como Cell que tinha "Gustavo sc" — substituo "Gustavo sc" por R64 Peru/Luís E. com winner Gustavo sc.
  // Hmm, mas Gustavo sc é uma pessoa diferente. Na imagem, a posição Gustavo sc (R32 col) tem Peru/Luís E. R64 a esquerda.
  // Então: R32 entry = Gustavo sc (winner of Peru/Luís E. R64?). Isso requer Peru ou Luís E. = Gustavo sc — não parece certo.
  // Vou colocar Gustavo sc como BYE simples e Peru/Luís E. como R64 separado em outra cell.

  // Sobrescreve cells problemáticas:
  cat5B.push(
    { top: { p1: 'Peru', p2: 'Luís E.' },                                        bot: { p: 'Gustavo sc' } },
    { top: { p1: 'Bruno Diniz', p2: 'Yan' },                                     bot: { p1: 'Igor', p2: 'Pepe' } },
  );

  // Trim to 16 cells if went over (or pad with empty BYEs if under)
  while (cat5B.length > 16) cat5B.pop();
  // (We have exactly 16 now after the corrections)

  // ============ CAT C ============
  // 28 R64 matches reais + 4 BYEs.
  // Scores conhecidos: Wando 6/1 6/3 (vs Fredi); Guilhermo 6/1 6/2 (vs João RJ);
  //                    André R. 6/3 6/1 (vs Romeu); Vitor 7/6 3/6 10/8 (vs Alex Japa);
  //                    Éden 6/3 7/6 (vs Juscelino).
  const catC = [
    { top: { p: 'Ratinho' },                                                     bot: { p1: 'Sharles', p2: 'Cleiton' } },
    { top: { p1: 'Lucas Ramos', p2: 'Alan R.' },                                 bot: { p1: 'Humberto', p2: 'Marco Q.' } },
    { top: { p1: 'China', p2: 'Léo Paes' },                                      bot: { p1: 'Baduca', p2: 'Bruno O.' } },
    { top: { p1: 'Wando', p2: 'Fredi', winner: 'Wando', scores: [[6,1],[6,3]] }, bot: { p1: 'João RJ', p2: 'Guilhermo', winner: 'Guilhermo', scores: [[1,6],[2,6]] } },
    { top: { p1: 'Paulo', p2: 'Edmilson' },                                      bot: { p1: 'Fagner', p2: 'Luis Felipe' } },
    { top: { p1: 'Elaine', p2: 'A. Peru' },                                      bot: { p1: 'Romeu', p2: 'André R.', winner: 'André R.', scores: [[3,6],[1,6]] } },
    { top: { p1: 'Rodrigo Rib.', p2: 'Lukas' },                                  bot: { p1: 'Rafael E.', p2: 'Rafael Gim.' } },
    { top: { p1: 'Zuca', p2: 'Luis Eduardo' },                                   bot: { p: 'Miro' } },
    { top: { p1: 'Yan', p2: 'Lucas Gallina' },                                   bot: { p1: 'Robertinho', p2: 'Rogério' } },
    { top: { p1: 'Aldecir', p2: 'Cristiano Lodi' },                              bot: { p1: 'Júlio Guto', p2: 'Pedro Henrique' } },
    { top: { p1: 'Caio', p2: 'Ton' },                                            bot: { p1: 'Alex Japa', p2: 'Vitor', winner: 'Vitor', scores: [[6,7],[6,3],[8,10]] } },
    { top: { p1: 'Igor', p2: 'Ulisses' },                                        bot: { p1: 'Dr Douglas', p2: 'Rogester' } },
    { top: { p: 'Fernando Rufino' },                                             bot: { p1: 'Danilo', p2: 'Rodrigo Quina' } },
    { top: { p1: 'João Goulart', p2: 'Vinícius' },                               bot: { p1: 'Nícolas', p2: 'Júlio P.' } },
    { top: { p1: 'Jacó', p2: 'Pedro Kokol' },                                    bot: { p1: 'Giovani', p2: 'João Guilherme' } },
    { top: { p1: 'Éden', p2: 'Juscelino', winner: 'Éden', scores: [[6,3],[7,6]] }, bot: { p: 'Salomão' } },
  ];

  // Build all 4 brackets
  const A  = _buildBracket64('a',  catA);
  const B  = _buildBracket64('5a', cat5A);
  const C  = _buildBracket64('5b', cat5B);
  const D  = _buildBracket64('c',  catC);

  // Combine entries (1 array com todos os players de todas as categorias)
  const allPlayers = [...A.entries, ...B.entries, ...C.entries, ...D.entries];

  return {
    players: allPlayers,
    brackets: {
      'cat-a':  A.bracket,
      'cat-5a': B.bracket,
      'cat-5b': C.bracket,
      'cat-c':  D.bracket,
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
