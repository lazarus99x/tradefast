-- Make lazarus99x@gmail.com an admin
-- Run this in your Supabase SQL Editor

UPDATE public.profiles
SET role = 'admin'
WHERE email = 'lazarus99x@gmail.com';

-- Verify
SELECT email, role, full_name
FROM public.profiles
WHERE email = 'lazarus99x@gmail.com';
