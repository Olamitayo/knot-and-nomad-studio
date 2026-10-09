import { z } from "zod";
import type { Tables } from "@/integrations/supabase/types";
import type { StoreProduct } from "@/lib/products";

export const PRODUCT_REVIEW_HOLD_REASONS: Record<string, string> = {
  "knn-pl-001": "Supplier-sheet image, product-type conflict, and invalid colour value.",
  "knn-pl-002": "Supplier-sheet image, unclear supplier-derived name, and invalid colour value.",
  "knn-pl-003":
    "Primary image shows a polo, conflicting with the tee name; colour labels need review.",
  "knn-pl-004": "Primary image shows a polo, conflicting with the tee name.",
  "knn-pl-005":
    "Colour-series name and listed colour variants are not fully verified by the images.",
  "knn-pl-006":
    "Technical name and description are unverified; colour count conflicts with the description.",
  "knn-pl-007":
    "The image has chest stripes, conflicting with the plain-polo name and striped-collar copy.",
  "knn-pl-008": "Quick-dry performance claim is unsupported; price and availability need review.",
  "knn-pl-009": "Supplier-sheet image, unclear supplier-derived name, and invalid colour value.",
};

const VALID_SIZES = new Set(["XS", "S", "M", "L", "XL", "XXL", "2XL", "3XL", "One Size"]);
const INVALID_COLOUR_TERMS = /\b(ammonia|cotton|turtle|recommended|samurai)\b/i;
const UNSUPPORTED_DESCRIPTION_TERMS =
  /\b(premium|luxury|quick[- ]?dry|performance|japanese|three[- ]?needle|ammonia|recommended)\b/i;

// Keep this empty until the studio has verified products for public sale.
const VERIFIED_READY_TO_WEAR_SLUGS = new Set<string>();

export function isVerifiedReadyToWearSlug(slug: string): boolean {
  return VERIFIED_READY_TO_WEAR_SLUGS.has(slug);
}

export function hasVerifiedReadyToWearProducts(): boolean {
  return VERIFIED_READY_TO_WEAR_SLUGS.size > 0;
}

export function isValidProductSize(size: string): boolean {
  return VALID_SIZES.has(size);
}

export function isValidProductColour(color: string): boolean {
  return Boolean(color.trim()) && !INVALID_COLOUR_TERMS.test(color);
}

export function isCatalogueReadyProduct(product: Partial<StoreProduct>): boolean {
  if (
    !product.slug ||
    !isVerifiedReadyToWearSlug(product.slug) ||
    PRODUCT_REVIEW_HOLD_REASONS[product.slug]
  )
    return false;

  const hasValidPrice =
    typeof product.price_ngn === "number" &&
    Number.isFinite(product.price_ngn) &&
    product.price_ngn > 0;
  const hasStockStatus =
    product.is_sold_out === true ||
    (Number.isFinite(product.stock_level) && (product.stock_level ?? 0) > 0);
  const hasValidSize = Array.isArray(product.sizes) && product.sizes.some(isValidProductSize);
  const hasValidColor = Array.isArray(product.colors) && product.colors.some(isValidProductColour);
  const hasPrimaryImage =
    Array.isArray(product.images) && product.images.some((image) => /^https?:\/\//i.test(image));
  const description = `${product.short_description ?? ""} ${product.description ?? ""}`.trim();
  const hasNeutralDescription =
    description.length > 0 && !UNSUPPORTED_DESCRIPTION_TERMS.test(description);

  return (
    hasValidPrice &&
    hasStockStatus &&
    hasValidSize &&
    hasValidColor &&
    hasPrimaryImage &&
    hasNeutralDescription
  );
}

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
