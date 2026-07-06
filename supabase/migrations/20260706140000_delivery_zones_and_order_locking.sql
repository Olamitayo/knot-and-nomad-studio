-- Area-based delivery fees for Lagos, managed by admins.
CREATE TABLE public.delivery_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  area_name TEXT NOT NULL UNIQUE,
  fee_ngn INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.delivery_zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read delivery zones" ON public.delivery_zones
  FOR SELECT USING (true);
CREATE POLICY "Admins can manage delivery zones" ON public.delivery_zones
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Orders outside Lagos need their delivery fee negotiated after the order is
-- placed (over WhatsApp), rather than known upfront like Lagos zone fees or
-- free pickup. delivery_area records which Lagos zone was picked (if any).
ALTER TABLE public.orders ADD COLUMN delivery_area TEXT;
ALTER TABLE public.orders ADD COLUMN delivery_fee_status TEXT NOT NULL DEFAULT 'confirmed'
  CHECK (delivery_fee_status IN ('confirmed', 'pending_negotiation'));

-- Fix a regression: admin.orders.tsx updates orders via the public anon key
-- client (relying on RLS, not the service role), but the only UPDATE policy
-- on this table was the public "anyone can update receipt by reference" one
-- — which a prior migration restricted from ever setting payment_status to
-- 'paid'. That inadvertently blocked admins too. Give admins their own policy.
CREATE POLICY "Admins can update orders" ON public.orders
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Separately, the public update policy's WITH CHECK only ever restricted the
-- payment_status value — it never actually restricted which OTHER columns a
-- fully anonymous client could change. That means anyone could currently
-- rewrite their own order's total_ngn/delivery_fee_ngn/status before paying
-- (e.g. lower the total, then pay that lower amount — Paystack verification
-- compares against whatever total_ngn says, so a tampered total would
-- "match"). This matters even more now that delivery_fee_ngn/status are
-- negotiated server-side by an admin, not the customer. Lock it down with a
-- trigger: non-admin, non-service-role callers may only touch receipt_url
-- and payment_status.
CREATE OR REPLACE FUNCTION public.restrict_public_order_updates()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.role() = 'service_role' OR public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;

  IF NEW.full_name IS DISTINCT FROM OLD.full_name
     OR NEW.email IS DISTINCT FROM OLD.email
     OR NEW.phone IS DISTINCT FROM OLD.phone
     OR NEW.whatsapp IS DISTINCT FROM OLD.whatsapp
     OR NEW.address IS DISTINCT FROM OLD.address
     OR NEW.city IS DISTINCT FROM OLD.city
     OR NEW.state IS DISTINCT FROM OLD.state
     OR NEW.delivery_option IS DISTINCT FROM OLD.delivery_option
     OR NEW.delivery_area IS DISTINCT FROM OLD.delivery_area
     OR NEW.delivery_fee_status IS DISTINCT FROM OLD.delivery_fee_status
     OR NEW.subtotal_ngn IS DISTINCT FROM OLD.subtotal_ngn
     OR NEW.delivery_fee_ngn IS DISTINCT FROM OLD.delivery_fee_ngn
     OR NEW.total_ngn IS DISTINCT FROM OLD.total_ngn
     OR NEW.payment_method IS DISTINCT FROM OLD.payment_method
     OR NEW.status IS DISTINCT FROM OLD.status
     OR NEW.reference IS DISTINCT FROM OLD.reference
  THEN
    RAISE EXCEPTION 'Only receipt_url and payment_status may be updated directly.';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER restrict_public_order_updates_trigger
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.restrict_public_order_updates();
