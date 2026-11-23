import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { StudioHomepage } from "@/features/three/homepage/StudioHomepage";
import { supabase } from "@/integrations/supabase/client";
import { formatNaira } from "@/lib/format";
import { hasVerifiedReadyToWearProducts, isCatalogueReadyProduct } from "@/lib/product-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Knot & Nomad — Custom Premium Apparel | Rooted in Motion" },
      {
        name: "description",
        content:
          "Knot & Nomad is a custom-apparel studio. Ready-to-wear releases are coming soon; share a brief with the studio.",
      },
      { property: "og:title", content: "Knot & Nomad — Custom Premium Apparel" },
      {
        property: "og:description",
        content: "A custom-apparel studio. Ready-to-wear releases are coming soon.",
      },
      { property: "og:image", content: "https://knotnomad.com/og-knotnomad.png" },
      { name: "twitter:image", content: "https://knotnomad.com/og-knotnomad.png" },
    ],
  }),
  component: Home,
});

type HomeProduct = {
  id: string;
  slug: string;
  name: string;
  category: string;
  price_ngn: number;
  starting_price_ngn?: number | null;
  stock_level?: number;
  is_sold_out?: boolean;
  is_ready_to_wear?: boolean;
  images: string[];
  colors: string[];
  sizes: string[];
  short_description: string | null;
  description?: string | null;
  is_customizable: boolean;
};

function Home() {
  const [featured, setFeatured] = useState<HomeProduct[]>([]);
  useEffect(() => {
    if (!hasVerifiedReadyToWearProducts()) return;

    supabase
      .from("products")
      .select(
        "id,slug,name,category,price_ngn,starting_price_ngn,stock_level,is_sold_out,is_ready_to_wear,images,colors,sizes,short_description,description,is_customizable",
      )
      .eq("is_active", true)
      .order("is_bestseller", { ascending: false })
      .order("sort_order")
      .then(({ data, error }) =>
        setFeatured(error ? [] : (data ?? []).filter(isCatalogueReadyProduct).slice(0, 4)),
      );
  }, []);
  return (
    <StudioHomepage>
      {featured.length > 0 && <FeaturedProducts products={featured} />}
    </StudioHomepage>
  );
}

function FeaturedProducts({ products }: { products: HomeProduct[] }) {
  return (
    <section
      aria-labelledby="featured-heading"
      className="mx-auto max-w-7xl px-6 py-14 sm:py-20 lg:px-10 lg:py-24"
    >
      <div className="mb-8 flex items-end justify-between gap-4 sm:mb-10">
        <div>
          <p className="eyebrow">Ready-to-wear</p>
          <h2 id="featured-heading" className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl">
            Selected pieces.
          </h2>
        </div>
        <Link
          to="/shop"
          className="inline-flex min-h-11 items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em]"
        >
          Ready-to-wear <ArrowRight size={14} />
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {products.map((product) => {
          const hasStartingPrice =
            product.starting_price_ngn != null && product.starting_price_ngn !== product.price_ngn;
          const unavailable = product.is_sold_out === true;
          return (
            <Link
              key={product.id}
              to="/shop/$slug"
              params={{ slug: product.slug }}
              className="group block overflow-hidden border border-border bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                {product.images[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    loading="lazy"
                    decoding="async"
                    width={900}
                    height={1125}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.025]"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Image unavailable
                  </div>
                )}
                <span className="absolute left-3 top-3 bg-background/95 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.16em]">
                  {product.category}
                </span>
              </div>
              <div className="p-4 sm:p-5">
                <h3 className="font-display text-xl leading-tight sm:text-2xl">{product.name}</h3>
                <div className="mt-4 flex flex-wrap items-baseline justify-between gap-2 border-t border-border pt-3">
                  <p className="text-sm font-semibold">
                    {hasStartingPrice ? (
                      <span className="mr-1 text-xs font-normal text-muted-foreground">From</span>
                    ) : null}
                    {formatNaira(product.starting_price_ngn ?? product.price_ngn)}
                  </p>
                  <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    {unavailable
                      ? "Unavailable"
                      : product.stock_level && product.stock_level > 0
                        ? "In stock"
                        : product.is_ready_to_wear === false
                          ? "Made to order"
                          : "Check availability"}
                  </p>
                </div>
                <span className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 bg-foreground px-4 text-[10px] font-bold uppercase tracking-[0.16em] text-primary-foreground transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                  View piece <ArrowRight size={14} />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
