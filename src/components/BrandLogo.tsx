import { cn } from "@/lib/utils";

type BrandLogoVariant = "primary" | "signature" | "monogram";
type BrandLogoTheme = "dark" | "light";
type BrandLogoSize = "sm" | "md" | "lg";

const dimensions: Record<BrandLogoVariant, { width: number; height: number }> = {
  primary: { width: 490, height: 225 },
  signature: { width: 540, height: 260 },
  monogram: { width: 140, height: 156 },
};

const sizes: Record<BrandLogoVariant, Record<BrandLogoSize, string>> = {
  primary: { sm: "w-24", md: "w-32", lg: "w-44" },
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
  const suffix = theme === "light" ? "-reversed" : "";
  const file =
    variant === "monogram"
      ? `knotnomad-monogram${suffix}.svg`
      : `knotnomad-logo-${variant}${suffix}.svg`;
  const { width, height } = dimensions[variant];
  const alt =
    variant === "signature"
      ? "KnotNomad — Crafted to travel. Made to last."
      : variant === "monogram"
        ? "KnotNomad"
        : "KnotNomad";

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
