import { cn } from "@/lib/utils";

type BrandLogoVariant = "primary" | "signature" | "monogram";
type BrandLogoTheme = "dark" | "light";
type BrandLogoSize = "sm" | "md" | "lg";

const dimensions: Record<BrandLogoVariant, { width: number; height: number }> = {
  primary: { width: 980, height: 300 },
  signature: { width: 980, height: 300 },
  monogram: { width: 300, height: 300 },
};

const sizes: Record<BrandLogoVariant, Record<BrandLogoSize, string>> = {
  primary: { sm: "w-24", md: "w-40 sm:w-44", lg: "w-44" },
  signature: { sm: "w-36", md: "w-52", lg: "w-64" },
  monogram: { sm: "w-8", md: "w-11", lg: "w-14" },
};

export function BrandLogo({
  variant = "primary",
  theme = "dark",
  size = "md",
  priority = false,
  decorative = false,
  className,
}: {
  variant?: BrandLogoVariant;
  theme?: BrandLogoTheme;
  size?: BrandLogoSize;
  priority?: boolean;
  decorative?: boolean;
  className?: string;
}) {
  const suffix = theme === "light" ? "-light" : "";
  const file = `knot-mark-${variant === "monogram" ? "icon" : "horizontal"}${suffix}.svg`;
  const { width, height } = dimensions[variant];
  const alt = "Knot & Nomad — Rooted in Motion";

  return (
    <img
      src={`/brand/${file}`}
      width={width}
      height={height}
      alt={decorative ? "" : alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      className={cn("block h-auto shrink-0", sizes[variant][size], className)}
    />
  );
}
