/* ==================================================
   TENNIS POINT — Main App v4.0 (Supabase)
   ================================================== */

let currentScreen = 'home';
let currentTournamentTab = 'chave';
let currentBracketCategory = 'cat-5a';
let currentDrawCategory = null;
let drawState = { players: [], seeds: [] };
let bracketEditMode = false;          // toggle global modo edição de chave (admin)
let _realtimeBracketChannel = null;   // subscription ativa (Realtime brackets)
let _realtimeNotifChannel   = null;   // subscription de notificações
let _bracketSaveTimer = null;         // debounce do auto-save (drag-and-drop)
let _bracketSavePending = null;       // promessa do save em curso (evita corrida)

/* -------- Init -------- */
document.addEventListener('DOMContentLoaded', async () => {
  applyTheme();
  applySettings();
  bindLogin();
  bindAppShell();
  await checkSession();
});

async function checkSession() {
  const { data: { session } } = await TP.sb.auth.getSession();
  if (session) {
    await loadUserAndShowApp();
  } else {
    document.getElementById('screen-login').classList.add('active');
  }
}

/* -------- Theme & Settings -------- */
function applyTheme() {
  const theme = STATE.settings.theme;
  document.documentElement.setAttribute('data-theme', theme);
}

function applySettings() {
  const root = document.documentElement;
  const s = STATE.settings;
  if (s.brandColor) {
    root.style.setProperty('--brand', s.brandColor);
    root.style.setProperty('--brand-dark', shadeColor(s.brandColor, -15));
  }
  applyTheme();
}

function shadeColor(color, percent) {
  let R = parseInt(color.substring(1,3),16);
  let G = parseInt(color.substring(3,5),16);
  let B = parseInt(color.substring(5,7),16);
  R = Math.max(0, Math.min(255, R + Math.floor(R * percent / 100)));
  G = Math.max(0, Math.min(255, G + Math.floor(G * percent / 100)));
  B = Math.max(0, Math.min(255, B + Math.floor(B * percent / 100)));
  return '#' + R.toString(16).padStart(2,'0') + G.toString(16).padStart(2,'0') + B.toString(16).padStart(2,'0');
}

/* -------- Auth / Login -------- */
function bindLogin() {
  // Esconde o toggle de role (não precisamos mais disso com Supabase Auth)
  const roleToggle = document.querySelector('.role-toggle');
  if (roleToggle) roleToggle.style.display = 'none';

  document.getElementById('btn-login').addEventListener('click', async () => {
    const email    = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    if (!email || !password) { toast('Preencha e-mail e senha', 'error'); return; }

    const btn = document.getElementById('btn-login');
    btn.textContent = 'Entrando...';
    btn.disabled = true;

    try {
      const { error } = await TP.sb.auth.signInWithPassword({ email, password });

      if (error) {
        // Conta não existe → oferece cadastro
        if (error.message.includes('Invalid login') || error.message.includes('invalid_credentials')) {
          btn.textContent = 'Entrar';
          btn.disabled = false;
          openModal({
            title: '👤 Criar conta',
            body: `
              <p class="muted" style="font-size:14px;margin-bottom:12px">Conta não encontrada para <strong>${email}</strong>. Quer se cadastrar?</p>
              <div class="field"><label>Seu nome completo</label><input id="signup-name" placeholder="Nome Sobrenome"></div>
            `,
            actions: [
              { label: 'Cancelar', class: 'btn-secondary', onClick: closeModal },
              { label: 'Criar conta', class: 'btn-primary', onClick: async () => {
                const name = document.getElementById('signup-name').value.trim();
                if (!name) { toast('Informe seu nome', 'error'); return; }
                closeModal();
                await doSignUp(email, password, name);
              }},
            ],
          });
        } else {
          toast('Senha incorreta', 'error');
          btn.textContent = 'Entrar';
          btn.disabled = false;
        }
        return;
      }

      await loadUserAndShowApp();
    } catch (e) {
      toast('Erro de conexão', 'error');
      btn.textContent = 'Entrar';
      btn.disabled = false;
    }
  });

  // Enter no campo de senha faz login
  document.getElementById('login-password').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('btn-login').click();
  });

  document.querySelectorAll('.btn-social').forEach(b => {
    b.addEventListener('click', () => toast('Login social em breve', 'info'));
  });
}

async function doSignUp(email, password, name) {
  try {
    const { error } = await TP.sb.auth.signUp({
      email, password,
      options: { data: { name } }
    });
    if (error) { toast('Erro no cadastro: ' + error.message, 'error'); return; }
    toast('Conta criada! Verifique seu e-mail para confirmar.', 'success');
  } catch (e) {
    toast('Erro ao criar conta', 'error');
  }
}

async function loadUserAndShowApp() {
  try {
    const user = await TP.Auth.getUser();
    if (!user) return;

    // Popula STATE.user com dados do Supabase
    STATE.user = {
      id:       user.id,
      email:    user.email,
      name:     user.profile?.name || user.email,
      role:     user.profile?.role || 'member',
      category: user.profile?.category_id || null,
      phone:    user.profile?.phone || null,
      bio:      user.profile?.bio || null,
    };

    // Carrega dados globais do banco
    await loadAppData();

    // Liga accountEmails: descobre em quais slots/categorias o usuário aparece.
    // Usado pra highlight "você está aqui" e aba "Minhas categorias".
    const myEmail = (STATE.user.email || '').toLowerCase();
    STATE.user.tournamentSlots = (STATE.tournamentPlayers || [])
      .filter(p => (p.accountEmails || []).some(e => e.toLowerCase() === myEmail))
      .map(p => ({ id: p.id, name: p.name, categoryKey: p.categoryKey }));
    STATE.user.tournamentCategoryIds = [
      ...new Set(STATE.user.tournamentSlots.map(s => s.categoryKey)),
    ];

    showApp();
  } catch (e) {
    console.error('Erro ao carregar usuário:', e);
    toast('Erro ao carregar dados', 'error');
  }
}

async function loadAppData() {
  try {
    const [categories, courts, members] = await Promise.all([
      TP.Categories.list(),
      TP.Courts.list(),
      TP.Profiles.list(),
    ]);

    if (categories?.length) STATE.categories = categories.map(c => ({
      id: c.id, name: c.name, icon: c.icon || '🎾', color: '--av-blue'
    }));

    if (courts?.length) STATE.courts = courts.map(c => ({
      id: c.id, name: c.name, surface: c.surface || 'Saibro'
    }));

    if (members?.length) STATE.members = members.map(m => ({
      id:       m.id,
      name:     m.name,
      email:    m.email,
      category: m.category_id,
      status:   'active',
      matches:  0,
      wins:     0,
    }));

    // Carrega torneio ativo e brackets
    const tournament = await TP.Tournaments.active();
    if (tournament) {
      STATE.settings.tournamentName      = tournament.name;
      STATE.settings.tournamentDateStart = tournament.start_date || STATE.settings.tournamentDateStart;
      STATE.settings.tournamentDateEnd   = tournament.end_date   || STATE.settings.tournamentDateEnd;
      STATE._activeTournamentId = tournament.id;

      const brackets = await TP.Brackets.byTournament(tournament.id);
      // Reset pra evitar duplicar entries entre logins na mesma sessão
      const allEntries = [];
      brackets.forEach(b => {
        if (b.data) {
          STATE.brackets[b.category_id] = b.data;
          // Achata entries de TODAS as categorias num único array tournamentPlayers,
          // com categoryKey vindo do category_id da bracket (no fallback de entries
          // legadas que não tenham o campo).
          (b.data.entries || []).forEach(e => {
            allEntries.push({
              id:            e.id,
              name:          e.name,
              categoryKey:   e.categoryKey || b.category_id,
              accountEmails: e.accountEmails || [],
            });
          });
        }
      });
      // Substitui (ao invés de concatenar) pra ficar canônico em cada login
      STATE.tournamentPlayers = allEntries;
    }

    // Carrega notificações
    const notifs = await TP.Notifications.mine();
    if (notifs?.length) {
      STATE.notifications = notifs.map(n => ({
        id:   n.id,
        icon: n.type === 'match' ? '🏆' : n.type === 'booking' ? '📅' : '📣',
        title: n.title + (n.body ? ` — ${n.body}` : ''),
        time: timeAgo(n.created_at),
        read: n.read,
      }));
    }

    // Carrega reservas do dia
    const today = new Date().toISOString().split('T')[0];
    const bookings = await TP.Bookings.byDate(today);
    if (bookings?.length) {
      STATE.schedules = bookings.map(b => ({
        id:      b.id,
        courtId: b.court_id,
        date:    today,
        start:   b.start_at ? new Date(b.start_at).toLocaleTimeString('pt-BR', {hour:'2-digit',minute:'2-digit'}) : '',
        end:     b.end_at   ? new Date(b.end_at).toLocaleTimeString('pt-BR', {hour:'2-digit',minute:'2-digit'}) : '',
        type:    b.notes || 'Reserva',
        spots:   1,
        taken:   1,
      }));
    }

  } catch (e) {
    console.warn('loadAppData error:', e);
  }
}

function timeAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'agora';
  if (m < 60) return `há ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `há ${h} hora${h>1?'s':''}`;
  return `há ${Math.floor(h/24)} dia${Math.floor(h/24)>1?'s':''}`;
}

function showApp() {
  document.getElementById('screen-login').classList.remove('active');
  document.getElementById('app-shell').classList.remove('hidden');
  updateDrawerUser();
  // Subscreve Realtime depois que loadAppData populou _activeTournamentId.
  // Não bloqueante: se falhar (RLS, conexão), o app continua funcional via polling manual.
  subscribeRealtime();
  navigate(STATE.user.role === 'admin' ? 'admin' : 'home');
}

async function logout() {
  unsubscribeRealtime();
  await TP.Auth.signOut();
  STATE.user = null;
  document.getElementById('app-shell').classList.add('hidden');
  document.getElementById('screen-login').classList.add('active');
  document.getElementById('login-email').value = '';
  document.getElementById('login-password').value = '';
  document.getElementById('btn-login').textContent = 'Entrar';
  document.getElementById('btn-login').disabled = false;
  closeDrawer();
}

/* Realtime: quando o admin atualiza scores/brackets de qualquer dispositivo,
   todos os clientes conectados ao torneio recebem o novo `data` JSONB e
   re-renderizam automaticamente. Throttle implícito via re-render só na tela
   atual; navegação preserva STATE atualizado. */
function subscribeRealtime() {
  unsubscribeRealtime(); // garante idempotência
  if (!STATE._activeTournamentId) return;

  try {
    _realtimeBracketChannel = TP.Realtime.subscribeBrackets(
      STATE._activeTournamentId,
      (payload) => {
        // payload.new tem a row inteira; data JSONB já vem parseado
        const row = payload.new || payload.old;
        if (!row || !row.category_id) return;
        if (payload.eventType === 'DELETE') {
          delete STATE.brackets[row.category_id];
        } else if (row.data) {
          STATE.brackets[row.category_id] = row.data;
        }
        // Se a tela atual é o torneio mostrando a categoria afetada, re-renderiza
        const isViewingThisCategory = currentScreen === 'tournament'
          && currentTournamentTab === 'chave'
          && currentBracketCategory === row.category_id;
        if (isViewingThisCategory) {
          navigate('tournament');
          // Toast discreto pra usuário saber que dado atualizou em background
          if (payload.eventType !== 'DELETE') {
            toast('Chave atualizada em tempo real', 'info');
          }
        }
      }
    );

    // Notificações em tempo real pro usuário logado (badge no sino atualiza)
    if (STATE.user?.id) {
      _realtimeNotifChannel = TP.Realtime.subscribeNotifications(
        STATE.user.id,
        (payload) => {
          const n = payload.new;
          if (!n) return;
          STATE.notifications.unshift({
            id: n.id,
            icon: n.type === 'match' ? '🏆' : n.type === 'booking' ? '📅' : '📣',
            title: n.title + (n.body ? ` — ${n.body}` : ''),
            time: 'agora',
            read: false,
          });
          // Atualiza badge do sino se existir
          const badge = document.getElementById('notif-count');
          if (badge) {
            const unread = STATE.notifications.filter(x => !x.read).length;
            badge.textContent = unread;
            badge.style.display = unread > 0 ? '' : 'none';
          }
        }
      );
    }
  } catch (e) {
    console.warn('Realtime subscribe failed:', e);
  }
}

function unsubscribeRealtime() {
  if (_realtimeBracketChannel) {
    TP.Realtime.unsubscribe(_realtimeBracketChannel);
    _realtimeBracketChannel = null;
  }
  if (_realtimeNotifChannel) {
    TP.Realtime.unsubscribe(_realtimeNotifChannel);
    _realtimeNotifChannel = null;
  }
}

function updateDrawerUser() {
  if (!STATE.user) return;
  const isAdmin = STATE.user.role === 'admin';
  const myCats = STATE.user.tournamentCategoryIds || [];
  const myCatNames = myCats.map(id => getCategory(id)?.name).filter(Boolean);

  document.getElementById('drawer-avatar').textContent = initials(STATE.user.name);
  // Nome com badge ADMIN inline pra Johnatan saber visualmente que tem write
  document.getElementById('drawer-name').innerHTML = isAdmin
    ? `${STATE.user.name} <span class="admin-badge">ADMIN</span>`
    : STATE.user.name;

  // Linha de categoria: prefere mostrar todas as categorias do torneio, fallback pro role
  let catLine;
  if (myCatNames.length) {
    catLine = `🎾 ${myCatNames.join(' · ')}`;
  } else if (isAdmin) {
    catLine = `🔑 Administrador`;
  } else {
    const cat = STATE.user.category ? getCategory(STATE.user.category) : null;
    catLine = cat ? `${cat.icon} Categoria ${cat.name}` : `🎾 Membro`;
  }
  document.getElementById('drawer-cat').textContent = catLine;
}

/* -------- App Shell -------- */
function bindAppShell() {
  document.getElementById('btn-menu').addEventListener('click', openDrawer);
  document.getElementById('drawer-overlay').addEventListener('click', closeDrawer);
  document.getElementById('btn-notif').addEventListener('click', () => navigate('notifications'));
  document.getElementById('btn-logout').addEventListener('click', logout);

  document.querySelectorAll('.drawer-link[data-screen]').forEach(l => {
    l.addEventListener('click', () => { navigate(l.dataset.screen); closeDrawer(); });
  });

  document.querySelectorAll('.nav-btn').forEach(b => {
    b.addEventListener('click', () => navigate(b.dataset.screen));
  });

  document.getElementById('modal-overlay').addEventListener('click', closeModal);
}

function openDrawer() {
  document.getElementById('drawer').classList.add('open');
  document.getElementById('drawer-overlay').classList.add('open');
}
function closeDrawer() {
  document.getElementById('drawer').classList.remove('open');
  document.getElementById('drawer-overlay').classList.remove('open');
}

/* -------- Navigation -------- */
function navigate(screen) {
  currentScreen = screen;

  document.querySelectorAll('.nav-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.screen === screen);
  });

  const unread = STATE.notifications.filter(n => !n.read).length;
  const badge = document.getElementById('notif-count');
  badge.textContent = unread;
  badge.style.display = unread ? '' : 'none';

  const main = document.getElementById('main-content');
  switch (screen) {
    case 'home':             main.innerHTML = renderHome();            bindHome();            break;
    case 'tournament':       main.innerHTML = renderTournament();      bindTournament();      break;
    case 'play':             main.innerHTML = renderPlay();                                   break;
    case 'courts':           main.innerHTML = renderCourts();          bindCourts();          break;
    case 'profile':          main.innerHTML = renderProfile();         bindProfile();         break;
    case 'admin':            main.innerHTML = renderAdmin();           bindAdmin();           break;
    case 'admin-tournament': main.innerHTML = renderAdminTournament(); bindAdminTournament(); break;
    case 'admin-members':    main.innerHTML = renderAdminMembers();    bindAdminMembers();    break;
    case 'admin-courts':     main.innerHTML = renderAdminCourts();     bindAdminCourts();     break;
    case 'admin-draw':       main.innerHTML = renderAdminDraw();       bindAdminDraw();       break;
    case 'admin-categories': main.innerHTML = renderAdminCategories(); bindAdminCategories(); break;
    case 'admin-players':    main.innerHTML = renderAdminPlayers();    bindAdminPlayers();    break;
    case 'admin-bracket-edit':
      // Atalho: ativa edit mode e navega pro bracket
      bracketEditMode = true;
      currentTournamentTab = 'chave';
      navigate('tournament');
      return;
    case 'settings':         main.innerHTML = renderSettings();        bindSettings();        break;
    case 'notifications':    main.innerHTML = renderNotifications();   markNotifsRead();      break;
    case 'help':             main.innerHTML = renderHelp();                                   break;
    default:                 main.innerHTML = renderHome();            bindHome();
  }

  window.scrollTo(0, 0);
}

/* -------- HOME -------- */
function renderHome() {
  if (STATE.user.role === 'admin') return renderAdmin();
  const s = STATE.settings;
  return `
    <div class="welcome-card">
      <h2>Olá, ${STATE.user.name}! 👋</h2>
      <p>Bem-vindo ao Tennis Point. Veja seu próximo jogo e acompanhe o torneio!</p>
    </div>

    <div class="tournament-card">
      <div class="ttag">🏆 Torneio em andamento</div>
      <h3>${s.tournamentName.toUpperCase()}</h3>
      <div class="tmeta">
        <span>📅 ${shortDate(s.tournamentDateStart)} – ${shortDate(s.tournamentDateEnd)}</span>
        <span>📍 ${s.tournamentVenue}</span>
      </div>
      <div class="tcats">
        ${STATE.categories.map(c => `<span class="chip">${c.name}</span>`).join('')}
      </div>
      <div class="tcta" data-action="open-tournament">Ver chaves →</div>
    </div>

    <div class="section-title">Seu próximo jogo</div>
    ${renderNextMatch()}

    <div class="section-title">Últimos resultados <span class="section-link" data-action="all-results">Ver todos →</span></div>
    ${renderRecentResults()}

    <div class="section-title">Quadras hoje <span class="section-link" data-action="goto-courts">Ver calendário →</span></div>
    ${renderCourtsToday()}

    ${s.showSponsors ? `
      <div class="section-title mt-lg">Patrocinadores oficiais</div>
      <div class="card text-center" style="padding:24px;color:var(--text-muted);font-size:13px">
        Espaço reservado para logos dos patrocinadores
      </div>
    ` : ''}
  `;
}

function bindHome() {
  document.querySelectorAll('[data-action]').forEach(el => {
    el.addEventListener('click', () => {
      const action = el.dataset.action;
      if (action === 'open-tournament') navigate('tournament');
      if (action === 'goto-courts')    navigate('courts');
      if (action === 'all-results')    navigate('profile');
      if (action === 'confirm-presence') toast('Presença confirmada! ✅', 'success');
    });
  });
}

function shortDate(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

function renderNextMatch() {
  const myCat = STATE.user.category;
  if (!myCat) return '<div class="card text-center muted">Nenhum jogo agendado</div>';
  const cat = getCategory(myCat);
  return `
    <div class="match-card">
      <div class="mhead">
        <span>Categoria ${cat?.name || '—'} — Rodada 1</span>
        <span class="badge green">✅ Confirmado</span>
      </div>
      <div class="mvs">
        <div class="mplayer">
          <div class="avatar lg" style="background:var(--brand);color:var(--brand-text)">${initials(STATE.user.name)}</div>
          <div class="pname">${STATE.user.name}</div>
        </div>
        <div class="text-center">
          <div class="mvs-label">VS</div>
          <div class="subtle mt-sm">A definir</div>
        </div>
        <div class="mplayer">
          <div class="avatar lg" style="background:var(--av-gray)">?</div>
          <div class="pname">Adversário</div>
        </div>
      </div>
      <div class="mfoot">
        <button class="b-primary" data-action="confirm-presence">Confirmar presença</button>
      </div>
    </div>
  `;
}

function renderRecentResults() {
  return '<div class="card text-center muted" style="padding:20px;font-size:14px">Nenhum resultado ainda.</div>';
}

function renderCourtsToday() {
  if (!STATE.schedules.length) return '<div class="card text-center muted" style="padding:20px;font-size:14px">Sem reservas hoje.</div>';
  return STATE.schedules.slice(0, 2).map(s => {
    const c = getCourt(s.courtId);
    return `
      <div class="court-row">
        <div>
          <div class="ctitle">${c ? c.name.split('—')[0].trim() : 'Quadra'}</div>
          <div class="ctime">${s.start} – ${s.end}</div>
        </div>
        <button class="btn-secondary" style="padding:8px 14px;font-size:13px" data-action="goto-courts">Reservar</button>
      </div>
    `;
  }).join('');
}

/* -------- TOURNAMENT -------- */
function renderTournament() {
  const s = STATE.settings;
  return `
    <div class="bracket-page">
      <div class="bracket-header">
        <div class="bracket-tabs">
          <button class="bracket-tab back-btn" data-action="back-home">‹ Ver Torneio</button>
          <button class="bracket-tab ${currentTournamentTab==='sobre'?'active':''}" data-tab="sobre">Sobre</button>
          <button class="bracket-tab ${currentTournamentTab==='chave'?'active':''}" data-tab="chave">Chave</button>
          <button class="bracket-tab ${currentTournamentTab==='horarios'?'active':''}" data-tab="horarios">Horários</button>
          <button class="bracket-tab ${currentTournamentTab==='jogos'?'active':''}" data-tab="jogos">Jogos</button>
          <button class="bracket-tab ${currentTournamentTab==='inscritos'?'active':''}" data-tab="inscritos">Inscritos</button>
        </div>
      </div>

      <div class="bracket-cat-chips">
        ${STATE.categories.map(c => `
          <button class="chip ${c.id === currentBracketCategory ? 'active' : ''}" data-cat="${c.id}">${c.icon} ${c.name}</button>
        `).join('')}
      </div>

      ${currentTournamentTab === 'sobre'    ? renderTournamentAbout() : ''}
      ${currentTournamentTab === 'chave'    ? `
        ${STATE.user?.role === 'admin' ? `
          <div class="edit-mode-toggle">
            <label class="switch-row">
              <span>✏️ Modo Edição — arraste matches livremente, troque jogadores entre slots</span>
              <span class="switch ${bracketEditMode ? 'on' : ''}" data-toggle-edit-mode></span>
            </label>
            ${bracketEditMode ? `
              <div class="edit-mode-hint">
                <span class="emh-tip">💡 <b>Pegue na alça ⋮⋮</b> pra mover o match · <b>Arraste um jogador</b> pra trocar slot · Tudo é salvo automático.</span>
              </div>
            ` : ''}
          </div>
        ` : ''}
        <div class="bracket-scroll ${bracketEditMode ? 'edit-mode' : ''}" id="bracket-host"></div>
      ` : ''}
      ${currentTournamentTab === 'horarios' ? renderTournamentSchedule() : ''}
      ${currentTournamentTab === 'jogos'    ? renderTournamentGames() : ''}
      ${currentTournamentTab === 'inscritos'? renderTournamentPlayers(currentBracketCategory) : ''}
    </div>
  `;
}

function renderTournamentAbout() {
  const s = STATE.settings;
  return `
    <div style="padding:20px">
      <h2 style="font-family:var(--font-display);font-size:24px;font-weight:800;letter-spacing:-0.02em">${s.tournamentName}</h2>
      <p class="muted mt-sm">${shortDate(s.tournamentDateStart)} – ${shortDate(s.tournamentDateEnd)} · ${s.tournamentVenue}</p>
      <div class="card mt-md">
        <h3 style="font-family:var(--font-display);font-weight:700;margin-bottom:8px">Sobre o torneio</h3>
        <p class="muted" style="font-size:14px">Torneio oficial Tennis Point com ${STATE.categories.length} categorias e premiação para os campeões.</p>
      </div>
      <div class="stats-grid mt-md">
        <div class="stat-card"><div class="stat-num">${STATE.members.length}</div><div class="stat-lbl">Inscritos</div></div>
        <div class="stat-card"><div class="stat-num">${STATE.categories.length}</div><div class="stat-lbl">Categorias</div></div>
        <div class="stat-card"><div class="stat-num">${countMatches()}</div><div class="stat-lbl">Jogos</div></div>
        <div class="stat-card"><div class="stat-num">${STATE.courts.length}</div><div class="stat-lbl">Quadras</div></div>
      </div>
    </div>
  `;
}

function countMatches() {
  let n = 0;
  Object.values(STATE.brackets).forEach(br => {
    if (br && br.matches) Object.values(br.matches).forEach(arr => n += arr.length);
  });
  return n;
}

function renderTournamentSchedule() {
  const bracket = STATE.brackets[currentBracketCategory];
  if (!bracket) return '<div class="bracket-empty"><div class="be-icon">📅</div><h3>Sem horários</h3></div>';
  const allMatches = [];
  bracket.rounds.forEach(r => {
    bracket.matches[r].forEach(m => { if (m.date && m.time) allMatches.push(m); });
  });
  allMatches.sort((a,b) => (a.date+a.time).localeCompare(b.date+b.time));
  return `
    <div style="padding:16px">
      ${allMatches.length ? allMatches.map(m => `
        <div class="list-row">
          <div style="display:flex;flex-direction:column;align-items:center;width:50px">
            <div style="font-size:11px;color:var(--text-muted)">${ROUND_LABELS[m.round]}</div>
            <div style="font-weight:700;font-size:14px">${m.time}</div>
          </div>
          <div class="lr-info">
            <div class="lr-title">${memberName(m.p1)} vs ${memberName(m.p2)}</div>
            <div class="lr-meta">${fmtDateShort(m.date)}</div>
          </div>
          ${m.winner ? '<span class="badge green">✓ Encerrado</span>' : '<span class="badge amber">Agendado</span>'}
        </div>
      `).join('') : '<div class="empty-state">Nenhum jogo agendado.</div>'}
    </div>
  `;
}

function renderTournamentGames() { return renderTournamentSchedule(); }

function renderTournamentPlayers(catId) {
  const players = categoryMembers(catId);
  return `
    <div style="padding:16px">
      ${players.length ? players.map(p => `
        <div class="list-row">
          <div class="avatar lg" style="background:${avatarColor(p.name)}">${initials(p.name)}</div>
          <div class="lr-info">
            <div class="lr-title">${p.name}</div>
            <div class="lr-meta">${p.matches} jogos · ${p.wins} vitórias</div>
          </div>
          <span class="badge green">Ativo</span>
        </div>
      `).join('') : '<div class="empty-state">Nenhum inscrito ainda.</div>'}
    </div>
  `;
}

function bindTournament() {
  document.querySelectorAll('[data-action="back-home"]').forEach(b => {
    b.addEventListener('click', () => navigate('home'));
  });
  document.querySelectorAll('.bracket-tab[data-tab]').forEach(b => {
    b.addEventListener('click', () => { currentTournamentTab = b.dataset.tab; navigate('tournament'); });
  });
  document.querySelectorAll('.bracket-cat-chips .chip').forEach(b => {
    b.addEventListener('click', () => { currentBracketCategory = b.dataset.cat; navigate('tournament'); });
  });
  // Toggle Modo Edição (admin)
  document.querySelector('[data-toggle-edit-mode]')?.addEventListener('click', () => {
    bracketEditMode = !bracketEditMode;
    navigate('tournament');
  });
  if (currentTournamentTab === 'chave') {
    const host = document.getElementById('bracket-host');
    if (host) {
      renderBracket(STATE.brackets[currentBracketCategory], host);
      if (bracketEditMode && STATE.user?.role === 'admin') {
        bindBracketEditModeClicks();
        bindBracketFreeDrag(host);
        bindMatchReorder(host);
      } else {
        bindBracketAdminClicks();
      }
      bindBracketSortActions();
      bindBracketLayoutActions(host);
    }
  }
}

/* ===========================================================
   DRAG-LIVRE de matches (pointer events) — admin edit mode
   Permite mover qualquer match pra qualquer X,Y do canvas.
   Persiste em bracket.customPositions = { matchId: {x,y} }.
   =========================================================== */
function bindBracketFreeDrag(host) {
  if (!host || !STATE.user || STATE.user.role !== 'admin') return;
  const inner = host.querySelector('#bracket-inner');
  if (!inner) return;

  const handles = inner.querySelectorAll('.bk-drag-handle');
  handles.forEach(handle => {
    handle.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const card = handle.closest('.bk-match');
      if (!card) return;
      const matchId = card.dataset.matchId;
      const innerRect = inner.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      // offset do click dentro do card
      const offsetX = e.clientX - cardRect.left;
      const offsetY = e.clientY - cardRect.top;

      card.classList.add('is-dragging-free');
      card.style.zIndex = '999';
      handle.setPointerCapture(e.pointerId);

      let lastX = parseFloat(card.style.left) || 0;
      let lastY = parseFloat(card.style.top) || 0;

      const onMove = (ev) => {
        const innerRectNow = inner.getBoundingClientRect();
        let nx = ev.clientX - innerRectNow.left - offsetX + inner.scrollLeft;
        let ny = ev.clientY - innerRectNow.top - offsetY + inner.scrollTop;
        // snap to grid
        nx = Math.round(nx / 8) * 8;
        ny = Math.round(ny / 8) * 8;
        // clamp >= 0
        if (nx < 0) nx = 0;
        if (ny < 0) ny = 0;
        card.style.left = `${nx}px`;
        card.style.top = `${ny}px`;
        lastX = nx; lastY = ny;
        // redesenha conectores em tempo real (debounced via rAF)
        scheduleConnectorRedraw(host);
      };
      const onUp = (ev) => {
        handle.releasePointerCapture(e.pointerId);
        handle.removeEventListener('pointermove', onMove);
        handle.removeEventListener('pointerup', onUp);
        handle.removeEventListener('pointercancel', onUp);
        card.classList.remove('is-dragging-free');
        card.style.zIndex = '';
        card.classList.add('has-custom-pos');
        // Persiste a nova posição custom
        persistCustomPosition(matchId, lastX, lastY);
      };
      handle.addEventListener('pointermove', onMove);
      handle.addEventListener('pointerup', onUp);
      handle.addEventListener('pointercancel', onUp);
    });
  });
}

let _connectorRedrawScheduled = false;
function scheduleConnectorRedraw(host) {
  if (_connectorRedrawScheduled) return;
  _connectorRedrawScheduled = true;
  requestAnimationFrame(() => {
    _connectorRedrawScheduled = false;
    if (typeof window.tpRedrawConnectorsOnly === 'function') {
      window.tpRedrawConnectorsOnly(host);
    }
  });
}

/* Salva posição custom no STATE e dispara save debounced no Supabase */
function persistCustomPosition(matchId, x, y) {
  const catId = currentBracketCategory;
  const br = STATE.brackets[catId];
  if (!br) return;
  if (!br.customPositions) br.customPositions = {};
  br.customPositions[matchId] = { x, y };
  saveState();
  scheduleBracketSave(catId);
}

/* Auto-save debounced (450ms) — agrupa drags rápidos em uma única chamada */
function scheduleBracketSave(catId, opts = {}) {
  if (_bracketSaveTimer) clearTimeout(_bracketSaveTimer);
  const delay = opts.immediate ? 0 : 450;
  _bracketSaveTimer = setTimeout(async () => {
    _bracketSaveTimer = null;
    const br = STATE.brackets[catId];
    if (!br || !STATE._activeTournamentId) return;
    try {
      _bracketSavePending = TP.Brackets.updateData(STATE._activeTournamentId, catId, br);
      await _bracketSavePending;
      _bracketSavePending = null;
      if (!opts.silent) toastSavedFeedback();
    } catch (e) {
      _bracketSavePending = null;
      toast('⚠️ Erro ao salvar: ' + (e.message || 'falha'), 'error');
    }
  }, delay);
}

/* Toast discreto pra feedback de save (curto, canto) */
let _savedToastTimer = null;
function toastSavedFeedback() {
  // Procura toast-saved-mini existente, atualiza ou cria
  let pill = document.getElementById('bk-saved-pill');
  if (!pill) {
    pill = document.createElement('div');
    pill.id = 'bk-saved-pill';
    pill.className = 'bk-saved-pill';
    pill.innerHTML = '<span class="bsp-dot"></span> Salvo';
    document.body.appendChild(pill);
  }
  pill.classList.add('show');
  if (_savedToastTimer) clearTimeout(_savedToastTimer);
  _savedToastTimer = setTimeout(() => pill.classList.remove('show'), 1400);
}

/* Reorder de matches inteiros: drag de UM match (handle) sobre OUTRO match
   da mesma round → swap completo (id mantido, conteúdo trocado). */
function bindMatchReorder(host) {
  if (!host || !STATE.user || STATE.user.role !== 'admin') return;
  const inner = host.querySelector('#bracket-inner');
  if (!inner) return;

  // Durante drag livre, se o card ficar HOVER em outro card da mesma round,
  // mostra indicador. No mouseup, se sobre outro card → swap.
  // Implementação simples: tracking via pointer events globais em cada card.
  const cards = inner.querySelectorAll('.bk-match');
  cards.forEach(card => {
    card.addEventListener('pointerenter', () => {
      // Se algum outro card está com .is-dragging-free, marca este como drop target
      const dragging = inner.querySelector('.bk-match.is-dragging-free');
      if (dragging && dragging !== card && dragging.dataset.round === card.dataset.round) {
        card.classList.add('reorder-target');
      }
    });
    card.addEventListener('pointerleave', () => {
      card.classList.remove('reorder-target');
    });
  });

  // Listener global no inner: se pointerup em cima de um reorder-target → swap
  inner.addEventListener('pointerup', (e) => {
    const dragging = inner.querySelector('.bk-match.is-dragging-free');
    const target = inner.querySelector('.bk-match.reorder-target');
    if (dragging && target && dragging !== target) {
      const aId = dragging.dataset.matchId;
      const bId = target.dataset.matchId;
      target.classList.remove('reorder-target');
      // Mostra modal de confirmação
      confirmMatchSwap(aId, bId);
    }
    // Limpa qualquer reorder-target solto
    inner.querySelectorAll('.bk-match.reorder-target').forEach(c => c.classList.remove('reorder-target'));
  }, true);
}

/* Confirma e executa swap de DOIS matches (mesmo round). Troca conteúdo
   inteiro: p1, p2, scores, winner, isBye, walkover_reason, date, time. */
function confirmMatchSwap(aId, bId) {
  const catId = currentBracketCategory;
  const br = STATE.brackets[catId];
  if (!br) return;
  const a = findMatchInBracket(catId, aId);
  const b = findMatchInBracket(catId, bId);
  if (!a || !b) return;
  if (a.round !== b.round) {
    toast('Só dá pra trocar matches da mesma rodada', 'info');
    return;
  }
  openModal({
    title: '🔄 Trocar matches?',
    sub: `${a.round}: #${a.match.n} ↔ #${b.match.n}`,
    body: `
      <p class="muted" style="font-size:14px;margin-bottom:8px">Vai trocar o conteúdo dos dois matches (jogadores, scores, datas).</p>
      <p class="muted" style="font-size:13px"><b>#${a.match.n}:</b> ${memberName(a.match.p1) || '(vazio)'} vs ${memberName(a.match.p2) || '(vazio)'}</p>
      <p class="muted" style="font-size:13px"><b>#${b.match.n}:</b> ${memberName(b.match.p1) || '(vazio)'} vs ${memberName(b.match.p2) || '(vazio)'}</p>
    `,
    actions: [
      { label: 'Cancelar', class: 'btn-secondary', onClick: closeModal },
      { label: 'Trocar', class: 'btn-primary', onClick: () => doMatchSwap(catId, aId, bId) },
    ],
  });
}

async function doMatchSwap(catId, aId, bId) {
  const br = STATE.brackets[catId];
  const a = findMatchInBracket(catId, aId);
  const b = findMatchInBracket(catId, bId);
  if (!a || !b) { closeModal(); return; }
  // Swap dos campos (mantém id e n)
  const fields = ['p1','p2','scores','winner','isBye','walkover_reason','date','time'];
  fields.forEach(f => {
    const tmp = a.match[f];
    a.match[f] = b.match[f];
    b.match[f] = tmp;
  });
  saveState();
  closeModal();
  scheduleBracketSave(catId, { immediate: true });
  toast('Matches trocados ✅', 'success');
  navigate('tournament');
}

/* Reset de layout: apaga customPositions e volta pro auto-layout */
function bindBracketLayoutActions(host) {
  document.querySelectorAll('[data-action="reset-layout"]').forEach(b => {
    b.addEventListener('click', () => {
      const cat = STATE.categories.find(c => c.id === currentBracketCategory);
      const ok = confirm(`Resetar o layout custom da chave de ${cat?.name || 'esta categoria'}? As posições arrastadas voltam ao automático.`);
      if (!ok) return;
      const br = STATE.brackets[currentBracketCategory];
      if (br) {
        br.customPositions = {};
        saveState();
        scheduleBracketSave(currentBracketCategory, { immediate: true });
        toast('Layout resetado ✅', 'success');
        navigate('tournament');
      }
    });
  });
}

/* Atalhos de sorteio na tela do torneio (admin only) */
function bindBracketSortActions() {
  if (STATE.user?.role !== 'admin') return;
  document.querySelectorAll('[data-action="goto-draw"]').forEach(b => {
    b.addEventListener('click', () => {
      currentDrawCategory = currentBracketCategory;
      drawState = { players: [], seeds: [] };
      navigate('admin-draw');
    });
  });
  document.querySelectorAll('[data-action="resort-bracket"]').forEach(b => {
    b.addEventListener('click', () => {
      const cat = STATE.categories.find(c => c.id === currentBracketCategory);
      const ok = confirm('Re-sortear a chave de ' + (cat?.name || 'esta categoria') + '? A chave atual sera substituida.');
      if (!ok) return;
      currentDrawCategory = currentBracketCategory;
      drawState = { players: [], seeds: [] };
      navigate('admin-draw');
    });
  });
  // Footer do match clicavel: abre editor (scores/winner/data/hora) em qualquer modo
  document.querySelectorAll('[data-action="edit-match-details"]').forEach(el => {
    const open = (e) => {
      e.stopPropagation();
      const matchId = el.dataset.matchId;
      if (matchId) openMatchEditor(matchId);
    };
    el.addEventListener('click', open);
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(e); }
    });
  });
}

/* Edit mode: cada slot p1/p2 abre modal pra trocar jogador.
   Adicionalmente: HTML5 drag-and-drop entre slots (mesmo round ou rounds diferentes). */
function bindBracketEditModeClicks() {
  if (!STATE.user || STATE.user.role !== 'admin') return;
  const rows = document.querySelectorAll('.bk-player-row');
  rows.forEach(row => {
    const card = row.closest('.bk-match');
    if (!card) return;
    const matchId = card.dataset.matchId;
    const allRows = card.querySelectorAll('.bk-player-row');
    const slotKey = (allRows[0] === row) ? 'p1' : 'p2';
    row.classList.add('edit-slot');
    row.dataset.slotKey = slotKey;
    row.dataset.matchId = matchId;

    row.addEventListener('click', (e) => {
      if (e.target.closest('.bk-player-name-input') || e.target.closest('.match-action-btn')) return;
      if (e.detail === 0) return;       // click sintético
      e.stopPropagation();
      openSlotEditor(matchId, slotKey);
    });

    // Dblclick no nome: edição inline do display_label do entry
    const nameEl = row.querySelector('.bk-player-name');
    if (nameEl) {
      nameEl.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        startInlineEdit(nameEl, matchId, slotKey);
      });
    }

    // Drag source
    row.draggable = true;
    row.addEventListener('dragstart', e => {
      const found = findMatchInBracket(currentBracketCategory, matchId);
      const playerId = found?.match?.[slotKey];
      if (!playerId) { e.preventDefault(); return; }
      e.dataTransfer.setData('text/plain', JSON.stringify({ matchId, slotKey, playerId }));
      e.dataTransfer.effectAllowed = 'move';
      row.classList.add('dragging');
    });
    row.addEventListener('dragend', () => row.classList.remove('dragging'));

    // Drop target
    row.addEventListener('dragover', e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      row.classList.add('drag-over');
    });
    row.addEventListener('dragleave', () => row.classList.remove('drag-over'));
    row.addEventListener('drop', e => {
      e.preventDefault();
      row.classList.remove('drag-over');
      try {
        const { matchId: srcMatchId, slotKey: srcSlot, playerId: srcPlayer } = JSON.parse(e.dataTransfer.getData('text/plain'));
        if (srcMatchId === matchId && srcSlot === slotKey) return;
        applyDragDrop({ srcMatchId, srcSlot, srcPlayer }, { dstMatchId: matchId, dstSlot: slotKey });
      } catch (err) { console.warn('drop parse err', err); }
    });
  });

  // Botão 🗑️ por match (header do card)
  document.querySelectorAll('.bk-match').forEach(card => {
    if (card.querySelector('.match-action-btn')) return;
    const matchId = card.dataset.matchId;
    const head = card.querySelector('.bk-match-head');
    if (head) {
      const btn = document.createElement('button');
      btn.className = 'match-action-btn match-remove-btn';
      btn.title = 'Remover este match';
      btn.textContent = '🗑️';
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        confirmRemoveMatch(matchId);
      });
      head.appendChild(btn);
    }
  });

  // Botão "+ Match em <round>" no fim de cada round
  document.querySelectorAll('.bracket-round').forEach(roundEl => {
    if (roundEl.querySelector('.add-match-btn')) return;
    const roundName = roundEl.dataset.round;
    if (!roundName) return;
    const btn = document.createElement('button');
    btn.className = 'add-match-btn';
    btn.title = `Adicionar match em ${ROUND_LABELS[roundName] || roundName}`;
    btn.innerHTML = `+ Match em ${roundName}`;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      addMatchToRound(roundName);
    });
    roundEl.appendChild(btn);
  });

  // Botão "+ Round" no header do bracket
  const header = document.querySelector('.bracket-rounds-header');
  if (header && !header.querySelector('.round-action-btn')) {
    const addRoundBtn = document.createElement('button');
    addRoundBtn.className = 'round-action-btn';
    addRoundBtn.title = 'Adicionar nova rodada antes da 1ª atual (ex: R128 pre-qualifying)';
    addRoundBtn.innerHTML = '+ Round';
    addRoundBtn.addEventListener('click', confirmAddRound);
    header.insertBefore(addRoundBtn, header.firstChild);
  }
}

/* Add match novo num round específico (cria match vazio no fim do array) */
async function addMatchToRound(roundName) {
  const catId = currentBracketCategory;
  const br = STATE.brackets[catId];
  if (!br || !br.matches[roundName]) return;
  const list = br.matches[roundName];
  const lastN = list.length ? list[list.length - 1].n : 0;
  const newN = lastN + 1;
  list.push({
    id: `m-${roundName.toLowerCase()}-${newN}`,
    n: newN, round: roundName,
    p1: null, p2: null, scores: [], winner: null,
    isBye: false, walkover_reason: null, date: null, time: null,
  });
  saveState();
  try {
    if (STATE._activeTournamentId) {
      await TP.Brackets.updateData(STATE._activeTournamentId, catId, br);
      toast(`Match adicionado em ${roundName} ✅`, 'success');
    }
  } catch (e) {
    toast('Erro: ' + (e.message || 'falha'), 'error');
  }
  navigate('tournament');
}

/* Remove um match do array, renumera os subsequentes do round */
function confirmRemoveMatch(matchId) {
  const catId = currentBracketCategory;
  const found = findMatchInBracket(catId, matchId);
  if (!found) return;
  const { match, round } = found;
  openModal({
    title: '🗑️ Remover match',
    sub: `Match #${match.n} · ${round}`,
    body: `
      <p class="muted" style="font-size:14px;margin-bottom:8px">${memberName(match.p1) || '(vazio)'} vs ${memberName(match.p2) || '(vazio)'}</p>
      <p class="muted" style="font-size:13px">Vai remover este match e renumerar os matches seguintes do round. <strong>Não dá pra desfazer.</strong></p>
    `,
    actions: [
      { label: 'Cancelar', class: 'btn-secondary', onClick: closeModal },
      { label: 'REMOVER', class: 'btn-danger', onClick: () => doRemoveMatch(catId, round, match.n) },
    ],
  });
}

async function doRemoveMatch(catId, round, matchN) {
  const br = STATE.brackets[catId];
  const list = br.matches[round];
  const idx = list.findIndex(m => m.n === matchN);
  if (idx < 0) return;
  list.splice(idx, 1);
  // Renumera matches deste round (n e id) — só os que foram afetados
  list.forEach((m, i) => {
    const newN = list[0].n + i;
    m.n = newN;
    m.id = `m-${round.toLowerCase()}-${newN}`;
  });
  saveState();
  closeModal();
  try {
    if (STATE._activeTournamentId) {
      await TP.Brackets.updateData(STATE._activeTournamentId, catId, br);
      toast('Match removido ✅', 'success');
    }
  } catch (e) {
    toast('Erro: ' + (e.message || 'falha'), 'error');
  }
  navigate('tournament');
}

/* Adiciona ROUND inteira (ex: R128 antes de R64 pra pre-qualifying) */
function confirmAddRound() {
  openModal({
    title: '+ Nova rodada',
    body: `
      <p class="muted" style="font-size:13px;margin-bottom:12px">Adiciona rodada extra antes da 1ª rodada atual. Útil pra criar pre-qualifying (ex: R128 antes de R64).</p>
      <div class="field">
        <label>Nome da rodada</label>
        <select id="new-round-name">
          <option value="R128">R128 (128 jogadores)</option>
          <option value="R256">R256 (256 jogadores)</option>
        </select>
      </div>
      <div class="field"><label>Quantidade de matches</label><input id="new-round-count" type="number" value="2" min="1" max="64"></div>
      <p class="muted" style="font-size:12px">⚠️ Use só se realmente precisar — quebra a estrutura padrão do bracket.</p>
    `,
    actions: [
      { label: 'Cancelar', class: 'btn-secondary', onClick: closeModal },
      { label: 'Adicionar', class: 'btn-primary', onClick: doAddRound },
    ],
  });
}

async function doAddRound() {
  const catId = currentBracketCategory;
  const br = STATE.brackets[catId];
  if (!br) return;
  const name = document.getElementById('new-round-name').value;
  const count = Math.max(1, parseInt(document.getElementById('new-round-count').value, 10) || 1);
  if (br.rounds.includes(name)) { toast('Round já existe', 'error'); return; }
  br.rounds.unshift(name);
  const matches = [];
  let n = 1;
  for (let i = 0; i < count; i++) {
    matches.push({
      id: `m-${name.toLowerCase()}-${n}`, n, round: name,
      p1: null, p2: null, scores: [], winner: null,
      isBye: false, walkover_reason: null, date: null, time: null,
    });
    n++;
  }
  br.matches[name] = matches;
  saveState();
  closeModal();
  try {
    if (STATE._activeTournamentId) {
      await TP.Brackets.updateData(STATE._activeTournamentId, catId, br);
      toast(`${name} adicionada ✅`, 'success');
    }
  } catch (e) {
    toast('Erro: ' + (e.message || 'falha'), 'error');
  }
  navigate('tournament');
}

/* Drag-and-drop: aplica swap entre dois slots (mesmo round ou rounds diferentes).
   Se um slot ficar vazio com oponente preenchido, marca BYE + auto-advance. */
async function applyDragDrop({ srcMatchId, srcSlot, srcPlayer }, { dstMatchId, dstSlot }) {
  const catId = currentBracketCategory;
  const br = STATE.brackets[catId];
  if (!br) return;
  const srcFound = findMatchInBracket(catId, srcMatchId);
  const dstFound = findMatchInBracket(catId, dstMatchId);
  if (!srcFound || !dstFound) { toast('Match não encontrado', 'error'); return; }

  const dstPlayer = dstFound.match[dstSlot];
  dstFound.match[dstSlot] = srcPlayer;
  srcFound.match[srcSlot] = dstPlayer || null;

  [srcFound, dstFound].forEach(({ match }) => {
    if (match.p1 == null && match.p2 != null) {
      match.winner = match.p2; match.isBye = true;
      autoAdvanceWinnerInBracket(br, match);
    } else if (match.p2 == null && match.p1 != null) {
      match.winner = match.p1; match.isBye = true;
      autoAdvanceWinnerInBracket(br, match);
    } else if (match.p1 && match.p2) {
      match.isBye = false;
      if (!match.scores || !match.scores.length) match.winner = null;
    }
  });

  saveState();
  try {
    if (STATE._activeTournamentId) {
      await TP.Brackets.updateData(STATE._activeTournamentId, catId, br);
      toast('Slot movido ✅', 'success');
    }
  } catch (e) {
    toast('Erro: ' + (e.message || 'falha sync'), 'error');
  }
  navigate('tournament');
}

/* Edição inline do display_label do entry (dblclick no nome do jogador) */
function startInlineEdit(nameEl, matchId, slotKey) {
  const catId = currentBracketCategory;
  const found = findMatchInBracket(catId, matchId);
  const playerId = found?.match?.[slotKey];
  if (!playerId) { toast('Slot vazio', 'info'); return; }

  const currentName = memberName(playerId);
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'bk-player-name-input';
  input.value = currentName;
  input.style.cssText = 'width:100%;padding:2px 6px;font-size:14.5px;font-weight:700;background:rgba(0,0,0,0.5);color:#fff;border:1px solid var(--brand);border-radius:4px;outline:none';

  const save = async () => {
    const newName = input.value.trim();
    if (newName && newName !== currentName) {
      await renameEntryInBracket(catId, playerId, newName);
    }
    navigate('tournament'); // re-render
  };
  input.addEventListener('blur', save);
  input.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter') input.blur();
    if (ev.key === 'Escape') { input.value = currentName; input.blur(); }
  });

  nameEl.style.display = 'none';
  nameEl.parentNode.insertBefore(input, nameEl.nextSibling);
  input.focus(); input.select();
}

async function renameEntryInBracket(catId, playerId, newName) {
  const br = STATE.brackets[catId];
  if (!br) return;
  const entry = (br.entries || []).find(e => e.id === playerId);
  if (entry) entry.name = newName;
  // Atualiza tournamentPlayers global pra getMember refletir
  const tp = (STATE.tournamentPlayers || []).find(p => p.id === playerId);
  if (tp) tp.name = newName;
  saveState();
  try {
    if (STATE._activeTournamentId) {
      await TP.Brackets.updateData(STATE._activeTournamentId, catId, br);
      toast('Nome atualizado ✅', 'success');
    }
  } catch (e) {
    toast('Erro: ' + (e.message || 'falha'), 'error');
  }
}

function openSlotEditor(matchId, slotKey) {
  const catId = currentBracketCategory;
  const found = findMatchInBracket(catId, matchId);
  if (!found) { toast('Match não encontrado', 'error'); return; }
  const { match } = found;
  const currentId = match[slotKey];
  const currentName = currentId ? memberName(currentId) : '(vazio / BYE)';

  // Lista todos os entries dessa categoria (do tournamentPlayers)
  const entries = (STATE.tournamentPlayers || [])
    .filter(p => p.categoryKey === catId)
    .sort((a,b) => a.name.localeCompare(b.name, 'pt-BR'));

  const optionsHTML = entries.map(p => `
    <option value="${p.id}" ${p.id === currentId ? 'selected' : ''}>${p.name}</option>
  `).join('');

  openModal({
    title: '🔄 Editar slot',
    sub: `Match #${match.n} · ${ROUND_LABELS[match.round] || match.round} · slot ${slotKey === 'p1' ? 'TOPO' : 'BAIXO'}`,
    body: `
      <p class="muted" style="font-size:13px;margin-bottom:12px">Atual: <strong>${currentName}</strong></p>
      <div class="field">
        <label>Trocar por:</label>
        <select id="slot-new-entry">
          <option value="">— (Vazio / BYE)</option>
          ${optionsHTML}
        </select>
      </div>
      <p class="muted" style="font-size:12px">Se marcar BYE, o oponente avança automaticamente pro próximo round (se vaga vazia).</p>
    `,
    actions: [
      { label: 'Cancelar', class: 'btn-secondary', onClick: closeModal },
      { label: 'Salvar', class: 'btn-primary', onClick: () => saveSlotEdit(catId, matchId, slotKey) },
    ],
  });
}

async function saveSlotEdit(catId, matchId, slotKey) {
  const found = findMatchInBracket(catId, matchId);
  if (!found) return;
  const { match } = found;
  const newId = document.getElementById('slot-new-entry').value || null;
  match[slotKey] = newId;

  // Se ficou BYE (um slot null e outro com player), winner = o que tem player
  const otherKey = slotKey === 'p1' ? 'p2' : 'p1';
  if (newId === null && match[otherKey]) {
    match.winner = match[otherKey];
    match.isBye = true;
    autoAdvanceWinnerInBracket(STATE.brackets[catId], match);
  } else if (match.p1 && match.p2 && match.isBye) {
    // Saiu de bye porque agora ambos têm jogador
    match.isBye = false;
    match.winner = null;
  }

  closeModal();
  saveState();

  try {
    if (STATE._activeTournamentId) {
      await TP.Brackets.updateData(STATE._activeTournamentId, catId, STATE.brackets[catId]);
      toast('Slot atualizado ✅', 'success');
    } else {
      toast('Salvo localmente (sem tournament_id)', 'info');
    }
  } catch (e) {
    toast('Erro: ' + (e.message || 'falha no Supabase'), 'error');
  }

  navigate('tournament');
}

/* Admin: clicar num match abre editor pra setar score/winner.
   Member comum: noop. */
function bindBracketAdminClicks() {
  if (!STATE.user || STATE.user.role !== 'admin') return;
  const cards = document.querySelectorAll('.bk-match');
  cards.forEach(c => {
    c.classList.add('admin-editable');
    c.addEventListener('click', () => openMatchEditor(c.dataset.matchId));
  });
}

function findMatchInBracket(catId, matchId) {
  const br = STATE.brackets[catId];
  if (!br) return null;
  for (const round of br.rounds) {
    const m = (br.matches[round] || []).find(x => x.id === matchId);
    if (m) return { match: m, round };
  }
  return null;
}

function openMatchEditor(matchId) {
  const catId = currentBracketCategory;
  const found = findMatchInBracket(catId, matchId);
  if (!found) { toast('Match não encontrado', 'error'); return; }
  const { match, round } = found;
  const p1Name = memberName(match.p1);
  const p2Name = memberName(match.p2);

  // Renderiza inputs pros 3 sets (suficiente pra padrão tennis: 2 sets + super tiebreak)
  const setsRows = [0, 1, 2].map(i => {
    const s = match.scores?.[i] || ['', ''];
    return `
      <div class="row gap-sm">
        <div class="field flex-1"><label>Set ${i + 1} — ${p1Name}</label>
          <input type="number" min="0" max="20" id="set-${i}-p1" value="${s[0] === '' ? '' : s[0]}" placeholder="—"></div>
        <div class="field flex-1"><label>Set ${i + 1} — ${p2Name}</label>
          <input type="number" min="0" max="20" id="set-${i}-p2" value="${s[1] === '' ? '' : s[1]}" placeholder="—"></div>
      </div>`;
  }).join('');

  openModal({
    title: `✏️ Editar match ${match.n} — ${ROUND_LABELS[round] || round}`,
    sub: `${p1Name} vs ${p2Name}`,
    body: `
      ${setsRows}
      <div class="field">
        <label>Vencedor</label>
        <select id="match-winner">
          <option value="">— ainda não decidido —</option>
          ${match.p1 ? `<option value="${match.p1}" ${match.winner === match.p1 ? 'selected' : ''}>${p1Name}</option>` : ''}
          ${match.p2 ? `<option value="${match.p2}" ${match.winner === match.p2 ? 'selected' : ''}>${p2Name}</option>` : ''}
        </select>
      </div>
      <div class="field">
        <label>Walkover / observação (texto livre — ex: "WO", "lesão", "abandono")</label>
        <input id="match-walkover" placeholder="ex: lesão, WO, abandono" value="${match.walkover_reason || match.walkoverReason || ''}">
      </div>
      <p class="muted" style="font-size:11px;margin-top:-8px">💡 Se o match foi resolvido por desistência/abandono, deixa scores em branco e preenche só esse campo + o vencedor.</p>
      <div class="row gap-sm" style="margin-top:8px">
        <div class="field flex-1">
          <label>Data do jogo</label>
          <input type="date" id="match-date" value="${match.date || ''}">
        </div>
        <div class="field flex-1">
          <label>Horário</label>
          <input type="time" id="match-time" value="${match.time || ''}" step="300">
        </div>
      </div>
      <p class="muted" style="font-size:11px;margin-top:-8px">📅 Aparece no card do match e na aba "Horários" do torneio.</p>
    `,
    actions: [
      { label: 'Cancelar', class: 'btn-secondary', onClick: closeModal },
      { label: 'Salvar', class: 'btn-primary', onClick: () => saveMatchEdit(catId, matchId) },
    ],
  });
}

async function saveMatchEdit(catId, matchId) {
  const found = findMatchInBracket(catId, matchId);
  if (!found) return;
  const { match } = found;

  const scores = [];
  for (let i = 0; i < 3; i++) {
    const a = document.getElementById(`set-${i}-p1`).value;
    const b = document.getElementById(`set-${i}-p2`).value;
    if (a !== '' && b !== '') scores.push([Number(a), Number(b)]);
  }
  const winner = document.getElementById('match-winner').value || null;
  const walkover = document.getElementById('match-walkover').value.trim() || null;
  const matchDate = document.getElementById('match-date')?.value || null;
  const matchTime = document.getElementById('match-time')?.value || null;

  match.scores = scores;
  match.winner = winner;
  match.walkover_reason = walkover;
  match.date = matchDate;
  match.time = matchTime;

  // Auto-advance pro próximo round se houver winner
  autoAdvanceWinnerInBracket(STATE.brackets[catId], match);

  closeModal();
  saveState();

  // Persiste no Supabase
  try {
    if (STATE._activeTournamentId) {
      await TP.Brackets.updateData(STATE._activeTournamentId, catId, STATE.brackets[catId]);
      toast('Match salvo + sync Supabase ✅', 'success');
    } else {
      toast('Match salvo localmente (sem tournament_id)', 'info');
    }
  } catch (e) {
    console.warn('Erro ao salvar no Supabase:', e);
    toast('Salvo localmente — Supabase falhou: ' + (e.message || 'erro'), 'error');
  }

  navigate('tournament');
}

/* Quando um match ganha winner, propaga pro próximo round se a vaga estiver vazia.
   IMPORTANTE: só preenche se o slot do próximo round for null. Não sobrescreve
   slots já populados (esses podem ser fixos do seed do torneio — caso da Cat A
   onde R16[3] foi pré-populado com Sandro x Rodrigo V., não bate com auto-advance
   "padrão" do R32 idx 6+7). */
function autoAdvanceWinnerInBracket(bracket, finishedMatch) {
  if (!bracket || !finishedMatch.winner) return;
  const idx = bracket.rounds.indexOf(finishedMatch.round);
  if (idx < 0 || idx >= bracket.rounds.length - 1) return;
  const cur = bracket.matches[finishedMatch.round];
  const nxt = bracket.matches[bracket.rounds[idx + 1]];
  const myIdx = cur.findIndex(m => m.id === finishedMatch.id);
  const targetIdx = Math.floor(myIdx / 2);
  if (!nxt[targetIdx]) return;
  if (myIdx % 2 === 0) {
    if (nxt[targetIdx].p1 == null) nxt[targetIdx].p1 = finishedMatch.winner;
  } else {
    if (nxt[targetIdx].p2 == null) nxt[targetIdx].p2 = finishedMatch.winner;
  }
}

/* -------- PLAY -------- */
function renderPlay() {
  return `
    <div class="welcome-card">
      <h2>🎾 Jogar agora</h2>
      <p>Encontre parceiros, marque um jogo amistoso ou veja seus próximos compromissos.</p>
    </div>
    <div class="action-grid">
      <div class="action-card" onclick="navigate('courts')"><div class="ai">📅</div><div class="at">Reservar quadra</div><div class="as">Disponíveis hoje</div></div>
      <div class="action-card" onclick="navigate('tournament')"><div class="ai">🏆</div><div class="at">Próximo torneio</div><div class="as">Ver chave</div></div>
      <div class="action-card" onclick="toast('Em breve!','info')"><div class="ai">⚡</div><div class="at">Jogo amistoso</div><div class="as">Convide alguém</div></div>
      <div class="action-card" onclick="navigate('profile')"><div class="ai">📊</div><div class="at">Minhas estatísticas</div><div class="as">Desempenho</div></div>
    </div>
  `;
}

/* -------- COURTS -------- */
function renderCourts() {
  const today = new Date();
  const days = ['D','S','T','Q','Q','S','S'];
  const monthNames = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

  return `
    <div class="row-between mb-md">
      <button class="icon-btn">‹</button>
      <h2 style="font-family:var(--font-display);font-weight:700">${monthNames[today.getMonth()]} ${today.getFullYear()}</h2>
      <button class="icon-btn">›</button>
    </div>

    <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-bottom:16px">
      ${days.map(d => `<div class="text-center muted" style="font-size:12px;padding:4px">${d}</div>`).join('')}
      ${renderCalendarDays(today)}
    </div>

    <div class="section-title">Horários de hoje</div>
    ${STATE.schedules.length ? STATE.schedules.map(s => {
      const c = getCourt(s.courtId);
      const full = s.taken >= s.spots;
      return `
        <div class="card mb-sm">
          <div class="row-between">
            <div>
              <div style="font-weight:700;font-size:15px">${c ? c.name : 'Quadra'}</div>
              <div class="muted" style="font-size:13px;margin-top:2px">${s.start} – ${s.end} · ${s.type}</div>
              <div class="muted" style="font-size:12px;margin-top:2px">${s.taken}/${s.spots} vagas</div>
            </div>
            <button class="${full ? 'btn-secondary' : 'btn-primary'}" ${full?'disabled':''} style="padding:10px 16px;font-size:13px" data-action="reservar" data-court="${s.courtId}" data-start="${s.start}" data-end="${s.end}">
              ${full ? 'Lotado' : 'Reservar'}
            </button>
          </div>
        </div>
      `;
    }).join('') : '<div class="card text-center muted" style="padding:20px;font-size:14px">Sem horários disponíveis hoje.</div>'}
  `;
}

function renderCalendarDays(today) {
  const year = today.getFullYear();
  const month = today.getMonth();
  const first = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();
  let html = '';
  for (let i = 0; i < first; i++) html += '<div></div>';
  for (let d = 1; d <= lastDate; d++) {
    const isToday = d === today.getDate();
    html += `<div class="text-center" style="padding:8px;border-radius:8px;font-size:13px;cursor:pointer;${isToday ? 'background:var(--brand);color:var(--brand-text);font-weight:700' : ''}">${d}</div>`;
  }
  return html;
}

function bindCourts() {
  document.querySelectorAll('[data-action="reservar"]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const courtId = btn.dataset.court;
      const court = getCourt(courtId);
      openModal({
        title: '📅 Confirmar reserva',
        body: `
          <p class="muted" style="font-size:14px">Reservar <strong>${court?.name}</strong>?</p>
          <p class="muted" style="font-size:13px">${btn.dataset.start} – ${btn.dataset.end}</p>
          <div class="field mt-sm"><label>Observação (opcional)</label><input id="booking-notes" placeholder="Ex: treino com parceiro"></div>
        `,
        actions: [
          { label: 'Cancelar', class: 'btn-secondary', onClick: closeModal },
          { label: 'Confirmar', class: 'btn-primary', onClick: async () => {
            closeModal();
            try {
              const today = new Date().toISOString().split('T')[0];
              const [sh, sm] = btn.dataset.start.split(':');
              const [eh, em] = btn.dataset.end.split(':');
              await TP.Bookings.create({
                court_id: courtId,
                start_at: `${today}T${sh}:${sm}:00-03:00`,
                end_at:   `${today}T${eh}:${em}:00-03:00`,
                notes:    document.getElementById('booking-notes')?.value || null,
              });
              toast('Quadra reservada! ✅', 'success');
              await loadAppData();
              navigate('courts');
            } catch (e) {
              toast('Erro ao reservar: ' + (e.message || 'tente novamente'), 'error');
            }
          }},
        ],
      });
    });
  });
}

/* -------- PROFILE -------- */
function renderProfile() {
  const u = STATE.user;
  const cat = u.category ? getCategory(u.category) : null;
  const isAdmin = u.role === 'admin';
  const myCats = (u.tournamentCategoryIds || []).map(id => getCategory(id)).filter(Boolean);
  const mySlots = u.tournamentSlots || [];

  return `
    <div class="profile-header">
      <div class="avatar xl" style="background:var(--brand);color:var(--brand-text)">${initials(u.name)}</div>
      <div class="profile-name">${u.name}${isAdmin ? ' <span class="admin-badge">ADMIN</span>' : ''}</div>
      <div class="profile-loc">${isAdmin ? '🔑 Administrador' : (u.email || '')}</div>
      <div class="stats-row">
        <div class="sc"><div class="sc-num">${mySlots.length}</div><div class="sc-lbl">Slots</div></div>
        <div class="sc"><div class="sc-num">${myCats.length}</div><div class="sc-lbl">Categorias</div></div>
        <div class="sc"><div class="sc-num">${cat ? cat.name : (myCats[0]?.name || '—')}</div><div class="sc-lbl">Principal</div></div>
      </div>
    </div>

    ${myCats.length ? `
      <div class="card mb-md">
        <div class="section-title" style="margin:0 0 12px">🏆 Minhas categorias no torneio</div>
        ${myCats.map(c => {
          const slotsHere = mySlots.filter(s => s.categoryKey === c.id);
          return `
            <div class="list-row" data-my-cat="${c.id}" style="cursor:pointer">
              <div class="avatar lg" style="background:var(--av-blue);font-size:16px">${c.icon || '🎾'}</div>
              <div class="lr-info">
                <div class="lr-title">${c.name}</div>
                <div class="lr-meta">${slotsHere.map(s => s.name).join(' · ')}</div>
              </div>
              <div class="lr-action">›</div>
            </div>
          `;
        }).join('')}
      </div>
    ` : ''}

    <div class="card mb-md">
      <div class="section-title" style="margin:0 0 12px">Editar perfil</div>
      <div class="field"><label>Nome</label><input id="prof-name" value="${u.name}"></div>
      <div class="field"><label>Telefone</label><input id="prof-phone" value="${u.phone || ''}" placeholder="(11) 99999-9999"></div>
      <div class="field">
        <label>Categoria</label>
        <select id="prof-cat">
          <option value="">— Sem categoria —</option>
          ${STATE.categories.map(c => `<option value="${c.id}" ${c.id===u.category?'selected':''}>${c.icon} ${c.name}</option>`).join('')}
        </select>
      </div>
      <button class="btn-primary btn-block mt-sm" id="btn-save-profile">Salvar</button>
    </div>

    ${cat ? `
      <div class="card mb-md">
        <div class="row-between">
          <div>
            <div style="font-size:12px;color:var(--text-muted)">${cat.icon} Categoria ${cat.name}</div>
            <div style="font-family:var(--font-display);font-weight:700;font-size:18px;margin-top:2px">Membro ativo</div>
          </div>
          <div class="badge blue">${cat.name}</div>
        </div>
      </div>
    ` : ''}
  `;
}

function bindProfile() {
  // Click numa "minha categoria" leva pra chave dela
  document.querySelectorAll('[data-my-cat]').forEach(el => {
    el.addEventListener('click', () => {
      currentBracketCategory = el.dataset.myCat;
      currentTournamentTab = 'chave';
      navigate('tournament');
    });
  });

  document.getElementById('btn-save-profile')?.addEventListener('click', async () => {
    const name  = document.getElementById('prof-name').value.trim();
    const phone = document.getElementById('prof-phone').value.trim();
    const catId = document.getElementById('prof-cat').value;
    if (!name) { toast('Informe seu nome', 'error'); return; }
    try {
      await TP.Profiles.update(STATE.user.id, {
        name,
        phone: phone || null,
        category_id: catId || null,
        updated_at: new Date().toISOString(),
      });
      STATE.user.name     = name;
      STATE.user.phone    = phone;
      STATE.user.category = catId || null;
      updateDrawerUser();
      toast('Perfil atualizado! ✅', 'success');
    } catch (e) {
      toast('Erro ao salvar: ' + e.message, 'error');
    }
  });
}

/* -------- ADMIN -------- */
function renderAdmin() {
  const s = STATE.settings;
  return `
    <div class="admin-header">
      <div class="a-tag">🔑 Administrador</div>
      <h1>PAINEL <em>ADM</em></h1>
      <div class="a-meta">${s.tournamentName} · Em andamento</div>
    </div>

    <div class="stats-grid">
      <div class="stat-card"><div class="stat-num">${STATE.members.length}</div><div class="stat-lbl">Total inscritos</div></div>
      <div class="stat-card"><div class="stat-num">${STATE.categories.length}</div><div class="stat-lbl">Categorias ativas</div></div>
      <div class="stat-card"><div class="stat-num">${countMatches()}</div><div class="stat-lbl">Jogos agendados</div></div>
      <div class="stat-card"><div class="stat-num">${STATE.courts.length}</div><div class="stat-lbl">Quadras</div></div>
    </div>

    <div class="section-title">⚙️ Gerenciar Torneio</div>
    <div class="action-grid">
      <div class="action-card" data-screen="admin-categories"><div class="ai">🗂️</div><div class="at">Categorias</div><div class="as">Criar / editar / excluir</div></div>
      <div class="action-card" data-screen="admin-bracket-edit"><div class="ai">🎯</div><div class="at">Editar Chaves</div><div class="as">Trocar slots / BYE</div></div>
      <div class="action-card" data-screen="admin-players"><div class="ai">🎾</div><div class="at">Jogadores</div><div class="as">CRUD do registry</div></div>
    </div>

    <div class="section-title">Outras ações</div>
    <div class="action-grid">
      <div class="action-card" data-screen="admin-draw"><div class="ai">🎲</div><div class="at">Sorteio de chaves</div><div class="as">Montar brackets</div></div>
      <div class="action-card" data-screen="admin-tournament"><div class="ai">🏆</div><div class="at">Gerenciar torneio</div><div class="as">Categorias e jogos</div></div>
      <div class="action-card" data-screen="admin-courts"><div class="ai">📅</div><div class="at">Quadras</div><div class="as">Horários e reservas</div></div>
      <div class="action-card" data-screen="admin-members"><div class="ai">👥</div><div class="at">Membros</div><div class="as">Gerenciar alunos</div></div>
      <div class="action-card" data-screen="settings"><div class="ai">🎨</div><div class="at">Personalização</div><div class="as">Cores e tema</div></div>
      <div class="action-card" data-action="send-broadcast"><div class="ai">📣</div><div class="at">Notificação</div><div class="as">Avisar todos</div></div>
    </div>
  `;
}

function bindAdmin() {
  document.querySelectorAll('.action-card[data-screen]').forEach(c => {
    c.addEventListener('click', () => navigate(c.dataset.screen));
  });
  document.querySelector('[data-action="send-broadcast"]')?.addEventListener('click', () => {
    openModal({
      title: '📣 Enviar notificação',
      body: `
        <div class="field"><label>Título</label><input id="bc-title" placeholder="Ex: Quadra disponível hoje!"></div>
        <div class="field"><label>Mensagem (opcional)</label><input id="bc-body" placeholder="Detalhes..."></div>
      `,
      actions: [
        { label: 'Cancelar', class: 'btn-secondary', onClick: closeModal },
        { label: 'Enviar pra todos', class: 'btn-primary', onClick: async () => {
          const title = document.getElementById('bc-title').value.trim();
          if (!title) { toast('Informe o título', 'error'); return; }
          closeModal();
          try {
            await TP.Notifications.broadcast({ title, body: document.getElementById('bc-body').value, type: 'info' });
            toast('Notificação enviada! 📣', 'success');
          } catch (e) {
            toast('Erro ao enviar', 'error');
          }
        }},
      ],
    });
  });
}

/* -------- ADMIN: TORNEIO -------- */
function renderAdminTournament() {
  const s = STATE.settings;
  return `
    <div class="row-between mb-md">
      <button class="btn-ghost" data-action="back-admin">← Voltar</button>
      <button class="btn-primary" style="padding:8px 14px;font-size:13px" data-action="new-tournament">+ Novo</button>
    </div>

    <div class="card mb-md">
      <div class="row-between">
        <div>
          <div style="font-family:var(--font-display);font-weight:700;font-size:18px">${s.tournamentName}</div>
          <div class="muted" style="font-size:13px;margin-top:2px">${shortDate(s.tournamentDateStart)} – ${shortDate(s.tournamentDateEnd)}</div>
        </div>
        <span class="badge green">Em andamento</span>
      </div>
      <div class="stats-grid mt-md" style="grid-template-columns:repeat(3,1fr)">
        <div class="stat-card"><div class="stat-num">${STATE.members.length}</div><div class="stat-lbl">Inscritos</div></div>
        <div class="stat-card"><div class="stat-num">${countMatches()}</div><div class="stat-lbl">Jogos</div></div>
        <div class="stat-card"><div class="stat-num">${STATE.categories.length}</div><div class="stat-lbl">Cats</div></div>
      </div>
      <div class="row mt-md gap-sm">
        <button class="btn-secondary flex-1" data-action="edit-tournament">Editar</button>
        <button class="btn-primary flex-1" data-screen="admin-draw">🎲 Sorteio</button>
      </div>
    </div>

    <div class="section-title">Categorias</div>
    ${STATE.categories.map(c => {
      const players = categoryMembers(c.id);
      const hasBracket = STATE.brackets[c.id]?.drawn;
      return `
        <div class="list-row" data-cat-edit="${c.id}">
          <div class="avatar lg" style="background:var(--av-blue);font-size:16px">${c.icon}</div>
          <div class="lr-info">
            <div class="lr-title">${c.name}</div>
            <div class="lr-meta">${players.length} jogadores · ${hasBracket ? '✓ Chave sorteada' : 'Aguardando sorteio'}</div>
          </div>
          <div class="lr-action">›</div>
        </div>
      `;
    }).join('')}

    <button class="btn-secondary btn-block mt-md" data-action="new-category">＋ Nova categoria</button>
  `;
}

function bindAdminTournament() {
  document.querySelector('[data-action="back-admin"]')?.addEventListener('click', () => navigate('admin'));
  document.querySelector('[data-screen="admin-draw"]')?.addEventListener('click', () => navigate('admin-draw'));
  document.querySelector('[data-action="edit-tournament"]')?.addEventListener('click', () => modalEditTournament());
  document.querySelector('[data-action="new-tournament"]')?.addEventListener('click', () => modalNewTournament());
  document.querySelector('[data-action="new-category"]')?.addEventListener('click', () => modalNewCategory());
  document.querySelectorAll('[data-cat-edit]').forEach(el => {
    el.addEventListener('click', () => modalEditCategory(el.dataset.catEdit));
  });
}

function modalEditTournament() {
  const s = STATE.settings;
  openModal({
    title: '✏️ Editar Torneio',
    body: `
      <div class="field"><label>Nome</label><input id="mod-name" value="${s.tournamentName}"></div>
      <div class="field"><label>Local</label><input id="mod-venue" value="${s.tournamentVenue}"></div>
      <div class="row gap-sm">
        <div class="field flex-1"><label>Início</label><input id="mod-start" type="date" value="${s.tournamentDateStart}"></div>
        <div class="field flex-1"><label>Fim</label><input id="mod-end" type="date" value="${s.tournamentDateEnd}"></div>
      </div>
    `,
    actions: [
      { label: 'Cancelar', class: 'btn-secondary', onClick: closeModal },
      { label: 'Salvar', class: 'btn-primary', onClick: async () => {
        s.tournamentName      = document.getElementById('mod-name').value;
        s.tournamentVenue     = document.getElementById('mod-venue').value;
        s.tournamentDateStart = document.getElementById('mod-start').value;
        s.tournamentDateEnd   = document.getElementById('mod-end').value;
        saveState();
        // Salva no Supabase se tiver torneio ativo
        if (STATE._activeTournamentId) {
          try {
            await TP.sb.from('tournaments').update({ name: s.tournamentName, start_date: s.tournamentDateStart, end_date: s.tournamentDateEnd }).eq('id', STATE._activeTournamentId);
          } catch (e) { console.warn(e); }
        }
        closeModal();
        navigate('admin-tournament');
        toast('Torneio atualizado!', 'success');
      }},
    ],
  });
}

function modalNewTournament() {
  openModal({
    title: '🏆 Novo torneio',
    body: `
      <div class="field"><label>Nome do torneio</label><input id="nt-name" placeholder="Ex: Open Tennis Point 2026"></div>
      <div class="row gap-sm">
        <div class="field flex-1"><label>Data início</label><input id="nt-start" type="date"></div>
        <div class="field flex-1"><label>Data fim</label><input id="nt-end" type="date"></div>
      </div>
      <div class="field"><label>Local</label><input id="nt-venue" placeholder="Ex: Tennis Point Club"></div>
    `,
    actions: [
      { label: 'Cancelar', class: 'btn-secondary', onClick: closeModal },
      { label: 'Criar torneio', class: 'btn-primary', onClick: async () => {
        const name = document.getElementById('nt-name').value;
        if (!name) { toast('Informe o nome', 'error'); return; }
        closeModal();
        try {
          const t = await TP.Tournaments.create({
            name,
            start_date: document.getElementById('nt-start').value || null,
            end_date:   document.getElementById('nt-end').value   || null,
            created_by: STATE.user.id,
          });
          STATE._activeTournamentId = t.id;
          STATE.settings.tournamentName      = name;
          STATE.settings.tournamentDateStart = t.start_date || STATE.settings.tournamentDateStart;
          STATE.settings.tournamentVenue     = document.getElementById('nt-venue').value || STATE.settings.tournamentVenue;
          saveState();
          navigate('admin-tournament');
          toast('Torneio criado!', 'success');
        } catch (e) {
          toast('Erro ao criar torneio: ' + e.message, 'error');
        }
      }},
    ],
  });
}

function modalNewCategory() {
  openModal({
    title: '➕ Nova categoria',
    body: `
      <div class="field"><label>Nome</label><input id="nc-name" placeholder="Ex: Cat. D"></div>
      <div class="field"><label>Ícone (emoji)</label><input id="nc-icon" placeholder="🎾" maxlength="2" value="🎾"></div>
    `,
    actions: [
      { label: 'Cancelar', class: 'btn-secondary', onClick: closeModal },
      { label: 'Criar', class: 'btn-primary', onClick: async () => {
        const name = document.getElementById('nc-name').value;
        if (!name) { toast('Informe o nome', 'error'); return; }
        const id = 'cat-' + name.toLowerCase().replace(/[^a-z0-9]/g,'') + '-' + Date.now().toString(36);
        closeModal();
        try {
          await TP.sb.from('categories').insert({ id, name, icon: document.getElementById('nc-icon').value || '🎾', order_index: STATE.categories.length });
          STATE.categories.push({ id, name, icon: document.getElementById('nc-icon')?.value || '🎾', color: '--av-blue' });
          navigate('admin-tournament');
          toast(`Categoria "${name}" criada`, 'success');
        } catch (e) {
          toast('Erro ao criar categoria', 'error');
        }
      }},
    ],
  });
}

function modalEditCategory(catId) {
  const c = getCategory(catId);
  if (!c) return;
  openModal({
    title: '✏️ Editar Categoria',
    body: `
      <div class="field"><label>Nome</label><input id="ec-name" value="${c.name}"></div>
      <div class="field"><label>Ícone</label><input id="ec-icon" value="${c.icon}"></div>
      <div class="muted" style="font-size:13px;margin-top:8px">${categoryMembers(catId).length} jogadores nesta categoria</div>
    `,
    actions: [
      { label: 'Excluir', class: 'btn-danger', onClick: async () => {
        if (categoryMembers(catId).length > 0) { toast('Remova os jogadores antes', 'error'); return; }
        closeModal();
        try {
          await TP.sb.from('categories').delete().eq('id', catId);
          STATE.categories = STATE.categories.filter(x => x.id !== catId);
          delete STATE.brackets[catId];
          navigate('admin-tournament');
        } catch (e) { toast('Erro ao excluir', 'error'); }
      }},
      { label: 'Salvar', class: 'btn-primary', onClick: async () => {
        const name = document.getElementById('ec-name').value;
        const icon = document.getElementById('ec-icon').value;
        closeModal();
        try {
          await TP.sb.from('categories').update({ name, icon }).eq('id', catId);
          c.name = name; c.icon = icon;
          navigate('admin-tournament');
          toast('Categoria atualizada', 'success');
        } catch (e) { toast('Erro ao salvar', 'error'); }
      }},
    ],
  });
}

/* -------- ADMIN: MEMBROS -------- */
function renderAdminMembers() {
  return `
    <div class="row-between mb-md">
      <button class="btn-ghost" data-action="back-admin">← Voltar</button>
    </div>

    <div class="field mb-md">
      <input id="search-member" placeholder="🔍 Buscar membro..." style="border-radius:12px">
    </div>

    <div class="chips mb-md">
      <button class="chip active" data-cat-filter="all">Todos</button>
      ${STATE.categories.map(c => `<button class="chip" data-cat-filter="${c.id}">${c.name}</button>`).join('')}
    </div>

    <div id="members-list">
      ${renderMembersList('all', '')}
    </div>
  `;
}

function renderMembersList(filter, search) {
  let list = STATE.members;
  if (filter !== 'all') list = list.filter(m => m.category === filter);
  if (search) list = list.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));

  return list.length ? list.map(m => {
    const c = getCategory(m.category);
    return `
      <div class="list-row" data-member-edit="${m.id}">
        <div class="avatar lg" style="background:${avatarColor(m.name)}">${initials(m.name)}</div>
        <div class="lr-info">
          <div class="lr-title">${m.name}</div>
          <div class="lr-meta">${m.email || ''} · ${c ? c.name : '—'}</div>
        </div>
        <span class="badge green">Ativo</span>
      </div>
    `;
  }).join('') : '<div class="empty-state">Nenhum membro encontrado</div>';
}

function bindAdminMembers() {
  document.querySelector('[data-action="back-admin"]')?.addEventListener('click', () => navigate('admin'));

  let curFilter = 'all', curSearch = '';
  document.querySelectorAll('[data-cat-filter]').forEach(b => {
    b.addEventListener('click', () => {
      document.querySelectorAll('[data-cat-filter]').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      curFilter = b.dataset.catFilter;
      document.getElementById('members-list').innerHTML = renderMembersList(curFilter, curSearch);
      bindMemberRows();
    });
  });

  document.getElementById('search-member')?.addEventListener('input', e => {
    curSearch = e.target.value;
    const list = document.getElementById('members-list');
    if (list) list.innerHTML = renderMembersList(curFilter, curSearch);
    bindMemberRows();
  });

  bindMemberRows();
}

function bindMemberRows() {
  document.querySelectorAll('[data-member-edit]').forEach(el => {
    el.addEventListener('click', () => modalEditMember(el.dataset.memberEdit));
  });
}

function modalEditMember(id) {
  const m = getMember(id);
  if (!m) return;
  openModal({
    title: '✏️ Editar membro',
    body: `
      <div class="field"><label>Nome</label><input id="em-name" value="${m.name}"></div>
      <div class="field"><label>E-mail</label><input id="em-email" value="${m.email || ''}"></div>
      <div class="field">
        <label>Categoria</label>
        <select id="em-cat">
          <option value="">— Sem categoria —</option>
          ${STATE.categories.map(c => `<option value="${c.id}" ${c.id===m.category?'selected':''}>${c.name}</option>`).join('')}
        </select>
      </div>
      <div class="field">
        <label>Papel</label>
        <select id="em-role">
          <option value="member" ${m.role!=='admin'?'selected':''}>🎾 Membro</option>
          <option value="admin"  ${m.role==='admin'?'selected':''}>🔑 Admin</option>
        </select>
      </div>
    `,
    actions: [
      { label: 'Cancelar', class: 'btn-secondary', onClick: closeModal },
      { label: 'Salvar', class: 'btn-primary', onClick: async () => {
        const patch = {
          name:        document.getElementById('em-name').value,
          category_id: document.getElementById('em-cat').value || null,
          role:        document.getElementById('em-role').value,
          updated_at:  new Date().toISOString(),
        };
        closeModal();
        try {
          await TP.Profiles.update(id, patch);
          m.name     = patch.name;
          m.category = patch.category_id;
          m.role     = patch.role;
          navigate('admin-members');
          toast('Membro atualizado', 'success');
        } catch (e) {
          toast('Erro ao salvar', 'error');
        }
      }},
    ],
  });
}

/* -------- ADMIN: COURTS -------- */
function renderAdminCourts() {
  return `
    <div class="row-between mb-md">
      <button class="btn-ghost" data-action="back-admin">← Voltar</button>
      <button class="btn-primary" style="padding:8px 14px;font-size:13px" data-action="new-court">+ Quadra</button>
    </div>

    <div class="section-title">Quadras (${STATE.courts.length})</div>
    ${STATE.courts.map(c => `
      <div class="list-row">
        <div class="avatar lg" style="background:var(--av-teal)">🎾</div>
        <div class="lr-info">
          <div class="lr-title">${c.name}</div>
          <div class="lr-meta">${c.surface}</div>
        </div>
      </div>
    `).join('')}

    <div class="section-title mt-lg">Reservas de hoje</div>
    ${STATE.schedules.length ? STATE.schedules.map(s => {
      const c = getCourt(s.courtId);
      return `
        <div class="card mb-sm">
          <div class="row-between">
            <div>
              <div style="font-weight:700">${c ? c.name : 'Quadra'}</div>
              <div class="muted" style="font-size:13px">${s.start}–${s.end} · ${s.type}</div>
            </div>
          </div>
        </div>
      `;
    }).join('') : '<div class="empty-state">Nenhuma reserva hoje.</div>'}
  `;
}

function bindAdminCourts() {
  document.querySelector('[data-action="back-admin"]')?.addEventListener('click', () => navigate('admin'));
  document.querySelector('[data-action="new-court"]')?.addEventListener('click', () => {
    openModal({
      title: '➕ Nova quadra',
      body: `
        <div class="field"><label>Nome</label><input id="nc-name" placeholder="Ex: Quadra 1"></div>
        <div class="field">
          <label>Superfície</label>
          <select id="nc-surface"><option>Saibro</option><option>Hard</option><option>Grama</option><option>Sintético</option></select>
        </div>
      `,
      actions: [
        { label: 'Cancelar', class: 'btn-secondary', onClick: closeModal },
        { label: 'Criar', class: 'btn-primary', onClick: async () => {
          const name = document.getElementById('nc-name').value.trim();
          if (!name) { toast('Informe o nome', 'error'); return; }
          closeModal();
          try {
            const { data, error } = await TP.sb.from('courts').insert({ name, surface: document.getElementById('nc-surface').value, active: true }).select().single();
            if (error) throw error;
            STATE.courts.push({ id: data.id, name: data.name, surface: data.surface });
            navigate('admin-courts');
            toast('Quadra criada!', 'success');
          } catch (e) {
            toast('Erro ao criar quadra', 'error');
          }
        }},
      ],
    });
  });
}

/* -------- ADMIN: SORTEIO -------- */
function renderAdminDraw() {
  if (!currentDrawCategory) currentDrawCategory = STATE.categories[0]?.id;
  if (drawState.players.length === 0) {
    drawState.players = categoryMembers(currentDrawCategory).map(m => m.id);
    drawState.seeds = [];
  }
  const cat = getCategory(currentDrawCategory);

  return `
    <div class="row-between mb-md">
      <button class="btn-ghost" data-action="back-admin">← Sorteio de Chaves</button>
    </div>

    <div class="draw-step">
      <div class="draw-step-head"><div class="draw-step-num">1</div><div class="draw-step-title">Selecionar Categoria</div></div>
      <div class="chips">
        ${STATE.categories.map(c => `<button class="chip ${c.id === currentDrawCategory ? 'active' : ''}" data-cat-select="${c.id}">${c.name}</button>`).join('')}
      </div>
      <div class="muted mt-sm" style="font-size:13px">Selecionada: <strong>Categoria ${cat?.name}</strong></div>
    </div>

    <div class="draw-step">
      <div class="draw-step-head">
        <div class="draw-step-num">2</div>
        <div class="draw-step-title">Jogadores (${drawState.players.length})</div>
        <button class="btn-ghost" style="margin-left:auto;font-size:13px" data-action="add-player-draw">+ Add</button>
      </div>
      <div id="draw-players">
        ${drawState.players.length ? drawState.players.map(pid => {
          const m = getMember(pid);
          if (!m) return '';
          const isSeed = drawState.seeds.includes(pid);
          return `
            <div class="player-row">
              <div class="avatar" style="background:${avatarColor(m.name)};width:32px;height:32px;font-size:11px">${initials(m.name)}</div>
              <div class="pname">${m.name}</div>
              <div class="pseed ${isSeed ? 'is-seed' : ''}" data-toggle-seed="${pid}">${isSeed ? drawState.seeds.indexOf(pid)+1 : '—'}</div>
              <div class="premove" data-remove-player="${pid}">×</div>
            </div>
          `;
        }).join('') : '<div class="empty-state">Nenhum jogador. Adicione jogadores para sortear.</div>'}
      </div>
    </div>

    <div class="draw-step">
      <div class="draw-step-head"><div class="draw-step-num">3</div><div class="draw-step-title">Cabeças de chave (${drawState.seeds.length})</div></div>
      <div class="draw-step-hint">Toque no badge ao lado do nome para definir como cabeça.</div>
    </div>

    <div class="draw-step">
      <div class="draw-step-head"><div class="draw-step-num">4</div><div class="draw-step-title">Realizar sorteio</div></div>
      <div class="row gap-sm">
        <button class="btn-primary flex-1" data-action="do-draw" ${drawState.players.length < 2 ? 'disabled' : ''}>🎲 Sortear agora</button>
        <button class="btn-secondary" data-action="clear-draw">Limpar</button>
      </div>
    </div>

    ${STATE.brackets[currentDrawCategory]?.drawn ? `
      <div class="card mt-md" style="background:var(--green-soft);border-color:var(--green)">
        <div class="row gap-sm">
          <div style="font-size:24px">✓</div>
          <div class="flex-1">
            <div style="font-weight:700;color:var(--green)">Chaves sorteadas!</div>
            <div class="subtle">Categoria ${cat?.name} já tem chave publicada.</div>
          </div>
          <button class="btn-primary" style="padding:8px 14px;font-size:13px" data-action="view-bracket">Ver chave →</button>
        </div>
      </div>
    ` : ''}
  `;
}

function bindAdminDraw() {
  document.querySelector('[data-action="back-admin"]')?.addEventListener('click', () => navigate('admin'));

  document.querySelectorAll('[data-cat-select]').forEach(b => {
    b.addEventListener('click', () => {
      currentDrawCategory = b.dataset.catSelect;
      drawState = { players: categoryMembers(currentDrawCategory).map(m => m.id), seeds: [] };
      navigate('admin-draw');
    });
  });

  document.querySelectorAll('[data-toggle-seed]').forEach(b => {
    b.addEventListener('click', () => {
      const pid = b.dataset.toggleSeed;
      if (drawState.seeds.includes(pid)) drawState.seeds = drawState.seeds.filter(x => x !== pid);
      else drawState.seeds.push(pid);
      navigate('admin-draw');
    });
  });

  document.querySelectorAll('[data-remove-player]').forEach(b => {
    b.addEventListener('click', () => {
      const pid = b.dataset.removePlayer;
      drawState.players = drawState.players.filter(x => x !== pid);
      drawState.seeds   = drawState.seeds.filter(x => x !== pid);
      navigate('admin-draw');
    });
  });

  document.querySelector('[data-action="add-player-draw"]')?.addEventListener('click', () => {
    const available = STATE.members.filter(m => !drawState.players.includes(m.id));
    if (!available.length) { toast('Todos os membros já estão na lista', 'info'); return; }
    openModal({
      title: 'Adicionar jogador',
      body: `<div class="field"><label>Selecione</label><select id="add-pl-select">${available.map(m => `<option value="${m.id}">${m.name} (${getCategory(m.category)?.name || '—'})</option>`).join('')}</select></div>`,
      actions: [
        { label: 'Cancelar', class: 'btn-secondary', onClick: closeModal },
        { label: 'Adicionar', class: 'btn-primary', onClick: () => {
          drawState.players.push(document.getElementById('add-pl-select').value);
          closeModal(); navigate('admin-draw');
        }},
      ],
    });
  });

  document.querySelector('[data-action="do-draw"]')?.addEventListener('click', async () => {
    const bracket = generateBracket(drawState.players, drawState.seeds);
    if (!bracket) { toast('Adicione pelo menos 2 jogadores', 'error'); return; }
    STATE.brackets[currentDrawCategory] = bracket;
    saveState();

    // Salva no Supabase se tiver torneio ativo
    if (STATE._activeTournamentId) {
      try {
        await TP.Brackets.upsert({
          tournament_id: STATE._activeTournamentId,
          category_id:   currentDrawCategory,
          drawn:         true,
          data:          bracket,
          updated_at:    new Date().toISOString(),
        });
      } catch (e) { console.warn('Erro ao salvar bracket:', e); }
    }

    toast('🎲 Chave sorteada com sucesso!', 'success');
    navigate('admin-draw');
  });

  document.querySelector('[data-action="clear-draw"]')?.addEventListener('click', () => {
    drawState = { players: categoryMembers(currentDrawCategory).map(m => m.id), seeds: [] };
    navigate('admin-draw');
  });

  document.querySelector('[data-action="view-bracket"]')?.addEventListener('click', () => {
    currentBracketCategory = currentDrawCategory;
    currentTournamentTab = 'chave';
    navigate('tournament');
  });
}

/* -------- SETTINGS -------- */
function renderSettings() {
  const s = STATE.settings;
  const isAdmin = STATE.user.role === 'admin';

  return `
    <div class="row-between mb-md">
      <button class="btn-ghost" data-action="back">← ${isAdmin ? 'Personalização Admin' : 'Configurações'}</button>
    </div>

    <div class="settings-group">
      <div class="settings-group-title">Aparência</div>
      <div class="theme-preview-grid">
        <div>
          <div class="theme-preview ${s.theme==='light'?'active':''}" data-theme-set="light"><div class="tp-bar" style="background:#0a0a0a"></div><div class="tp-body" style="background:#faf9f6"></div></div>
          <div class="theme-preview-name">Claro</div>
        </div>
        <div>
          <div class="theme-preview ${s.theme==='dark'?'active':''}" data-theme-set="dark"><div class="tp-bar" style="background:#1a1a1a"></div><div class="tp-body" style="background:#0e0e0e"></div></div>
          <div class="theme-preview-name">Escuro</div>
        </div>
      </div>
      <div class="settings-row">
        <div class="settings-row-info"><div class="settings-row-title">Cor da marca</div><div class="settings-row-desc">Cor principal do app</div></div>
        <input type="color" class="color-input" id="brand-color" value="${s.brandColor}">
      </div>
    </div>

    ${isAdmin ? `
      <div class="settings-group">
        <div class="settings-group-title">Informações do Torneio</div>
        <div style="padding:12px 16px">
          <div class="field"><label>Nome</label><input id="set-tname" value="${s.tournamentName}"></div>
          <div class="field"><label>Local</label><input id="set-tvenue" value="${s.tournamentVenue}"></div>
          <div class="row gap-sm">
            <div class="field flex-1"><label>Início</label><input id="set-tstart" type="date" value="${s.tournamentDateStart}"></div>
            <div class="field flex-1"><label>Fim</label><input id="set-tend" type="date" value="${s.tournamentDateEnd}"></div>
          </div>
        </div>
      </div>

      <div class="settings-group">
        <div class="settings-group-title">Funcionalidades</div>
        <div class="settings-row"><div class="settings-row-info"><div class="settings-row-title">Patrocinadores</div></div><div class="switch ${s.showSponsors?'on':''}" data-toggle="showSponsors"></div></div>
        <div class="settings-row"><div class="settings-row-info"><div class="settings-row-title">Notificações</div></div><div class="switch ${s.enableNotifications?'on':''}" data-toggle="enableNotifications"></div></div>
        <div class="settings-row"><div class="settings-row-info"><div class="settings-row-title">Auto-avançar BYEs</div></div><div class="switch ${s.autoAdvanceWinners?'on':''}" data-toggle="autoAdvanceWinners"></div></div>
      </div>
    ` : ''}

    <div class="settings-group">
      <div class="settings-group-title">Conta</div>
      <div class="settings-row" data-action="logout">
        <div class="settings-row-info"><div class="settings-row-title">Sair</div><div class="settings-row-desc">${STATE.user.email}</div></div>
        <span style="color:var(--text-muted)">›</span>
      </div>
    </div>

    <div class="text-center subtle mt-lg">Tennis Point v4.0 · ${STATE.user.role === 'admin' ? 'Painel Admin' : 'App Membro'}</div>
  `;
}

function bindSettings() {
  document.querySelector('[data-action="back"]')?.addEventListener('click', () => navigate(STATE.user.role === 'admin' ? 'admin' : 'home'));

  document.querySelectorAll('[data-theme-set]').forEach(el => {
    el.addEventListener('click', () => { STATE.settings.theme = el.dataset.themeSet; saveState(); applySettings(); navigate('settings'); });
  });

  document.getElementById('brand-color')?.addEventListener('input', e => { STATE.settings.brandColor = e.target.value; applySettings(); });
  document.getElementById('brand-color')?.addEventListener('change', e => { STATE.settings.brandColor = e.target.value; saveState(); toast('Cor atualizada', 'success'); });

  document.querySelectorAll('[data-toggle]').forEach(el => {
    el.addEventListener('click', () => { STATE.settings[el.dataset.toggle] = !STATE.settings[el.dataset.toggle]; el.classList.toggle('on'); saveState(); });
  });

  ['set-tname','set-tvenue','set-tstart','set-tend'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', e => {
      const map = { 'set-tname':'tournamentName','set-tvenue':'tournamentVenue','set-tstart':'tournamentDateStart','set-tend':'tournamentDateEnd' };
      STATE.settings[map[id]] = e.target.value;
      saveState();
      toast('Salvo', 'success');
    });
  });

  document.querySelector('[data-action="logout"]')?.addEventListener('click', () => logout());
}

/* -------- NOTIFICATIONS -------- */
function renderNotifications() {
  return `
    <div class="row-between mb-md">
      <button class="btn-ghost" data-action="back">← Notificações</button>
    </div>
    ${STATE.notifications.length ? STATE.notifications.map(n => `
      <div class="list-row">
        <div class="result-icon" style="background:var(--bg-soft);font-size:18px">${n.icon}</div>
        <div class="lr-info">
          <div class="lr-title">${n.title}</div>
          <div class="lr-meta">${n.time}</div>
        </div>
        ${!n.read ? '<div style="width:8px;height:8px;border-radius:50%;background:var(--brand-dark)"></div>' : ''}
      </div>
    `).join('') : '<div class="empty-state">Nenhuma notificação.</div>'}
  `;
}

async function markNotifsRead() {
  document.querySelector('[data-action="back"]')?.addEventListener('click', () => navigate('home'));
  const unread = STATE.notifications.filter(n => !n.read);
  STATE.notifications.forEach(n => n.read = true);
  saveState();
  // Marca como lidas no Supabase
  for (const n of unread) {
    try { await TP.Notifications.markRead(n.id); } catch {}
  }
}

/* -------- HELP -------- */
function renderHelp() {
  return `
    <div class="row-between mb-md">
      <button class="btn-ghost" onclick="navigate('home')">← Ajuda</button>
    </div>
    <div class="card mb-md">
      <h3 style="font-family:var(--font-display);font-weight:700;margin-bottom:8px">📖 Como usar</h3>
      <p class="muted" style="font-size:14px">Tennis Point é a plataforma oficial para gerenciar torneios e quadras de tênis.</p>
    </div>
    <div class="card mb-md">
      <h3 style="font-family:var(--font-display);font-weight:700;margin-bottom:8px">📞 Contato</h3>
      <p class="muted" style="font-size:14px">Dúvidas? Fale com o administrador.</p>
    </div>
    <div class="card">
      <h3 style="font-family:var(--font-display);font-weight:700;margin-bottom:8px">🔄 Versão</h3>
      <p class="muted" style="font-size:14px">Tennis Point v4.0 — ${new Date().toLocaleDateString('pt-BR')}</p>
    </div>
  `;
}

/* ==================================================
   ADMIN: CRUD de CATEGORIAS
   ================================================== */
function renderAdminCategories() {
  const cats = STATE.categories || [];
  return `
    <div class="row-between mb-md">
      <button class="btn-ghost" data-action="back-admin">← Categorias</button>
      <button class="btn-primary" data-action="new-cat" style="padding:8px 14px;font-size:13px">+ Nova categoria</button>
    </div>
    <div class="muted mb-sm" style="font-size:13px">Cada categoria tem uma chave (bracket) associada. Excluir categoria apaga a chave também.</div>
    ${cats.length ? cats.map(c => {
      const br = STATE.brackets?.[c.id];
      const entries = (STATE.tournamentPlayers || []).filter(p => p.categoryKey === c.id).length;
      const r1 = br?.rounds?.[0] || '—';
      return `
        <div class="list-row" data-cat-id="${c.id}">
          <div class="avatar lg" style="background:var(--av-blue);font-size:18px">${c.icon || '🎾'}</div>
          <div class="lr-info">
            <div class="lr-title">${c.name}</div>
            <div class="lr-meta">${entries} jogadores · 1ª rodada: ${r1} · ID: <code>${c.id}</code></div>
          </div>
          <button class="btn-ghost" data-edit-cat="${c.id}" style="padding:6px 10px;font-size:12px">✏️</button>
          <button class="btn-ghost" data-delete-cat="${c.id}" style="padding:6px 10px;font-size:12px;color:var(--red)">🗑️</button>
        </div>
      `;
    }).join('') : '<div class="empty-state">Nenhuma categoria. Crie a primeira.</div>'}
  `;
}

function bindAdminCategories() {
  document.querySelector('[data-action="back-admin"]')?.addEventListener('click', () => navigate('admin'));
  document.querySelector('[data-action="new-cat"]')?.addEventListener('click', modalNewCategoryFull);
  document.querySelectorAll('[data-edit-cat]').forEach(b => {
    b.addEventListener('click', () => modalEditCategoryFull(b.dataset.editCat));
  });
  document.querySelectorAll('[data-delete-cat]').forEach(b => {
    b.addEventListener('click', () => modalDeleteCategory(b.dataset.deleteCat));
  });
}

function _slugifyId(name) {
  return 'cat-' + name.normalize('NFD').replace(/[̀-ͯ]/g,'')
    .toLowerCase().replace(/[^a-z0-9]/g, '');
}

function modalNewCategoryFull() {
  openModal({
    title: '➕ Nova categoria',
    body: `
      <div class="field"><label>Nome</label><input id="cat-name" placeholder="Ex: Cat. D"></div>
      <div class="field"><label>Ícone (emoji)</label><input id="cat-icon" placeholder="🎾" maxlength="3" value="🎾"></div>
      <div class="field"><label>Tamanho da chave</label>
        <select id="cat-size">
          <option value="16">16 jogadores (R16 → F)</option>
          <option value="32">32 jogadores (R32 → F)</option>
          <option value="64" selected>64 jogadores (R64 → F)</option>
        </select>
      </div>
      <div class="field"><label>Ordem</label><input id="cat-order" type="number" min="0" max="99" value="${(STATE.categories?.length || 0)}"></div>
      <p class="muted" style="font-size:12px">ID será auto-gerado a partir do nome. Bracket vazio será criado automaticamente.</p>
    `,
    actions: [
      { label: 'Cancelar', class: 'btn-secondary', onClick: closeModal },
      { label: 'Criar', class: 'btn-primary', onClick: async () => {
        const name = document.getElementById('cat-name').value.trim();
        if (!name) { toast('Informe o nome', 'error'); return; }
        const id = _slugifyId(name);
        if (STATE.categories?.find(c => c.id === id)) { toast('Já existe categoria com esse nome/id', 'error'); return; }
        const icon = document.getElementById('cat-icon').value.trim() || '🎾';
        const size = parseInt(document.getElementById('cat-size').value, 10);
        const order = parseInt(document.getElementById('cat-order').value, 10) || 0;
        closeModal();
        try {
          await TP.AdminMutations.createCategory({ id, name, icon, order_index: order });
          if (STATE._activeTournamentId) {
            await TP.AdminMutations.createEmptyBracket(STATE._activeTournamentId, id, size);
          }
          STATE.categories.push({ id, name, icon, color: '--av-blue' });
          STATE.brackets[id] = STATE.brackets[id] || { rounds: [], matches: {}, drawn: false, entries: [] };
          toast(`Categoria "${name}" criada ✅`, 'success');
          await loadAppData();
          navigate('admin-categories');
        } catch (e) {
          toast('Erro: ' + (e.message || 'falha ao criar'), 'error');
        }
      }},
    ],
  });
}

function modalEditCategoryFull(catId) {
  const c = STATE.categories.find(x => x.id === catId);
  if (!c) return;
  openModal({
    title: '✏️ Editar categoria',
    body: `
      <div class="field"><label>Nome</label><input id="cat-name" value="${c.name || ''}"></div>
      <div class="field"><label>Ícone</label><input id="cat-icon" value="${c.icon || '🎾'}" maxlength="3"></div>
      <div class="muted" style="font-size:12px">ID e tamanho não podem ser mudados após criação (causaria estrago no bracket).</div>
    `,
    actions: [
      { label: 'Cancelar', class: 'btn-secondary', onClick: closeModal },
      { label: 'Salvar', class: 'btn-primary', onClick: async () => {
        const name = document.getElementById('cat-name').value.trim();
        const icon = document.getElementById('cat-icon').value.trim() || '🎾';
        if (!name) { toast('Nome obrigatório', 'error'); return; }
        closeModal();
        try {
          await TP.AdminMutations.updateCategory(catId, { name, icon });
          c.name = name; c.icon = icon;
          toast('Categoria atualizada ✅', 'success');
          navigate('admin-categories');
        } catch (e) {
          toast('Erro: ' + (e.message || 'falha'), 'error');
        }
      }},
    ],
  });
}

function modalDeleteCategory(catId) {
  const c = STATE.categories.find(x => x.id === catId);
  if (!c) return;
  openModal({
    title: '🗑️ Excluir categoria',
    sub: c.name,
    body: `
      <p class="muted" style="font-size:14px;margin-bottom:12px">Isso vai apagar a chave inteira e todas as partidas registradas. <strong>Não dá pra desfazer.</strong></p>
      <div class="field"><label>Digite o nome <strong>${c.name}</strong> pra confirmar:</label><input id="cat-confirm" placeholder="${c.name}"></div>
    `,
    actions: [
      { label: 'Cancelar', class: 'btn-secondary', onClick: closeModal },
      { label: 'EXCLUIR', class: 'btn-danger', onClick: async () => {
        const typed = document.getElementById('cat-confirm').value.trim();
        if (typed !== c.name) { toast('Nome não confere', 'error'); return; }
        closeModal();
        try {
          // Apaga bracket primeiro (FK), depois categoria
          if (STATE._activeTournamentId) {
            await TP.Brackets.deleteByCategory(STATE._activeTournamentId, catId);
          }
          await TP.AdminMutations.deleteCategory(catId);
          STATE.categories = STATE.categories.filter(x => x.id !== catId);
          delete STATE.brackets[catId];
          toast(`"${c.name}" excluída`, 'success');
          navigate('admin-categories');
        } catch (e) {
          toast('Erro: ' + (e.message || 'falha'), 'error');
        }
      }},
    ],
  });
}

/* ==================================================
   ADMIN: CRUD de JOGADORES
   ================================================== */
function _uniquePlayers() {
  // Dedupe por email primário (primeiro do accountEmails)
  const byEmail = {};
  (STATE.tournamentPlayers || []).forEach(p => {
    const email = (p.accountEmails && p.accountEmails[0]) || null;
    if (!email) return;
    if (!byEmail[email]) {
      byEmail[email] = { email, name: p.name, categories: new Set(), entryIds: [] };
    }
    byEmail[email].categories.add(p.categoryKey);
    byEmail[email].entryIds.push(p.id);
  });
  return Object.values(byEmail).map(p => ({
    email: p.email, name: p.name,
    categories: [...p.categories],
    entryIds: p.entryIds,
  })).sort((a,b) => a.name.localeCompare(b.name, 'pt-BR'));
}

function renderAdminPlayers() {
  const players = _uniquePlayers();
  const catLabel = id => STATE.categories.find(c => c.id === id)?.name || id;
  return `
    <div class="row-between mb-md">
      <button class="btn-ghost" data-action="back-admin">← Jogadores</button>
      <button class="btn-primary" data-action="new-player" style="padding:8px 14px;font-size:13px">+ Novo</button>
    </div>
    <div class="field mb-sm">
      <input id="player-search" placeholder="🔍 Buscar por nome ou email..." style="border-radius:12px">
    </div>
    <div class="muted mb-sm" style="font-size:12px">${players.length} jogadores únicos. Adicionar/remover entries do bracket — auth.users separadamente (admin SQL).</div>
    <div id="players-list">
      ${players.length ? players.map(p => `
        <div class="list-row" data-player-email="${p.email}">
          <div class="avatar lg" style="background:${avatarColor(p.name)}">${initials(p.name)}</div>
          <div class="lr-info">
            <div class="lr-title">${p.name}</div>
            <div class="lr-meta">${p.email} · ${p.categories.map(catLabel).join(', ') || '—'}</div>
          </div>
          <button class="btn-ghost" data-edit-player="${p.email}" style="padding:6px 10px;font-size:12px">✏️</button>
          <button class="btn-ghost" data-delete-player="${p.email}" style="padding:6px 10px;font-size:12px;color:var(--red)">🗑️</button>
        </div>
      `).join('') : '<div class="empty-state">Nenhum jogador.</div>'}
    </div>
  `;
}

function bindAdminPlayers() {
  document.querySelector('[data-action="back-admin"]')?.addEventListener('click', () => navigate('admin'));
  document.querySelector('[data-action="new-player"]')?.addEventListener('click', modalNewPlayer);
  document.querySelectorAll('[data-edit-player]').forEach(b => {
    b.addEventListener('click', () => modalEditPlayer(b.dataset.editPlayer));
  });
  document.querySelectorAll('[data-delete-player]').forEach(b => {
    b.addEventListener('click', () => modalDeletePlayer(b.dataset.deletePlayer));
  });
  document.getElementById('player-search')?.addEventListener('input', e => {
    document.querySelectorAll('#players-list .list-row').forEach(row => {
      const text = row.textContent.toLowerCase();
      row.style.display = text.includes(q) ? '' : 'none';
    });
  });
}

function _emailFromName(name) {
  return name.normalize('NFD').replace(/[̀-ͯ]/g,'')
    .toLowerCase().replace(/[^a-z0-9]/g,'') + '@tennispointt.com.br';
}

function modalNewPlayer() {
  const cats = STATE.categories || [];
  const catCheckboxes = cats.map(c => `
    <label style="display:flex;align-items:center;gap:8px;padding:6px 0">
      <input type="checkbox" data-new-player-cat="${c.id}"> ${c.icon || '🎾'} ${c.name}
    </label>
  `).join('');
  openModal({
    title: '➕ Novo jogador',
    body: `
      <div class="field"><label>Nome</label><input id="np-name" placeholder="Ex: João da Silva"></div>
      <div class="field"><label>E-mail (auto-gerado, editável)</label><input id="np-email" placeholder="joaosilva@tennispointt.com.br"></div>
      <div class="field"><label>Categorias em que joga:</label>
        <div style="background:var(--bg-soft);padding:10px;border-radius:10px;max-height:160px;overflow-y:auto">
          ${catCheckboxes}
        </div>
      </div>
      <p class="muted" style="font-size:11px">⚠️ Conta de login (auth) NÃO é criada automaticamente. Pra ativar login, admin precisa rodar SQL ou usar bulk script.</p>
    `,
    actions: [
      { label: 'Cancelar', class: 'btn-secondary', onClick: closeModal },
      { label: 'Adicionar', class: 'btn-primary', onClick: async () => {
        const name = document.getElementById('np-name').value.trim();
        let email = document.getElementById('np-email').value.trim();
        if (!name) { toast('Nome obrigatório', 'error'); return; }
        if (!email) email = _emailFromName(name);
        const selectedCats = Array.from(document.querySelectorAll('[data-new-player-cat]:checked')).map(el => el.dataset.newPlayerCat);
        if (!selectedCats.length) { toast('Selecione ao menos 1 categoria', 'error'); return; }
        closeModal();
        try {
          for (const catId of selectedCats) {
            // Adiciona entry no array entries do bracket data
            const br = STATE.brackets[catId];
            if (!br) continue;
            const entryId = `tp26-${catId.replace(/^cat-/, '')}-${_slugifyId(name).replace(/^cat-/,'')}`;
            const newEntry = { id: entryId, name, accountEmails: [email] };
            br.entries = br.entries || [];
            // Evita duplicado por id
            if (!br.entries.find(e => e.id === entryId)) br.entries.push(newEntry);
            // Persiste no Supabase
            if (STATE._activeTournamentId) {
              await TP.Brackets.updateData(STATE._activeTournamentId, catId, br);
            }
            // Atualiza tournamentPlayers local
            STATE.tournamentPlayers = STATE.tournamentPlayers || [];
            if (!STATE.tournamentPlayers.find(p => p.id === entryId)) {
              STATE.tournamentPlayers.push({ id: entryId, name, categoryKey: catId, accountEmails: [email] });
            }
          }
          toast(`${name} adicionado em ${selectedCats.length} categoria(s) ✅`, 'success');
          navigate('admin-players');
        } catch (e) {
          toast('Erro: ' + (e.message || 'falha'), 'error');
        }
      }},
    ],
  });
}

function modalEditPlayer(email) {
  const player = _uniquePlayers().find(p => p.email === email);
  if (!player) return;
  openModal({
    title: '✏️ Editar jogador',
    sub: `${player.categories.length} categoria(s)`,
    body: `
      <div class="field"><label>Nome</label><input id="ep-name" value="${player.name}"></div>
      <div class="field"><label>Email</label><input id="ep-email" value="${player.email}"></div>
      <p class="muted" style="font-size:12px">Mudança de email NÃO altera conta no auth.users (necessário SQL admin).</p>
    `,
    actions: [
      { label: 'Cancelar', class: 'btn-secondary', onClick: closeModal },
      { label: 'Salvar', class: 'btn-primary', onClick: async () => {
        const newName = document.getElementById('ep-name').value.trim();
        const newEmail = document.getElementById('ep-email').value.trim();
        if (!newName || !newEmail) { toast('Nome e email obrigatórios', 'error'); return; }
        closeModal();
        try {
          // Atualiza todos os entries que tinham aquele email
          const affectedCats = new Set();
          (STATE.tournamentPlayers || []).forEach(p => {
            if ((p.accountEmails || []).includes(email)) {
              p.name = newName;
              p.accountEmails = (p.accountEmails || []).map(e => e === email ? newEmail : e);
              affectedCats.add(p.categoryKey);
            }
          });
          // Atualiza entries dentro do bracket data e persiste
          for (const catId of affectedCats) {
            const br = STATE.brackets[catId];
            if (!br) continue;
            (br.entries || []).forEach(e => {
              if ((e.accountEmails || []).includes(email)) {
                e.name = newName;
                e.accountEmails = (e.accountEmails || []).map(x => x === email ? newEmail : x);
              }
            });
            if (STATE._activeTournamentId) {
              await TP.Brackets.updateData(STATE._activeTournamentId, catId, br);
            }
          }
          toast(`${newName} atualizado em ${affectedCats.size} categoria(s) ✅`, 'success');
          navigate('admin-players');
        } catch (e) {
          toast('Erro: ' + (e.message || 'falha'), 'error');
        }
      }},
    ],
  });
}

function modalDeletePlayer(email) {
  const player = _uniquePlayers().find(p => p.email === email);
  if (!player) return;
  openModal({
    title: '🗑️ Remover jogador',
    sub: player.name,
    body: `
      <p class="muted" style="font-size:14px;margin-bottom:12px">Vai remover <strong>${player.name}</strong> de <strong>${player.categories.length}</strong> categoria(s) e dos slots de bracket onde aparece.</p>
      <p class="muted" style="font-size:12px;margin-bottom:12px">⚠️ A conta auth NÃO é deletada (requer SQL admin).</p>
      <div class="field"><label>Digite <strong>${player.name}</strong> pra confirmar:</label><input id="dp-confirm" placeholder="${player.name}"></div>
    `,
    actions: [
      { label: 'Cancelar', class: 'btn-secondary', onClick: closeModal },
      { label: 'REMOVER', class: 'btn-danger', onClick: async () => {
        const typed = document.getElementById('dp-confirm').value.trim();
        if (typed !== player.name) { toast('Nome não confere', 'error'); return; }
        closeModal();
        try {
          // Remove entries de tournamentPlayers
          STATE.tournamentPlayers = (STATE.tournamentPlayers || []).filter(
            p => !(p.accountEmails || []).includes(email)
          );
          // Remove entries de cada bracket data + também limpa slots de matches
          for (const catId of player.categories) {
            const br = STATE.brackets[catId];
            if (!br) continue;
            br.entries = (br.entries || []).filter(e => !(e.accountEmails || []).includes(email));
            // Limpa slots em todos os matches que referenciem entryIds removidos
            const removedIds = new Set(player.entryIds);
            for (const round of br.rounds || []) {
              for (const m of (br.matches[round] || [])) {
                if (removedIds.has(m.p1)) m.p1 = null;
                if (removedIds.has(m.p2)) m.p2 = null;
                if (removedIds.has(m.winner)) m.winner = null;
              }
            }
            if (STATE._activeTournamentId) {
              await TP.Brackets.updateData(STATE._activeTournamentId, catId, br);
            }
          }
          toast(`${player.name} removido ✅`, 'success');
          navigate('admin-players');
        } catch (e) {
          toast('Erro: ' + (e.message || 'falha'), 'error');
        }
      }},
    ],
  });
}

/* -------- MODAL -------- */
function openModal({ title, sub, body, actions }) {
  closeModal();
  const overlay = document.getElementById('modal-overlay');
  const host    = document.getElementById('modal-host');
  const modal   = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-title">${title}</div>
    ${sub ? `<div class="modal-sub">${sub}</div>` : ''}
    <div class="modal-body">${body}</div>
    ${actions ? `<div class="modal-actions">${actions.map((a,i) => `<button class="${a.class||'btn-secondary'}" data-act-idx="${i}">${a.label}</button>`).join('')}</div>` : ''}
  `;
  host.appendChild(modal);
  requestAnimationFrame(() => { overlay.classList.add('open'); modal.classList.add('open'); });
  if (actions) {
    modal.querySelectorAll('[data-act-idx]').forEach(b => {
      b.addEventListener('click', () => actions[parseInt(b.dataset.actIdx)].onClick?.());
    });
  }
}

function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  const host    = document.getElementById('modal-host');
  overlay.classList.remove('open');
  const modal = host.querySelector('.modal');
  if (modal) { modal.classList.remove('open'); setTimeout(() => host.innerHTML = '', 250); }
}

/* -------- TOAST -------- */
function toast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  const icons = { success: '✅', error: '⚠️', info: 'ℹ️' };
  t.innerHTML = `<span>${icons[type] || ''}</span> ${message}`;
  container.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateY(-20px)'; setTimeout(() => t.remove(), 300); }, 2800);
}
