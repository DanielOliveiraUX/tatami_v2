-- Cole e execute no SQL Editor do Supabase
-- Corrige o trigger para ler o role corretamente dos metadados

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  user_role user_role;
BEGIN
  -- Tenta ler o role dos metadados, padrão é 'student'
  BEGIN
    user_role := (NEW.raw_user_meta_data->>'role')::user_role;
  EXCEPTION WHEN OTHERS THEN
    user_role := 'student';
  END;

  IF user_role IS NULL THEN
    user_role := 'student';
  END IF;

  INSERT INTO public.profiles (id, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    user_role
  )
  ON CONFLICT (id) DO UPDATE
    SET name = EXCLUDED.name,
        role = EXCLUDED.role;

  RETURN NEW;
END;
$$;

-- Confirmar que o trigger está ativo
SELECT tgname, tgenabled FROM pg_trigger WHERE tgname = 'on_auth_user_created';
