import { z } from "zod";
import type { Tables } from "@/integrations/supabase/types";

const galleryItem = z.object({
  url: z.string(),
  color: z.string(),
  shot: z.string(),
});
const variant = z.object({
  colour: z.string(),
  sku: z.string(),
  stockLevel: z.number().finite().nonnegative(),
  images: z.array(z.object({ url: z.string(), shot: z.string() })),
  priceOverride: z.number().finite().nonnegative().nullable().optional(),
});
const sizeGuideRow = z.record(z.string());

function parseRows<T>(value: unknown, schema: z.ZodType<T>): T[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const result = schema.safeParse(item);
    return result.success ? [result.data] : [];
  });
}

// JSON columns must be checked before the storefront or editor uses their fields.
export function parseProductData(product: Tables<"products">) {
  return {
    ...product,
    gallery: parseRows(product.gallery, galleryItem),
    variants: parseRows(product.variants, variant),
    size_guide: parseRows(product.size_guide, sizeGuideRow),
  };
}
