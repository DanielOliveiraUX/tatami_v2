-- Cole e execute no SQL Editor do Supabase
-- Corrige o role do usuário já cadastrado

-- Primeiro veja o que existe:
SELECT id, name, role, created_at FROM profiles ORDER BY created_at DESC LIMIT 10;

-- Depois, atualize o role do seu usuário (substitua o email):
UPDATE profiles
SET role = 'owner'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'SEU-EMAIL-AQUI'
);

-- Confirme a mudança:
SELECT p.id, p.name, p.role, u.email
FROM profiles p
JOIN auth.users u ON u.id = p.id
ORDER BY p.created_at DESC LIMIT 5;
