-- ============================================================
-- FIX 1: Create auto-profile trigger for new signups
-- FIX 2: Create profiles for existing users missing them
-- FIX 3: Make lazarus99x@gmail.com an admin
-- ============================================================

-- 1. Create the trigger function (auto-creates profile on signup)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    'user'
  );

  INSERT INTO public.user_balances (user_id, balance, account_balance, profit_balance, trading_balance, funding_balance)
  VALUES (NEW.id, 0, 0, 0, 0, 0);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if present
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. Backfill: create profiles for existing users who don't have one
INSERT INTO public.profiles (user_id, email, full_name, role)
SELECT 
  id::text,
  email,
  raw_user_meta_data->>'full_name',
  'user'
FROM auth.users
WHERE id::text NOT IN (SELECT user_id FROM public.profiles)
ON CONFLICT (user_id) DO NOTHING;

-- Also backfill balances
INSERT INTO public.user_balances (user_id, balance, account_balance, profit_balance, trading_balance, funding_balance)
SELECT id::text, 0, 0, 0, 0, 0
FROM auth.users
WHERE id::text NOT IN (SELECT user_id FROM public.user_balances)
ON CONFLICT (user_id) DO NOTHING;

-- 3. Make lazarus99x@gmail.com an admin
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'lazarus99x@gmail.com';

-- 4. Verify
SELECT '✅ Trigger created' AS result;
SELECT email, role, full_name, created_at FROM public.profiles ORDER BY created_at DESC LIMIT 10;