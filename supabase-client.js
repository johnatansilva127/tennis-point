/* ==================================================
   TENNIS POINT — Supabase Client v1.0
   Este arquivo substitui o uso de localStorage/STATE
   por chamadas ao banco real (Supabase).
   ================================================== */

// ⚠️ TROCA esses 2 valores pelos do TEU projeto Supabase:
// Project Settings → API → Project URL e anon public key
const SUPABASE_URL = 'https://mhgfarrmyopauqtpdvng.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Qi8veGRmVbT8apc7iKYFow_cjR_UFSF';

// Carrega o SDK do Supabase via CDN
// (adiciona esta tag no index.html ANTES de supabase-client.js:
//  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>)
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// =========================================================
// AUTH — login, cadastro, logout, usuário atual
// =========================================================
const Auth = {
  async signUp(email, password, name) {
    const { data, error } = await sb.auth.signUp({
      email,
      password,
      options: { data: { name } }
    });
    if (error) throw error;
    return data;
  },

  async signIn(email, password) {
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signOut() {
    await sb.auth.signOut();
  },

  async getUser() {
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return null;
    const { data: profile } = await sb
      .from('profiles')
      .select('*, category:categories(*)')
      .eq('id', user.id)
      .single();
    return { ...user, profile };
  },

  onAuthChange(callback) {
    return sb.auth.onAuthStateChange(callback);
  }
};

// =========================================================
// PROFILES
// =========================================================
const Profiles = {
  async list() {
    const { data, error } = await sb
      .from('profiles')
      .select('*, category:categories(*)')
      .order('name');
    if (error) throw error;
    return data;
  },

  async byCategory(categoryId) {
    const { data, error } = await sb
      .from('profiles')
      .select('*')
      .eq('category_id', categoryId)
      .order('name');
    if (error) throw error;
    return data;
  },

  async update(id, patch) {
    const { data, error } = await sb
      .from('profiles')
      .update(patch)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};

// =========================================================
// CATEGORIES
// =========================================================
const Categories = {
  async list() {
    const { data, error } = await sb
      .from('categories')
      .select('*')
      .order('order_index');
    if (error) throw error;
    return data;
  }
};

// =========================================================
// TOURNAMENTS & BRACKETS
// =========================================================
const Tournaments = {
  async active() {
    const { data, error } = await sb
      .from('tournaments')
      .select('*')
      .eq('status', 'active')
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async create(payload) {
    const { data, error } = await sb
      .from('tournaments')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};

const Brackets = {
  async byTournament(tournamentId) {
    const { data, error } = await sb
      .from('brackets')
      .select('*')
      .eq('tournament_id', tournamentId);
    if (error) throw error;
    return data;
  },

  async upsert(payload) {
    const { data, error } = await sb
      .from('brackets')
      .upsert(payload, { onConflict: 'tournament_id,category_id' })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Atualiza a coluna data JSONB de uma bracket específica.
  // Usado pelo admin pra persistir scores/winners.
  async updateData(tournamentId, categoryId, newData) {
    const { data, error } = await sb
      .from('brackets')
      .update({ data: newData, drawn: true })
      .eq('tournament_id', tournamentId)
      .eq('category_id', categoryId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteByCategory(tournamentId, categoryId) {
    const { error } = await sb
      .from('brackets')
      .delete()
      .eq('tournament_id', tournamentId)
      .eq('category_id', categoryId);
    if (error) throw error;
  }
};

// =========================================================
// ADMIN MUTATIONS — CRUD de categorias, brackets e jogadores
// Requer role=admin no profile (RLS permite via policies *_admin_all).
// =========================================================
const AdminMutations = {
  /* Categorias */
  async createCategory({ id, name, icon, order_index }) {
    const { data, error } = await sb
      .from('categories')
      .insert({ id, name, icon, order_index })
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async updateCategory(id, patch) {
    const { data, error } = await sb
      .from('categories')
      .update(patch)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async deleteCategory(id) {
    const { error } = await sb
      .from('categories')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  /* Bracket data — operações que modificam o JSONB */
  async createEmptyBracket(tournamentId, categoryId, size) {
    // Gera estrutura vazia: rounds + matches com slots null
    const data = _buildEmptyBracketData(size);
    const { data: row, error } = await sb
      .from('brackets')
      .insert({ tournament_id: tournamentId, category_id: categoryId, drawn: false, data })
      .select()
      .single();
    if (error) throw error;
    return row;
  },
};

/* Helper: gera estrutura JSONB vazia pra um bracket de tamanho N (16/32/64) */
function _buildEmptyBracketData(size) {
  const rounds = [];
  if (size >= 64) rounds.push('R64');
  if (size >= 32) rounds.push('R32');
  if (size >= 16) rounds.push('R16');
  if (size >= 8)  rounds.push('QF');
  if (size >= 4)  rounds.push('SF');
  rounds.push('F');
  const matches = {};
  let n = 1;
  rounds.forEach((r, ri) => {
    const count = size / Math.pow(2, ri + 1);
    matches[r] = [];
    for (let i = 0; i < count; i++) {
      matches[r].push({
        id: `m-${r.toLowerCase()}-${n}`, n, round: r,
        p1: null, p2: null, scores: [], winner: null,
        isBye: false, walkover_reason: null, date: null, time: null,
      });
      n++;
    }
  });
  return { rounds, matches, drawn: false, publishedAt: null, entries: [] };
}

// =========================================================
// MATCHES
// =========================================================
const Matches = {
  async byBracket(bracketId) {
    const { data, error } = await sb
      .from('matches')
      .select(`
        *,
        player1:player1_id(id, name, avatar_url),
        player2:player2_id(id, name, avatar_url),
        court:court_id(id, name)
      `)
      .eq('bracket_id', bracketId)
      .order('round')
      .order('slot');
    if (error) throw error;
    return data;
  },

  async myMatches(userId) {
    const { data, error } = await sb
      .from('matches')
      .select(`
        *,
        player1:player1_id(id, name),
        player2:player2_id(id, name),
        court:court_id(id, name)
      `)
      .or(`player1_id.eq.${userId},player2_id.eq.${userId}`)
      .order('scheduled_at', { ascending: true });
    if (error) throw error;
    return data;
  },

  // Aluno reporta resultado da PRÓPRIA partida
  async reportResult(matchId, { score, winner_id }) {
    const { data: user } = await sb.auth.getUser();
    const { data, error } = await sb
      .from('matches')
      .update({
        score,
        winner_id,
        status: 'finished',
        reported_by: user.user.id,
        reported_at: new Date().toISOString()
      })
      .eq('id', matchId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};

// =========================================================
// COURTS & BOOKINGS
// =========================================================
const Courts = {
  async list() {
    const { data, error } = await sb
      .from('courts')
      .select('*')
      .eq('active', true)
      .order('name');
    if (error) throw error;
    return data;
  }
};

const Bookings = {
  async byDate(dateISO) {
    // retorna reservas do dia (00:00 a 23:59)
    const start = `${dateISO}T00:00:00-03:00`;
    const end   = `${dateISO}T23:59:59-03:00`;
    const { data, error } = await sb
      .from('bookings')
      .select(`
        *,
        court:court_id(id, name),
        user:user_id(id, name)
      `)
      .eq('status', 'confirmed')
      .gte('start_at', start)
      .lte('start_at', end)
      .order('start_at');
    if (error) throw error;
    return data;
  },

  async create({ court_id, start_at, end_at, notes }) {
    const { data: user } = await sb.auth.getUser();
    const { data, error } = await sb
      .from('bookings')
      .insert({
        court_id,
        user_id: user.user.id,
        start_at,
        end_at,
        notes
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async cancel(bookingId) {
    const { error } = await sb
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId);
    if (error) throw error;
  }
};

// =========================================================
// NOTIFICATIONS
// =========================================================
const Notifications = {
  async mine() {
    const { data, error } = await sb
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    return data;
  },

  async markRead(id) {
    await sb.from('notifications').update({ read: true }).eq('id', id);
  },

  // Admin broadcast pra todo mundo (user_id = null)
  async broadcast({ title, body, type = 'info' }) {
    const { error } = await sb
      .from('notifications')
      .insert({ user_id: null, title, body, type });
    if (error) throw error;
  }
};

// =========================================================
// REALTIME — atualização ao vivo quando dados mudam
// =========================================================
const Realtime = {
  subscribeMatches(bracketId, onChange) {
    return sb
      .channel(`matches:${bracketId}`)
      .on('postgres_changes',
          { event: '*', schema: 'public', table: 'matches', filter: `bracket_id=eq.${bracketId}` },
          onChange)
      .subscribe();
  },

  subscribeBookings(onChange) {
    return sb
      .channel('bookings:all')
      .on('postgres_changes',
          { event: '*', schema: 'public', table: 'bookings' },
          onChange)
      .subscribe();
  },

  subscribeNotifications(userId, onChange) {
    return sb
      .channel(`notif:${userId}`)
      .on('postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications',
            filter: `user_id=eq.${userId}` },
          onChange)
      .subscribe();
  }
};

// Expõe tudo globalmente pro app.js usar
window.TP = { sb, Auth, Profiles, Categories, Tournaments, Brackets, Matches, Courts, Bookings, Notifications, Realtime, AdminMutations };
