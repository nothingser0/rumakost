CREATE TABLE IF NOT EXISTS public.tenant_profiles (
  user_id UUID NOT NULL,
  emergency_contact TEXT,
  CONSTRAINT tenant_profiles_pkey PRIMARY KEY (user_id)
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.tenant_profiles'::regclass
      AND conname = 'tenant_profiles_user_id_fkey'
  ) THEN
    ALTER TABLE public.tenant_profiles
      ADD CONSTRAINT tenant_profiles_user_id_fkey
      FOREIGN KEY (user_id)
      REFERENCES public.app_users(id)
      ON DELETE RESTRICT
      ON UPDATE CASCADE;
  END IF;
END;
$$;
