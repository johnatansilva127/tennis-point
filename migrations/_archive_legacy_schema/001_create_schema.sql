-- ============================================================
-- TENNIS POINT — Schema base (profiles, tournaments, categories,
-- bracket_entries, matches) + RLS + trigger on_auth_user_created.
-- Idempotente: usa IF NOT EXISTS / OR REPLACE.
-- Sem BEGIN/COMMIT (rodado via execute_sql).
-- ============================================================

-- Extensão de UUID (auth.users.id já é uuid; profiles vai espelhar)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============ PROFILES ============
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'player' CHECK (role IN ('player','admin')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============ TOURNAMENTS ============
CREATE TABLE IF NOT EXISTS public.tournaments (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  year        INT  NOT NULL,
  status      TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','finished','draft')),
  start_date  DATE,
  end_date    DATE,
  venue       TEXT,
  created_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============ CATEGORIES ============
CREATE TABLE IF NOT EXISTS public.categories (
  id             TEXT PRIMARY KEY,
  tournament_id  TEXT NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  display_order  INT  NOT NULL DEFAULT 0,
  size           INT  NOT NULL CHECK (size IN (16,32,64)),
  first_round    TEXT NOT NULL CHECK (first_round IN ('R64','R32','R16'))
);

-- ============ BRACKET_ENTRIES ============
CREATE TABLE IF NOT EXISTS public.bracket_entries (
  id              TEXT PRIMARY KEY,
  category_id     TEXT NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  display_label   TEXT NOT NULL,
  account_emails  TEXT[] NOT NULL DEFAULT '{}',
  is_pair         BOOLEAN GENERATED ALWAYS AS (cardinality(account_emails) > 1) STORED,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============ MATCHES ============
CREATE TABLE IF NOT EXISTS public.matches (
  id                TEXT PRIMARY KEY,
  category_id       TEXT NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  round             TEXT NOT NULL CHECK (round IN ('R64','R32','R16','QF','SF','F')),
  match_number      INT  NOT NULL,
  player1_entry_id  TEXT REFERENCES public.bracket_entries(id) ON DELETE SET NULL,
  player2_entry_id  TEXT REFERENCES public.bracket_entries(id) ON DELETE SET NULL,
  winner_entry_id   TEXT REFERENCES public.bracket_entries(id) ON DELETE SET NULL,
  score             JSONB,
  walkover_reason   TEXT,
  is_bye            BOOLEAN NOT NULL DEFAULT false,
  scheduled_at      TIMESTAMPTZ,
  played_at         TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (category_id, round, match_number)
);

-- ============ INDICES ============
CREATE INDEX IF NOT EXISTS idx_bracket_entries_category ON public.bracket_entries (category_id);
CREATE INDEX IF NOT EXISTS idx_bracket_entries_emails   ON public.bracket_entries USING gin (account_emails);
CREATE INDEX IF NOT EXISTS idx_matches_category_round   ON public.matches (category_id, round);
CREATE INDEX IF NOT EXISTS idx_matches_p1               ON public.matches (player1_entry_id);
CREATE INDEX IF NOT EXISTS idx_matches_p2               ON public.matches (player2_entry_id);

-- ============ RLS ============
ALTER TABLE public.profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournaments     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bracket_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches         ENABLE ROW LEVEL SECURITY;

-- Helper: é admin?
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin');
$$;

-- Policies (DROP IF EXISTS antes pra ser idempotente)
DROP POLICY IF EXISTS profiles_select_all   ON public.profiles;
DROP POLICY IF EXISTS profiles_update_self  ON public.profiles;
CREATE POLICY profiles_select_all  ON public.profiles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY profiles_update_self ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.is_admin())
  WITH CHECK (id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS tournaments_select_all ON public.tournaments;
DROP POLICY IF EXISTS tournaments_admin_all  ON public.tournaments;
CREATE POLICY tournaments_select_all ON public.tournaments FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY tournaments_admin_all  ON public.tournaments FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS categories_select_all ON public.categories;
DROP POLICY IF EXISTS categories_admin_all  ON public.categories;
CREATE POLICY categories_select_all ON public.categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY categories_admin_all  ON public.categories FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS bracket_entries_select_all ON public.bracket_entries;
DROP POLICY IF EXISTS bracket_entries_admin_all  ON public.bracket_entries;
CREATE POLICY bracket_entries_select_all ON public.bracket_entries FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY bracket_entries_admin_all  ON public.bracket_entries FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS matches_select_all ON public.matches;
DROP POLICY IF EXISTS matches_admin_all  ON public.matches;
CREATE POLICY matches_select_all ON public.matches FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY matches_admin_all  ON public.matches FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============ TRIGGER on_auth_user_created ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id, NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    'player'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ updated_at trigger pra profiles ============
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_touch_updated_at ON public.profiles;
CREATE TRIGGER profiles_touch_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
