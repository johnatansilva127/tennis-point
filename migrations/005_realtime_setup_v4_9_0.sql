-- ============================================================
-- Tennis Point v4.9.0 — Supabase Realtime + RLS setup
-- ============================================================
-- Rode este script no SQL Editor do Supabase ANTES de fazer o deploy
-- do v4.9.0. Ele é idempotente: pode rodar várias vezes sem dar erro.
--
-- O que faz:
--   1. Habilita Realtime nas tabelas `brackets` e `notifications`.
--   2. Garante que o REPLICA IDENTITY está em FULL (pra que payload.old
--      venha completo nos eventos UPDATE/DELETE).
--   3. Cria/atualiza policies de RLS para SELECT, mantendo o modelo
--      que: qualquer usuário autenticado lê brackets do torneio que
--      participa, e cada usuário lê apenas as próprias notifications.
--
-- Caso você tenha policies customizadas em produção, REVISE a seção 3
-- antes de rodar — o `DROP POLICY IF EXISTS` vai remover qualquer
-- policy com os nomes abaixo.
-- ============================================================


-- ============================================================
-- 1. HABILITAR REALTIME
-- ============================================================
-- A publication `supabase_realtime` é criada automaticamente pelo Supabase.
-- Adicionar tabelas a ela faz com que o Realtime entregue os eventos.

DO $$
BEGIN
  -- brackets
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND tablename = 'brackets'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.brackets';
    RAISE NOTICE 'Realtime habilitado em public.brackets';
  ELSE
    RAISE NOTICE 'public.brackets já estava na publication supabase_realtime';
  END IF;

  -- notifications
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND tablename = 'notifications'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications';
    RAISE NOTICE 'Realtime habilitado em public.notifications';
  ELSE
    RAISE NOTICE 'public.notifications já estava na publication supabase_realtime';
  END IF;
END $$;


-- ============================================================
-- 2. REPLICA IDENTITY FULL
-- ============================================================
-- Sem isso, payload.old nos eventos UPDATE/DELETE só traz a primary key,
-- não a row inteira. O front depende de `category_id` em payload (que vem
-- do new ou do old) pra saber qual bracket re-renderizar.

ALTER TABLE public.brackets REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;


-- ============================================================
-- 3. RLS — POLICIES DE SELECT
-- ============================================================
-- Habilita RLS (idempotente — não causa erro se já estava).

ALTER TABLE public.brackets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;


-- ----- brackets: SELECT para authenticated -----
-- Modelo simples: qualquer usuário autenticado pode LER as brackets.
-- Se você precisa restringir por torneio/clube, ajuste a expressão `using`.

DROP POLICY IF EXISTS "brackets_select_authenticated" ON public.brackets;
CREATE POLICY "brackets_select_authenticated"
  ON public.brackets
  FOR SELECT
  TO authenticated
  USING (true);

-- Opcional: leitura pública anônima (descomente se a tela do torneio
-- é acessível sem login).
-- DROP POLICY IF EXISTS "brackets_select_anon" ON public.brackets;
-- CREATE POLICY "brackets_select_anon"
--   ON public.brackets
--   FOR SELECT
--   TO anon
--   USING (true);


-- ----- notifications: SELECT só do dono -----
-- Cada usuário só vê as próprias notifications. Sem isso, o subscribe
-- vai abrir o canal mas eventos de outros usuários NÃO vão chegar
-- (o que é o comportamento desejado), porém o canal precisa pelo menos
-- conseguir subscrever — então a policy de SELECT é mandatória.

DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
CREATE POLICY "notifications_select_own"
  ON public.notifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());


-- ----- (opcional) brackets: UPDATE só pra admin -----
-- Se você quer que o Realtime continue funcionando em UPDATE mas só admin
-- pode escrever, descomente. Assume coluna `role` na tabela `auth.users`
-- ou função custom `is_admin()`.
--
-- DROP POLICY IF EXISTS "brackets_update_admin" ON public.brackets;
-- CREATE POLICY "brackets_update_admin"
--   ON public.brackets
--   FOR UPDATE
--   TO authenticated
--   USING (auth.jwt() ->> 'role' = 'admin')
--   WITH CHECK (auth.jwt() ->> 'role' = 'admin');


-- ============================================================
-- 4. SANITY CHECK (apenas leitura — pode rodar a qualquer momento)
-- ============================================================
-- Este bloco mostra o status atual. Útil pra confirmar que tudo subiu OK.

SELECT
  'brackets' AS tabela,
  EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'brackets'
  ) AS realtime_ativo,
  (SELECT relreplident::text FROM pg_class WHERE relname = 'brackets') AS replica_identity,
  (SELECT relrowsecurity FROM pg_class WHERE relname = 'brackets') AS rls_ativo,
  (SELECT count(*) FROM pg_policies WHERE tablename = 'brackets') AS policies_count
UNION ALL
SELECT
  'notifications',
  EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'notifications'
  ),
  (SELECT relreplident::text FROM pg_class WHERE relname = 'notifications'),
  (SELECT relrowsecurity FROM pg_class WHERE relname = 'notifications'),
  (SELECT count(*) FROM pg_policies WHERE tablename = 'notifications');

-- Resultado esperado:
--   brackets       | true | f (= FULL) | true | 1 ou 2
--   notifications  | true | f (= FULL) | true | 1
--
-- Nota: relreplident retorna 'f' para FULL, 'd' para DEFAULT, 'n' para NOTHING,
-- 'i' para USING INDEX. Queremos 'f' nas duas tabelas.

-- ============================================================
-- FIM
-- ============================================================
