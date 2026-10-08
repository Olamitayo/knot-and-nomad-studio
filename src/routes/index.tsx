import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, MessageCircle } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";
import { supabase } from "@/integrations/supabase/client";
import { formatNaira } from "@/lib/format";
import { whatsappLink } from "@/lib/site";
import { isCatalogueReadyProduct } from "@/lib/product-data";

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
  const ref = useReveal();
  const [featured, setFeatured] = useState<HomeProduct[]>([]);
  useEffect(() => {
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
    <div ref={ref}>
      {/* HERO */}
      <section className="relative isolate min-h-[480px] overflow-hidden bg-[#29231f] text-white sm:min-h-[620px] lg:min-h-[min(820px,calc(100svh-5rem))]">
        <img
          src="/images/lookbook/PHOTO-2026-07-09-19-39-06.jpg"
          alt="The Knot & Nomad studio showroom, with a curated garment rail and fitting mirror."
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 -z-0 bg-gradient-to-r from-black/75 via-black/45 to-black/5" />
        <div className="absolute inset-0 -z-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />
        <div className="relative z-10 mx-auto flex min-h-[480px] max-w-[1600px] items-center px-5 py-12 sm:min-h-[620px] sm:items-end sm:px-10 sm:pb-24 sm:pt-24 lg:min-h-[min(820px,calc(100svh-5rem))] lg:px-16">
          <div className="max-w-3xl">
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/75 sm:text-[10px]">
              Knot &amp; Nomad · Lagos studio
            </p>
            <h1 className="mt-5 max-w-3xl font-display text-4xl leading-[0.9] tracking-[-0.07em] sm:text-7xl lg:text-8xl">
              Apparel for your world.
              <br />
              <span className="text-[#b7c8b3]">Ready or custom.</span>
            </h1>
            <p className="mt-6 max-w-lg text-sm leading-7 text-white/80 sm:text-base">
              KnotNomad is a custom-apparel studio. Ready-to-wear releases are coming soon.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/custom-order"
                className="btn-pill inline-flex items-center gap-2 bg-white px-6 py-4 text-[10px] font-bold uppercase tracking-[0.18em] text-[#171411] transition-colors hover:bg-[#b7c8b3]"
              >
                Start a custom brief <ArrowRight size={15} />
              </Link>
              <Link
                to="/shop"
                className="btn-pill inline-flex items-center border border-white/65 px-6 py-4 text-[10px] font-bold uppercase tracking-[0.18em] text-white transition-colors hover:border-white hover:bg-white hover:text-[#171411]"
              >
                Ready-to-wear coming soon
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-6 right-6 z-10 text-right text-[8px] font-bold uppercase tracking-[0.22em] text-white/75 sm:bottom-8 sm:right-10 lg:right-16">
          Inside the studio · Lagos, Nigeria
        </div>
      </section>

      {featured.length > 0 && <FeaturedProducts products={featured} />}

      <section className="border-y border-border bg-foreground text-primary-foreground">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-14 lg:grid-cols-[0.8fr_1.2fr] lg:px-10 lg:py-18">
          <div>
            <p className="eyebrow !text-primary-foreground/60">Custom apparel</p>
            <h2 className="mt-4 font-display text-4xl leading-none sm:text-5xl">
              Your idea, made <span className="text-[#b7c8b3]">wearable.</span>
            </h2>
            <p className="mt-5 max-w-md text-sm leading-6 text-primary-foreground/70">
              Brief the studio on a single piece, a uniform or a capsule collection. We’ll confirm
              the specification, quote and timeline for your approval before production.
            </p>
            <Link
              to="/custom-order"
              className="mt-7 inline-flex min-h-12 items-center gap-2 bg-accent px-6 text-xs font-bold uppercase tracking-[0.18em] text-accent-foreground transition hover:bg-primary-foreground hover:text-foreground"
            >
              Start a custom brief <ArrowRight size={15} />
            </Link>
          </div>
          <div className="grid gap-px bg-primary-foreground/20 sm:grid-cols-2">
            {["Individual pieces", "Creative projects", "Team uniforms", "Capsule collections"].map(
              (item) => (
                <div
                  key={item}
                  className="flex items-center gap-4 bg-foreground px-5 py-5 text-sm font-semibold"
                >
                  <span className="text-accent" aria-hidden="true">
                    ✦
                  </span>
                  {item}
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* LOOKBOOK PREVIEW */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 py-24 lg:py-32">
        <div className="flex items-end justify-between mb-12" data-reveal>
          <div>
            <div className="eyebrow">Lookbook</div>
            <h2 className="mt-3 font-display text-4xl lg:text-6xl">In the wild.</h2>
          </div>
          <Link
            to="/lookbook"
            className="hidden md:inline-flex items-center gap-2 text-sm font-bold tracking-[0.15em] uppercase hover:text-accent transition"
          >
            View gallery <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              src: "/images/lookbook/knot-nomad-lookbook-01.webp",
              alt: "Look 01: Black male model wearing a lavender knit polo and relaxed grey tailored trousers.",
              width: 2246,
              height: 3040,
              position: "center 35%",
            },
            {
              src: "/images/lookbook/knot-nomad-lookbook-03.webp",
              alt: "Look 03: Male model wearing a sage utility jacket and neutral trousers in a tropical garden.",
              width: 2246,
              height: 3040,
              position: "center 35%",
            },
            {
              src: "/images/lookbook/knot-nomad-lookbook-06.webp",
              alt: "Look 06: Close editorial view of a Black male model wearing a caramel cable-knit polo.",
              width: 2132,
              height: 3203,
              position: "center 30%",
            },
          ].map((look, i) => (
            <div
              key={look.src}
              className="overflow-hidden img-lift aspect-[3/4]"
              data-reveal
              data-reveal-delay={String(i + 1)}
            >
              <img
                src={look.src}
                alt={look.alt}
                loading="lazy"
                decoding="async"
                width={look.width}
                height={look.height}
                style={{ objectPosition: look.position }}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="bg-foreground py-24 text-primary-foreground lg:py-32">
        <div className="mx-auto max-w-5xl px-6 text-center lg:px-10">
          <p className="eyebrow !text-primary-foreground/55">Your idea, made wearable</p>
          <h2 className="mt-4 font-display text-5xl lg:text-7xl">
            Start with a brief. <span className="text-[#b7c8b3]">We’ll take it from there.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl leading-7 text-primary-foreground/65">
            Share a few details about your idea. We’ll review it and confirm the specification,
            quote and timing with you before any production begins.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link
              to="/custom-order"
              className="btn-pill inline-flex items-center gap-2 bg-accent px-8 py-4 text-xs font-bold uppercase tracking-[0.18em] text-accent-foreground"
            >
              Start Custom Order <ArrowRight size={15} />
            </Link>
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noreferrer"
              className="btn-pill inline-flex items-center gap-2 border border-primary-foreground/35 px-8 py-4 text-xs font-bold uppercase tracking-[0.18em]"
            >
              <MessageCircle size={15} /> Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
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
