ALTER TABLE public.products
ADD COLUMN gallery JSONB NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.products.gallery IS
'Ordered array of {url, color, shot}; shot is Editorial, Front, Back, Flat lay, Fabric close-up, Detail, Size chart, or Styling reference.';
