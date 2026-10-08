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
import {
  isCatalogueReadyProduct,
  isValidProductColour,
  isValidProductSize,
  parseProductData,
} from "@/lib/product-data";
import { productGroup, type StoreProduct } from "@/lib/products";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop — Knot & Nomad | Premium Apparel & Custom Pieces" },
      {
        name: "description",
        content:
          "Knot & Nomad is a custom-apparel studio. Ready-to-wear releases are coming soon; join Nomad Circle for release notes.",
      },
      { property: "og:title", content: "Shop — Knot & Nomad" },
      {
        property: "og:description",
        content:
          "Ready-to-wear releases are coming soon. Join Nomad Circle for updates or start a custom brief.",
      },
    ],
  }),
  component: ShopRoute,
});

const CATEGORIES = [
  "All Products",
  "Tops",
  "Bottoms",
  "Jackets",
  "Native Wear",
  "Sets",
  "Accessories",
];
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
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [catalogueNotice, setCatalogueNotice] = useState("");
  const [category, setCategory] = useState("All Products");
  const [size, setSize] = useState<string>("All");
  const [color, setColor] = useState<string>("All");
  const [tag, setTag] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<Sort>("Featured");
  const [maxPrice, setMaxPrice] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    let active = true;

    const loadCatalogue = async () => {
      try {
        const result = await Promise.race([
          supabase
            .from("products")
            .select("*")
            .eq("is_active", true)
            .order("sort_order", { ascending: true }),
          new Promise<never>((_, reject) =>
            window.setTimeout(() => reject(new Error("Catalogue request timed out")), 8000),
          ),
        ]);

        if (!active) return;

        if (result.error) {
          setProducts([]);
          setCatalogueNotice("The collection could not be loaded. Please try again.");
          return;
        }

        setProducts(
          result.data.map(parseProductData).map(normalizeProduct).filter(isCatalogueReadyProduct),
        );
        setCatalogueNotice("");
      } catch (error) {
        if (!active) return;
        console.warn("[Shop] Catalogue request failed.", error);
        setProducts([]);
        setCatalogueNotice("The collection could not be loaded. Please try again.");
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadCatalogue();

    return () => {
      active = false;
    };
  }, []);

  const priceCeiling = useMemo(
    () => Math.max(50000, ...products.map((p) => p.price_ngn)),
    [products],
  );

  useEffect(() => {
    if (maxPrice === 0) setMaxPrice(priceCeiling);
  }, [priceCeiling, maxPrice]);

  const availableCategories = useMemo(
    () =>
      CATEGORIES.filter(
        (item) => item === "All Products" || products.some((p) => productGroup(p) === item),
      ),
    [products],
  );
  const availableSizes = useMemo(
    () => [...new Set(products.flatMap((product) => product.sizes.filter(isValidProductSize)))],
    [products],
  );
  const availableColors = useMemo(
    () => [...new Set(products.flatMap((product) => product.colors.filter(isValidProductColour)))],
    [products],
  );

  const activeFilterCount = [
    category !== "All Products",
    size !== "All",
    color !== "All",
    tag !== "All",
    search.trim().length > 0,
    maxPrice > 0 && maxPrice < priceCeiling,
  ].filter(Boolean).length;

  const resetFilters = () => {
    setCategory("All Products");
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
      if (category !== "All Products" && productGroup(p) !== category) return false;
      if (size !== "All" && !p.sizes.includes(size)) return false;
      if (color !== "All" && !p.colors.includes(color)) return false;
      if (tag === "New" && !p.is_new_arrival) return false;
      if (tag === "Bestseller" && !p.is_bestseller) return false;
      if (tag === "Customizable" && !p.is_customizable) return false;
      if (maxPrice && p.price_ngn > maxPrice) return false;
      if (
        term &&
        ![p.name, p.category, p.sku ?? "", p.short_description ?? ""].some((value) =>
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

  const heroImage = fallbackHero;

  return (
    <div className="bg-background">
      <section className="relative overflow-hidden border-b border-border bg-foreground text-primary-foreground">
        <div className="absolute inset-y-0 right-0 hidden w-1/2 lg:block">
          <img src={heroImage} alt="" className="h-full w-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground via-foreground/35 to-transparent" />
        </div>
        <div className="relative mx-auto grid max-w-7xl items-end px-6 py-10 sm:py-14 lg:min-h-[30rem] lg:grid-cols-12 lg:px-10 lg:py-16">
          <div className="lg:col-span-7">
            <p className="eyebrow mb-5 text-primary-foreground/60">
              {products.length > 0 ? "Knot & Nomad Shop" : "Ready-to-wear"}
            </p>
            <h1 className="font-display text-4xl leading-[0.98] sm:text-6xl lg:text-7xl">
              {products.length > 0 ? (
                <>
                  Elevated essentials.
                  <br />
                  Cut for <span className="text-[#b7c8b3]">motion</span>.
                </>
              ) : (
                "The next edit is being prepared."
              )}
            </h1>
            <p className="mt-6 max-w-xl text-sm leading-7 text-primary-foreground/70 sm:text-base">
              {products.length > 0
                ? "Ready-to-wear essentials and customisable studio pieces, priced in Nigerian Naira."
                : "Our ready-to-wear pieces are currently being reviewed. Join Nomad Circle for release notes and early access, or start a custom brief with the studio."}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              {products.length > 0 ? (
                <>
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
                    Start a custom order
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/custom-order"
                    className="btn-pill inline-flex items-center gap-2 bg-primary-foreground px-6 py-3 text-xs font-bold uppercase tracking-[0.22em] text-foreground transition hover:bg-accent hover:text-accent-foreground"
                  >
                    Start a custom order <ArrowRight size={15} />
                  </Link>
                  <a
                    href="#nomad-circle"
                    className="btn-pill inline-flex items-center gap-2 border-2 border-primary-foreground/35 px-6 py-3 text-xs font-bold uppercase tracking-[0.22em] text-primary-foreground transition hover:border-accent hover:text-accent"
                  >
                    Join for drop updates
                  </a>
                </>
              )}
            </div>
            {products.length > 0 && (
              <div className="mt-12 grid max-w-2xl grid-cols-2 border-y border-primary-foreground/15 text-xs">
                {["Custom studio", "Naira pricing"].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 py-4 pr-3 text-primary-foreground/70"
                  >
                    <CheckCircle2 size={14} className="text-accent" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {catalogueNotice && (
        <div className="mx-auto max-w-7xl px-6 pt-6 lg:px-10">
          <p className="border border-border bg-card p-4 text-sm" role="alert">
            {catalogueNotice}{" "}
            <button type="button" onClick={() => window.location.reload()} className="underline">
              Reload
            </button>
          </p>
        </div>
      )}

      {products.length > 0 && (
        <section className="border-b border-border bg-card" aria-label="Product categories">
          <div className="mx-auto max-w-7xl px-6 py-4 lg:px-10">
            <div
              className="relative flex gap-2 overflow-x-auto pb-2 pr-8 [scrollbar-width:thin]"
              role="group"
              aria-label="Filter products by category"
            >
              {availableCategories.map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-pressed={category === item}
                  onClick={() => {
                    setCategory(item);
                  }}
                  className={`inline-flex min-h-11 shrink-0 items-center border px-4 text-xs font-bold uppercase tracking-[0.18em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                    category === item
                      ? "border-foreground bg-foreground text-primary-foreground"
                      : "border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground"
                  }`}
                >
                  {item}
                </button>
              ))}
              <span
                className="pointer-events-none sticky right-0 my-1 ml-auto flex shrink-0 items-center bg-gradient-to-l from-card via-card pl-4 pr-1 text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground sm:hidden"
                aria-hidden="true"
              >
                Swipe →
              </span>
            </div>
          </div>
        </section>
      )}

      {products.length > 0 && (
        <section id="shop-grid" className="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-14">
          <div
            className={`mb-8 gap-4 ${
              products.length > 0 ? "grid lg:grid-cols-[18rem_1fr] lg:items-end" : ""
            }`}
          >
            <div>
              <p className="eyebrow mb-2">Ready-to-wear</p>
              <p className="text-sm text-muted-foreground">
                {loading
                  ? "Loading pieces…"
                  : products.length === 0
                    ? "0 pieces available"
                    : `${filtered.length} of ${products.length} pieces`}
              </p>
            </div>
            {products.length > 0 && (
              <div className="grid gap-3 md:grid-cols-[1fr_13rem_auto]">
                <label className="relative block">
                  <span className="sr-only">Search products</span>
                  <Search
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    aria-label="Search products"
                    placeholder="Search tees, trousers, jackets, native wear..."
                    className="h-12 w-full border border-border bg-card pl-11 pr-4 text-sm outline-none transition placeholder:text-muted-foreground focus:border-foreground focus-visible:ring-2 focus-visible:ring-accent"
                  />
                </label>
                <label className="sr-only" htmlFor="shop-sort">
                  Sort products
                </label>
                <select
                  id="shop-sort"
                  value={sort}
                  onChange={(e) => setSort(e.target.value as Sort)}
                  className="h-12 border border-border bg-card px-4 text-sm outline-none transition focus:border-foreground focus-visible:ring-2 focus-visible:ring-accent"
                >
                  {SORTS.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
                <button
                  onClick={() => setShowFilters((v) => !v)}
                  aria-expanded={showFilters}
                  aria-controls="mobile-shop-filters"
                  className="btn-pill inline-flex h-12 items-center justify-center gap-2 border-2 border-foreground px-5 text-xs font-bold uppercase tracking-[0.22em] transition hover:bg-foreground hover:text-primary-foreground lg:hidden"
                >
                  <Filter size={14} />
                  Filters
                  {activeFilterCount > 0 && <span>({activeFilterCount})</span>}
                </button>
              </div>
            )}
          </div>

          {products.length > 0 && showFilters && (
            <div
              id="mobile-shop-filters"
              className="mb-8 border border-border bg-card p-5 lg:hidden"
            >
              <ShopFilters
                size={size}
                color={color}
                tag={tag}
                maxPrice={maxPrice}
                priceCeiling={priceCeiling}
                sizeOptions={availableSizes}
                colorOptions={availableColors}
                onSize={setSize}
                onColor={setColor}
                onTag={setTag}
                onMaxPrice={setMaxPrice}
                onReset={resetFilters}
              />
            </div>
          )}

          <div className="grid gap-8 lg:grid-cols-[18rem_1fr]">
            {products.length > 0 && (
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
                    sizeOptions={availableSizes}
                    colorOptions={availableColors}
                    onSize={setSize}
                    onColor={setColor}
                    onTag={setTag}
                    onMaxPrice={setMaxPrice}
                    onReset={resetFilters}
                  />
                </div>
              </aside>
            )}

            <div aria-live="polite" aria-busy={loading}>
              {activeFilterCount > 0 && (
                <div className="mb-6 flex flex-wrap items-center gap-2">
                  {[
                    category !== "All Products" ? category : null,
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

              {loading && products.length === 0 ? (
                <ProductSkeleton />
              ) : filtered.length === 0 ? (
                <div className="flex min-h-[22rem] flex-col items-center justify-center border border-border bg-card px-6 text-center">
                  <p className="font-display text-3xl">
                    {products.length === 0
                      ? "Ready-to-wear details are being confirmed."
                      : "No pieces found."}
                  </p>
                  <p className="mt-3 max-w-md text-sm text-muted-foreground">
                    {products.length === 0
                      ? "Contact the studio to discuss a custom request."
                      : "Try another category, remove a filter, or start a custom request with the studio."}
                  </p>
                  {products.length > 0 ? (
                    <button
                      onClick={resetFilters}
                      className="btn-pill mt-6 border-2 border-foreground px-5 py-3 text-xs font-bold uppercase tracking-[0.22em] transition hover:bg-foreground hover:text-primary-foreground"
                    >
                      Reset filters
                    </button>
                  ) : (
                    <Link
                      to="/custom-order"
                      className="btn-pill mt-6 border-2 border-foreground px-5 py-3 text-xs font-bold uppercase tracking-[0.22em] transition hover:bg-foreground hover:text-primary-foreground"
                    >
                      Start custom order
                    </Link>
                  )}
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
      )}
    </div>
  );
}

function normalizeProduct(
  product: Partial<StoreProduct> & Pick<StoreProduct, "id" | "slug" | "name">,
): StoreProduct {
  return {
    ...product,
    short_description: product.short_description ?? null,
    category: product.category || "Tops",
    price_ngn: Number(product.price_ngn) || 0,
    images: Array.isArray(product.images) ? product.images.filter(Boolean) : [],
    sizes: Array.isArray(product.sizes) ? product.sizes.filter(Boolean) : [],
    colors: Array.isArray(product.colors) ? product.colors.filter(Boolean) : [],
    sku: product.sku ?? null,
    stock_level: Number(product.stock_level) || 0,
    is_sold_out: Boolean(product.is_sold_out),
    is_new_arrival: Boolean(product.is_new_arrival),
    is_bestseller: Boolean(product.is_bestseller),
    is_customizable: Boolean(product.is_customizable),
  };
}

function ShopFilters({
  size,
  color,
  tag,
  maxPrice,
  priceCeiling,
  sizeOptions,
  colorOptions,
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
  sizeOptions: string[];
  colorOptions: string[];
  onSize: (v: string) => void;
  onColor: (v: string) => void;
  onTag: (v: string) => void;
  onMaxPrice: (v: number) => void;
  onReset: () => void;
}) {
  return (
    <div className="space-y-7">
      <FilterGroup label="Size" options={["All", ...sizeOptions]} value={size} onChange={onSize} />
      <FilterGroup
        label="Color"
        options={["All", ...colorOptions]}
        value={color}
        onChange={onColor}
        swatches
      />
      <FilterGroup label="Collection" options={TAGS} value={tag} onChange={onTag} />
      <div>
        <div className="mb-3 flex items-end justify-between gap-3">
          <label htmlFor="max-price" className="eyebrow">
            Max price
          </label>
          <p className="text-sm font-medium">{formatNaira(maxPrice)}</p>
        </div>
        <input
          id="max-price"
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
        className="min-h-11 w-full border border-border py-3 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground transition hover:border-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
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
    <fieldset>
      <legend className="eyebrow mb-3">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={value === option}
            onClick={() => onChange(option)}
            className={`inline-flex min-h-11 items-center gap-2 border px-3 py-2 text-xs transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
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
    </fieldset>
  );
}

function ProductCard({ p }: { p: StoreProduct }) {
  const secondImage = p.images[1];
  const startingPrice = p.starting_price_ngn != null && p.starting_price_ngn !== p.price_ngn;
  const availability = p.is_sold_out
    ? "Unavailable"
    : p.stock_level > 0
      ? "In stock"
      : p.is_ready_to_wear === false
        ? "Made to order"
        : "Ask about availability";

  return (
    <article className="group flex h-full flex-col">
      <Link to="/shop/$slug" params={{ slug: p.slug }} className="block">
        <div className="relative aspect-[4/5] overflow-hidden border border-border bg-muted">
          {p.images[0] ? (
            <>
              <img
                src={p.images[0]}
                alt={p.name}
                width={900}
                height={1125}
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
          {!p.is_sold_out && p.stock_level > 0 && p.stock_level <= 5 && (
            <span className="absolute bottom-3 right-3 bg-background/95 px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-[0.16em]">
              Only {p.stock_level} left
            </span>
          )}
        </div>
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="eyebrow mb-1 !text-[0.6rem]">
            {productGroup(p)} · {p.category}
            {p.sku ? ` · ${p.sku}` : ""}
          </p>
          <Link to="/shop/$slug" params={{ slug: p.slug }}>
            <h3 className="font-display text-2xl leading-tight transition-colors group-hover:text-accent">
              {p.name}
            </h3>
          </Link>
          {p.short_description && (
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
              {p.short_description}
            </p>
          )}
        </div>
        <div className="shrink-0 text-right">
          {startingPrice && (
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
              Starting at
            </p>
          )}
          <p className="mt-1 text-sm font-semibold">
            {formatNaira(p.starting_price_ngn ?? p.price_ngn)}
          </p>
        </div>
      </div>

      <div className="mt-4 flex min-h-5 items-center justify-between gap-3">
        <div
          role="img"
          className="flex items-center gap-1.5"
          aria-label={`Available colours: ${p.colors.join(", ") || "Ask the studio"}`}
        >
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
      <div className="mt-4 flex flex-wrap gap-1.5">
        {(p.product_tags?.length
          ? p.product_tags
          : [
              p.is_ready_to_wear === false ? "Made-to-order" : "Ready-to-wear",
              ...(p.is_customizable ? ["Customisable"] : []),
            ]
        )
          .slice(0, 3)
          .map((tag) => (
            <span
              key={tag}
              className="border border-border px-2 py-1 text-[0.58rem] font-bold uppercase tracking-[0.14em] text-muted-foreground"
            >
              {tag}
            </span>
          ))}
      </div>
      <div className="mt-auto border-t border-border pt-4">
        <Link
          to="/shop/$slug"
          params={{ slug: p.slug }}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 border border-foreground px-3 text-[0.65rem] font-bold uppercase tracking-[0.16em] transition hover:bg-foreground hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {availability} · View piece <ArrowRight size={13} />
        </Link>
      </div>
    </article>
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
