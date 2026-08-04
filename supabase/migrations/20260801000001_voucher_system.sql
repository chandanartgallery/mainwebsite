-- ============================================================================
-- VOUCHER / COUPON SYSTEM  — Chandan Art Gallery
-- ============================================================================

DO $$ BEGIN
  CREATE TYPE voucher_discount_type AS ENUM (
    'percentage',
    'fixed_amount'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.vouchers (
  id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  code                TEXT          NOT NULL,
  description         TEXT,
  discount_type       voucher_discount_type NOT NULL,
  discount_value      NUMERIC(10,2) NOT NULL DEFAULT 0,
  max_discount        NUMERIC(10,2),
  min_order_value     NUMERIC(10,2),
  max_global_uses     INTEGER,
  max_uses_per_user   INTEGER       NOT NULL DEFAULT 1,
  used_count          INTEGER       NOT NULL DEFAULT 0,
  expiry_date         TIMESTAMPTZ,
  start_date          TIMESTAMPTZ,
  is_active           BOOLEAN       NOT NULL DEFAULT true,
  free_delivery       BOOLEAN       NOT NULL DEFAULT false,
  first_order_only    BOOLEAN       NOT NULL DEFAULT false,
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  created_by          UUID          REFERENCES auth.users(id),
  CONSTRAINT vouchers_code_unique UNIQUE (code)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_vouchers_code_upper ON public.vouchers (UPPER(code));
CREATE INDEX IF NOT EXISTS idx_vouchers_is_active ON public.vouchers (is_active);
CREATE INDEX IF NOT EXISTS idx_vouchers_expiry ON public.vouchers (expiry_date);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_voucher_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS vouchers_updated_at ON public.vouchers;
CREATE TRIGGER vouchers_updated_at
  BEFORE UPDATE ON public.vouchers
  FOR EACH ROW EXECUTE FUNCTION public.set_voucher_updated_at();

-- RLS
ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

DROP POLICY IF EXISTS "vouchers_public_read"  ON public.vouchers;
DROP POLICY IF EXISTS "vouchers_admin_all"    ON public.vouchers;

CREATE POLICY "vouchers_public_read"
  ON public.vouchers FOR SELECT USING (is_active = true);

CREATE POLICY "vouchers_admin_all"
  ON public.vouchers FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());
