ALTER TABLE public.products
  ADD COLUMN subcategory TEXT,
  ADD COLUMN starting_price_ngn INTEGER CHECK (starting_price_ngn IS NULL OR starting_price_ngn >= 0),
  ADD COLUMN is_ready_to_wear BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN product_tags TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN variants JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN size_guide JSONB NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.products.variants IS
'Array of {colour, sku, stockLevel, images, priceOverride}; images use {url, shot}.';
COMMENT ON COLUMN public.products.size_guide IS
'Array of measurement rows. Expected keys depend on product group: tops, bottoms, or native wear.';
