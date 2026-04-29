-- ============================================================
-- TENNIS POINT — Backfill de profiles para os 153 auth.users
-- já criados pela migration de bulk users.
-- Idempotente: ON CONFLICT (id) DO NOTHING.
-- Marca johnatan@tennispointt.com.br como admin.
-- ============================================================

INSERT INTO public.profiles (id, email, name, role)
SELECT
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'name', u.email) AS name,
  CASE
    WHEN u.email = 'johnatan@tennispointt.com.br' THEN 'admin'
    ELSE 'player'
  END AS role
FROM auth.users u
WHERE u.email LIKE '%@tennispointt.com.br'
ON CONFLICT (id) DO NOTHING;

-- Garante o admin mesmo se o profile já existia (caso a 002 rode 2 vezes
-- ou o trigger tenha criado o profile primeiro com role='player').
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'johnatan@tennispointt.com.br' AND role <> 'admin';

-- ============================================================
-- Verificação (rode DEPOIS):
-- SELECT count(*) FROM public.profiles WHERE email LIKE '%@tennispointt.com.br';  -- esperado: 153
-- SELECT email, role FROM public.profiles WHERE role = 'admin';                   -- esperado: johnatan
-- ============================================================
