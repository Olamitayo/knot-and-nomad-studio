export type PerformanceTier = "high" | "medium" | "fallback";
export type ProductModelVariant = {
  productId: string;
  variantSku?: string;
  colour: string;
  modelUrl: string;
  posterUrl: string;
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
};
