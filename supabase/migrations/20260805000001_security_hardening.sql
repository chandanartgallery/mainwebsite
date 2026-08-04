-- Production security hardening: reviews auth, profile privacy, admin helpers

-- Helper to avoid recursive RLS on profiles
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;

-- REVIEWS: only authenticated users may insert their own reviews
DROP POLICY IF EXISTS "Allow anyone to submit a review" ON public.reviews;

CREATE POLICY "Allow authenticated users to submit own reviews"
  ON public.reviews
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND auth.uid() = user_id
  );

DROP POLICY IF EXISTS "Allow users to read own reviews" ON public.reviews;
CREATE POLICY "Allow users to read own reviews"
  ON public.reviews
  FOR SELECT
  USING (auth.uid() = user_id);

-- PROFILES: stop public dumping of all profiles (incl. phone)
DROP POLICY IF EXISTS "Allow public read access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;

CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Admins can update any profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id OR public.is_admin());
