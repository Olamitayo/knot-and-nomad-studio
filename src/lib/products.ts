import fallbackEditorial from "@/assets/hero-editorial.jpg";
import trouserImage from "@/assets/cat-streetwear.jpg";
import teeImage from "@/assets/cat-tshirt.jpg";
import jacketImage from "@/assets/cat-hoodie.jpg";
import look1 from "@/assets/look-1.jpg";
import look2 from "@/assets/look-2.jpg";
import look3 from "@/assets/look-3.jpg";

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
  isFallback?: boolean;
}

export const fallbackProducts: StoreProduct[] = [
  {
    id: "fallback-trouser",
    slug: "nomad-ribbed-wide-leg-trousers",
    name: "Nomad Ribbed Wide-Leg Trousers",
    short_description: "A fluid wide-leg silhouette with a clean structured waist.",
    description: "A studio reference product shown while the live catalogue reconnects.",
    category: "Bottoms",
    subcategory: "Wide-Leg Trousers",
    price_ngn: 28000,
    images: [trouserImage, look1, look2],
    gallery: [
      { url: trouserImage, color: "Ice Blue", shot: "Editorial" },
      { url: look1, color: "Ice Blue", shot: "Front" },
      { url: look2, color: "Brown", shot: "Styling reference" },
    ],
    sizes: ["S", "M", "L", "XL", "2XL"],
    colors: ["Ice Blue", "Brown", "Black"],
    sku: "KNN-WLT-001",
    stock_level: 0,
    is_sold_out: false,
    is_new_arrival: true,
    is_bestseller: true,
    is_customizable: true,
    is_ready_to_wear: true,
    material: "Ribbed stretch blend",
    fit: "High-rise, relaxed wide leg",
    care_instructions: "Cold gentle wash; hang dry.",
    delivery_estimate: "5–7 working days",
    product_tags: ["Ready-to-wear"],
    isFallback: true,
  },
  {
    id: "fallback-tee",
    slug: "nomad-heavyweight-oversized-tee",
    name: "Nomad Heavyweight Oversized Tee",
    short_description: "A substantial everyday tee cut with room through the body.",
    category: "Tops",
    subcategory: "Oversized Tees",
    price_ngn: 18000,
    images: [teeImage, look3, fallbackEditorial],
    gallery: [],
    sizes: ["S", "M", "L", "XL", "2XL"],
    colors: ["Cream", "Black", "Brown"],
    sku: "KNN-TEE-001",
    stock_level: 0,
    is_sold_out: false,
    is_new_arrival: true,
    is_bestseller: false,
    is_customizable: true,
    is_ready_to_wear: true,
    material: "240gsm cotton",
    fit: "Oversized",
    care_instructions: "Wash inside out on cold.",
    delivery_estimate: "3–5 working days",
    product_tags: ["Ready-to-wear", "Customisable"],
    isFallback: true,
  },
  {
    id: "fallback-jacket",
    slug: "rooted-zip-jacket",
    name: "Rooted Zip Jacket",
    short_description: "A clean zip layer designed for everyday movement.",
    category: "Jackets",
    subcategory: "Zip Jackets",
    price_ngn: 35000,
    images: [jacketImage, fallbackEditorial, look2],
    gallery: [],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Charcoal", "Cream"],
    sku: "KNN-JKT-001",
    stock_level: 0,
    is_sold_out: false,
    is_new_arrival: false,
    is_bestseller: true,
    is_customizable: false,
    is_ready_to_wear: true,
    material: "Premium cotton blend",
    fit: "Relaxed",
    care_instructions: "Cool wash; do not bleach.",
    delivery_estimate: "5–7 working days",
    product_tags: ["Ready-to-wear"],
    isFallback: true,
  },
];

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
