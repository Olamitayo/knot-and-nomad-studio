ALTER TABLE public.products
  ADD COLUMN sku TEXT,
  ADD COLUMN stock_level INTEGER NOT NULL DEFAULT 100 CHECK (stock_level >= 0),
  ADD COLUMN material TEXT,
  ADD COLUMN fit TEXT,
  ADD COLUMN care_instructions TEXT,
  ADD COLUMN delivery_estimate TEXT;

CREATE UNIQUE INDEX products_sku_unique
  ON public.products (upper(sku))
  WHERE sku IS NOT NULL AND length(trim(sku)) > 0;

COMMENT ON COLUMN public.products.sku IS 'One SKU per style; colour variants live in colors and gallery.';
