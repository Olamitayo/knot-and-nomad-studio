-- The existing "Anyone can update receipt by reference" policy allows any
-- public client to update ANY column on ANY order, including payment_status.
-- That means a client could set payment_status to 'paid' directly without
-- ever actually paying. Restrict the public update policy so it can never
-- set payment_status to 'paid' — only the service role (used server-side,
-- after verifying payment with Paystack) can do that, since service role
-- bypasses RLS entirely.
DROP POLICY IF EXISTS "Anyone can update receipt by reference" ON public.orders;

CREATE POLICY "Anyone can update receipt by reference" ON public.orders
  FOR UPDATE USING (true)
  WITH CHECK (payment_status IS DISTINCT FROM 'paid');
