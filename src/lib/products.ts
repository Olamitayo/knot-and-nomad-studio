export type GalleryItem = { url: string; color: string; shot: string };
export type VariantImage = { url: string; shot: string };
export type ProductVariant = {
  colour: string;
  sku: string;
  stockLevel: number;
  images: VariantImage[];
  priceOverride?: number | null;
};
export type SizeGuideRow = Record<string, string>;

export interface StoreProduct {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  description?: string | null;
  category: string;
  subcategory?: string | null;
  price_ngn: number;
  starting_price_ngn?: number | null;
  images: string[];
  gallery?: GalleryItem[];
  sizes: string[];
  colors: string[];
  sku: string | null;
  stock_level: number;
  is_sold_out: boolean;
  is_new_arrival: boolean;
  is_bestseller: boolean;
  is_customizable: boolean;
  is_ready_to_wear?: boolean;
  material?: string | null;
  fit?: string | null;
  care_instructions?: string | null;
  delivery_estimate?: string | null;
  product_tags?: string[];
  variants?: ProductVariant[];
  size_guide?: SizeGuideRow[];
}

export function productGroup(product: Pick<StoreProduct, "category" | "name">) {
  const value = `${product.category} ${product.name}`.toLowerCase();
  if (/cap|tote|patch|accessor/.test(value)) return "Accessories";
  if (/native|embroider|panel/.test(value)) return "Native Wear";
  if (/jacket|cropped|wool/.test(value)) return /set/.test(value) ? "Sets" : "Jackets";
  if (/trouser|cargo|pants|bottom/.test(value)) return /set/.test(value) ? "Sets" : "Bottoms";
  if (/set|co-ord|coord/.test(value)) return "Sets";
  return "Tops";
}

export function displayPrice(product: StoreProduct, colour?: string) {
  const variantPrice = product.variants?.find(
    (variant) => variant.colour.toLowerCase() === colour?.toLowerCase(),
  )?.priceOverride;
  return variantPrice || product.starting_price_ngn || product.price_ngn;
}
