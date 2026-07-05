import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Filter,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  Wand2,
  X,
} from "lucide-react";
import fallbackHero from "@/assets/hero-editorial.jpg";
import { supabase } from "@/integrations/supabase/client";
import { formatNaira } from "@/lib/format";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop — Knot & Nomad | Premium Apparel & Custom Pieces" },
      {
        name: "description",
        content:
          "Browse premium tees, hoodies, caps, polos, streetwear and accessories from Knot & Nomad. Ready-to-wear and customisable pieces, delivered nationwide.",
      },
      { property: "og:title", content: "Shop — Knot & Nomad" },
      {
        property: "og:description",
        content: "Premium apparel and custom pieces. Ready-to-wear or made-to-order.",
      },
    ],
  }),
  component: ShopRoute,
});

interface Product {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  category: string;
  price_ngn: number;
  images: string[];
  sizes: string[];
  colors: string[];
  is_sold_out: boolean;
  is_new_arrival: boolean;
  is_bestseller: boolean;
  is_customizable: boolean;
}

const CATEGORIES = [
  "All",
  "T-shirts",
  "Caps",
  "Hoodies",
  "Sweatshirts",
  "Polos",
  "Streetwear",
  "Accessories",
];
const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "One Size"];
const COLORS = ["Black", "White", "Cream", "Charcoal", "Sand", "Olive", "Navy", "Gold"];
const TAGS = ["All", "New", "Bestseller", "Customizable"];
const SORTS = ["Featured", "Price: low to high", "Price: high to low", "Newest"] as const;

type Sort = (typeof SORTS)[number];

function ShopRoute() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  if (pathname.replace(/\/$/, "") !== "/shop") {
    return <Outlet />;
  }

  return <ShopPage />;
}

function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [size, setSize] = useState<string>("All");
  const [color, setColor] = useState<string>("All");
  const [tag, setTag] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<Sort>("Featured");
  const [maxPrice, setMaxPrice] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        setProducts((data as Product[]) ?? []);
        setLoading(false);
      });
  }, []);

  const priceCeiling = useMemo(
    () => Math.max(50000, ...products.map((p) => p.price_ngn)),
    [products],
  );

  useEffect(() => {
    if (maxPrice === 0) setMaxPrice(priceCeiling);
  }, [priceCeiling, maxPrice]);

  const featuredProduct = useMemo(
    () =>
      products.find((p) => p.is_bestseller && p.images[0]) ??
      products.find((p) => p.images[0]) ??
      products[0],
    [products],
  );

  const activeFilterCount = [
    category !== "All",
    size !== "All",
    color !== "All",
    tag !== "All",
    search.trim().length > 0,
    maxPrice > 0 && maxPrice < priceCeiling,
  ].filter(Boolean).length;

  const resetFilters = () => {
    setCategory("All");
    setSize("All");
    setColor("All");
    setTag("All");
    setSearch("");
    setSort("Featured");
    setMaxPrice(priceCeiling);
  };

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const result = products.filter((p) => {
      if (category !== "All" && p.category !== category) return false;
      if (size !== "All" && !p.sizes.includes(size)) return false;
      if (color !== "All" && !p.colors.includes(color)) return false;
      if (tag === "New" && !p.is_new_arrival) return false;
      if (tag === "Bestseller" && !p.is_bestseller) return false;
      if (tag === "Customizable" && !p.is_customizable) return false;
      if (maxPrice && p.price_ngn > maxPrice) return false;
      if (
        term &&
        ![p.name, p.category, p.short_description ?? ""].some((value) =>
          value.toLowerCase().includes(term),
        )
      ) {
        return false;
      }
      return true;
    });

    return [...result].sort((a, b) => {
      if (sort === "Price: low to high") return a.price_ngn - b.price_ngn;
      if (sort === "Price: high to low") return b.price_ngn - a.price_ngn;
      if (sort === "Newest") return Number(b.is_new_arrival) - Number(a.is_new_arrival);
      return (
        Number(b.is_bestseller) - Number(a.is_bestseller) ||
        Number(b.is_new_arrival) - Number(a.is_new_arrival)
      );
    });
  }, [products, category, size, color, tag, maxPrice, search, sort]);

  const heroImage = featuredProduct?.images[0] ?? fallbackHero;

  return (
    <div className="bg-background">
      <section className="relative overflow-hidden border-b border-border bg-foreground text-primary-foreground">
        <div className="absolute inset-y-0 right-0 hidden w-1/2 lg:block">
          <img src={heroImage} alt="" className="h-full w-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground via-foreground/35 to-transparent" />
        </div>
        <div className="relative mx-auto grid min-h-[34rem] max-w-7xl items-end px-6 py-16 lg:grid-cols-12 lg:px-10 lg:py-20">
          <div className="lg:col-span-7">
            <p className="eyebrow mb-5 text-primary-foreground/60">Knot & Nomad Shop</p>
            <h1 className="font-display text-5xl leading-[0.98] sm:text-6xl lg:text-7xl">
              Premium pieces.
              <br />
              Cut for <span className="text-accent">motion</span>.
            </h1>
            <p className="mt-6 max-w-xl text-sm leading-7 text-primary-foreground/70 sm:text-base">
              Ready-to-wear essentials and customisable studio pieces, priced in Nigerian
              Naira and built for sharp everyday presence.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a
                href="#shop-grid"
                className="btn-pill inline-flex items-center gap-2 bg-primary-foreground px-6 py-3 text-xs font-bold uppercase tracking-[0.22em] text-foreground transition hover:bg-accent hover:text-accent-foreground"
              >
                Shop pieces <ArrowRight size={15} />
              </a>
              <Link
                to="/custom-order"
                className="btn-pill inline-flex items-center gap-2 border-2 border-primary-foreground/35 px-6 py-3 text-xs font-bold uppercase tracking-[0.22em] text-primary-foreground transition hover:border-accent hover:text-accent"
              >
                Custom order
              </Link>
            </div>
            <div className="mt-12 grid max-w-2xl grid-cols-3 border-y border-primary-foreground/15 text-xs">
              {["Ready-to-wear", "Customisable", "Naira pricing"].map((item) => (
                <div key={item} className="flex items-center gap-2 py-4 pr-3 text-primary-foreground/70">
                  <CheckCircle2 size={14} className="text-accent" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-6 py-4 lg:px-10">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map((item) => (
              <button
                key={item}
                onClick={() => setCategory(item)}
                className={`shrink-0 border px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] transition ${
                  category === item
                    ? "border-foreground bg-foreground text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section id="shop-grid" className="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-14">
        <div className="mb-8 grid gap-4 lg:grid-cols-[18rem_1fr] lg:items-end">
          <div>
            <p className="eyebrow mb-2">Current edit</p>
            <p className="text-sm text-muted-foreground">
              {loading ? "Loading pieces..." : `${filtered.length} of ${products.length} pieces`}
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-[1fr_13rem_auto]">
            <label className="relative block">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tees, hoodies, caps..."
                className="h-12 w-full border border-border bg-card pl-11 pr-4 text-sm outline-none transition placeholder:text-muted-foreground focus:border-foreground"
              />
            </label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="h-12 border border-border bg-card px-4 text-sm outline-none transition focus:border-foreground"
            >
              {SORTS.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <button
              onClick={() => setShowFilters((v) => !v)}
              className="btn-pill inline-flex h-12 items-center justify-center gap-2 border-2 border-foreground px-5 text-xs font-bold uppercase tracking-[0.22em] transition hover:bg-foreground hover:text-primary-foreground lg:hidden"
            >
              <Filter size={14} />
              Filters
              {activeFilterCount > 0 && <span>({activeFilterCount})</span>}
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="mb-8 border border-border bg-card p-5 lg:hidden">
            <ShopFilters
              size={size}
              color={color}
              tag={tag}
              maxPrice={maxPrice}
              priceCeiling={priceCeiling}
              onSize={setSize}
              onColor={setColor}
              onTag={setTag}
              onMaxPrice={setMaxPrice}
              onReset={resetFilters}
            />
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[18rem_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-28 border border-border bg-card p-5">
              <div className="mb-6 flex items-center justify-between gap-3">
                <div>
                  <p className="eyebrow">Refine</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {activeFilterCount ? `${activeFilterCount} active` : "No filters"}
                  </p>
                </div>
                <SlidersHorizontal size={18} className="text-muted-foreground" />
              </div>
              <ShopFilters
                size={size}
                color={color}
                tag={tag}
                maxPrice={maxPrice}
                priceCeiling={priceCeiling}
                onSize={setSize}
                onColor={setColor}
                onTag={setTag}
                onMaxPrice={setMaxPrice}
                onReset={resetFilters}
              />
            </div>
          </aside>

          <div>
            {activeFilterCount > 0 && (
              <div className="mb-6 flex flex-wrap items-center gap-2">
                {[
                  category !== "All" ? category : null,
                  size !== "All" ? size : null,
                  color !== "All" ? color : null,
                  tag !== "All" ? tag : null,
                  search ? `"${search}"` : null,
                  maxPrice < priceCeiling ? `Up to ${formatNaira(maxPrice)}` : null,
                ]
                  .filter((item): item is string => Boolean(item))
                  .map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-2 border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground"
                    >
                      {item}
                    </span>
                  ))}
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground transition hover:text-foreground"
                >
                  <X size={13} />
                  Clear
                </button>
              </div>
            )}

            {loading ? (
              <ProductSkeleton />
            ) : filtered.length === 0 ? (
              <div className="flex min-h-[22rem] flex-col items-center justify-center border border-border bg-card px-6 text-center">
                <p className="font-display text-3xl">No pieces found.</p>
                <p className="mt-3 max-w-md text-sm text-muted-foreground">
                  Try another category, remove a filter, or start a custom request with the
                  studio.
                </p>
                <button
                  onClick={resetFilters}
                  className="btn-pill mt-6 border-2 border-foreground px-5 py-3 text-xs font-bold uppercase tracking-[0.22em] transition hover:bg-foreground hover:text-primary-foreground"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((p) => (
                  <ProductCard key={p.id} p={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function ShopFilters({
  size,
  color,
  tag,
  maxPrice,
  priceCeiling,
  onSize,
  onColor,
  onTag,
  onMaxPrice,
  onReset,
}: {
  size: string;
  color: string;
  tag: string;
  maxPrice: number;
  priceCeiling: number;
  onSize: (v: string) => void;
  onColor: (v: string) => void;
  onTag: (v: string) => void;
  onMaxPrice: (v: number) => void;
  onReset: () => void;
}) {
  return (
    <div className="space-y-7">
      <FilterGroup label="Size" options={["All", ...SIZES]} value={size} onChange={onSize} />
      <FilterGroup label="Color" options={["All", ...COLORS]} value={color} onChange={onColor} swatches />
      <FilterGroup label="Collection" options={TAGS} value={tag} onChange={onTag} />
      <div>
        <div className="mb-3 flex items-end justify-between gap-3">
          <p className="eyebrow">Max price</p>
          <p className="text-sm font-medium">{formatNaira(maxPrice)}</p>
        </div>
        <input
          type="range"
          min={0}
          max={priceCeiling}
          step={1000}
          value={maxPrice}
          onChange={(e) => onMaxPrice(Number(e.target.value))}
          className="w-full accent-accent"
        />
        <div className="mt-2 flex justify-between text-[0.7rem] text-muted-foreground">
          <span>{formatNaira(0)}</span>
          <span>{formatNaira(priceCeiling)}</span>
        </div>
      </div>
      <button
        onClick={onReset}
        className="w-full border border-border py-3 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground transition hover:border-foreground hover:text-foreground"
      >
        Reset all
      </button>
    </div>
  );
}

function FilterGroup({
  label,
  options,
  value,
  onChange,
  swatches,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  swatches?: boolean;
}) {
  return (
    <div>
      <p className="eyebrow mb-3">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={`inline-flex min-h-9 items-center gap-2 border px-3 py-2 text-xs transition ${
              value === option
                ? "border-foreground bg-foreground text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground"
            }`}
          >
            {swatches && option !== "All" && <ColorDot color={option} />}
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function ProductCard({ p }: { p: Product }) {
  const secondImage = p.images[1];

  return (
    <Link to="/shop/$slug" params={{ slug: p.slug }} className="group block">
      <article className="h-full">
        <div className="relative aspect-[4/5] overflow-hidden border border-border bg-muted">
          {p.images[0] ? (
            <>
              <img
                src={p.images[0]}
                alt={p.name}
                className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.025]"
                loading="lazy"
              />
              {secondImage && (
                <img
                  src={secondImage}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover opacity-0 transition duration-700 group-hover:opacity-100"
                  loading="lazy"
                />
              )}
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,var(--muted),var(--card))] px-6 text-center">
              <span className="text-xs font-bold uppercase tracking-[0.24em] text-muted-foreground">
                Image coming soon
              </span>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-foreground/80 to-transparent p-4 opacity-0 transition duration-300 group-hover:opacity-100">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground">
              View piece
            </span>
            <ArrowRight size={16} className="text-primary-foreground" />
          </div>
          <div className="absolute left-3 top-3 flex max-w-[calc(100%-1.5rem)] flex-wrap gap-1.5">
            {p.is_new_arrival && <Badge icon={<Sparkles size={10} />} label="New" tone="light" />}
            {p.is_bestseller && <Badge icon={<Star size={10} />} label="Bestseller" tone="dark" />}
            {p.is_customizable && <Badge icon={<Wand2 size={10} />} label="Custom" tone="accent" />}
          </div>
          {p.is_sold_out && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/75">
              <span className="border border-foreground bg-background px-4 py-2 text-xs font-bold uppercase tracking-[0.24em]">
                Sold out
              </span>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="eyebrow mb-1 !text-[0.6rem]">{p.category}</p>
            <h3 className="font-display text-2xl leading-tight transition-colors group-hover:text-accent">
              {p.name}
            </h3>
            {p.short_description && (
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                {p.short_description}
              </p>
            )}
          </div>
          <p className="shrink-0 text-sm font-semibold">{formatNaira(p.price_ngn)}</p>
        </div>

        <div className="mt-4 flex min-h-5 items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            {p.colors.slice(0, 5).map((item) => (
              <ColorDot key={item} color={item} />
            ))}
          </div>
          {p.sizes.length > 0 && (
            <p className="truncate text-xs text-muted-foreground">
              {p.sizes.slice(0, 4).join(" / ")}
              {p.sizes.length > 4 ? " +" : ""}
            </p>
          )}
        </div>
      </article>
    </Link>
  );
}

function ProductSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i}>
          <div className="aspect-[4/5] animate-pulse bg-muted" />
          <div className="mt-4 h-4 w-1/3 animate-pulse bg-muted" />
          <div className="mt-3 h-7 w-2/3 animate-pulse bg-muted" />
          <div className="mt-3 h-4 w-full animate-pulse bg-muted" />
        </div>
      ))}
    </div>
  );
}

function Badge({
  icon,
  label,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  tone: "light" | "dark" | "accent";
}) {
  const toneClass =
    tone === "dark"
      ? "bg-foreground text-primary-foreground"
      : tone === "accent"
        ? "bg-accent text-accent-foreground"
        : "bg-background/95 text-foreground";

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-[0.2em] shadow-sm backdrop-blur ${toneClass}`}
    >
      {icon}
      {label}
    </span>
  );
}

function ColorDot({ color }: { color: string }) {
  return (
    <span
      className="h-3.5 w-3.5 shrink-0 rounded-full border border-border"
      style={{ background: colorValue(color) }}
      aria-hidden="true"
    />
  );
}

function colorValue(color: string) {
  const map: Record<string, string> = {
    Black: "#111111",
    White: "#ffffff",
    Cream: "#f4efe4",
    Charcoal: "#2d2d2d",
    Sand: "#c8bca7",
    Olive: "#626c45",
    Navy: "#18253f",
    Gold: "#c59a43",
  };

  return map[color] ?? color.toLowerCase();
}
