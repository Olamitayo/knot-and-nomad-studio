import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useMemo, useState } from "react";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useReveal } from "@/hooks/useReveal";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

const searchSchema = z.object({
  filter: fallback(
    z.enum(["all", "essentials", "polos", "knitwear", "tailoring", "outerwear"]),
    "all",
  ).default("all"),
});

export const Route = createFileRoute("/lookbook")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "Lookbook — Knot & Nomad | Editorial of Motion" },
      {
        name: "description",
        content:
          "An editorial gallery of Knot & Nomad custom apparel — premium streetwear, sweats, tees and runway pieces, photographed in motion.",
      },
      { property: "og:title", content: "Lookbook — Knot & Nomad" },
      { property: "og:description", content: "Editorial visuals from the Knot & Nomad studio." },
      { property: "og:image", content: "/images/lookbook/knot-nomad-lookbook-01.webp" },
    ],
  }),
  component: Lookbook,
});

type LookFilter = "essentials" | "polos" | "knitwear" | "tailoring" | "outerwear";

type Shot = {
  id: string;
  src: string;
  alt: string;
  title: string;
  category: string;
  description: string;
  tags: string[];
  filters: LookFilter[];
  width: number;
  height: number;
  objectPosition: string;
  span?: string;
};

const shots: Shot[] = [
  {
    id: "01",
    src: "/images/lookbook/knot-nomad-lookbook-01.webp",
    alt: "Look 01: Black male model wearing a lavender knit polo and relaxed grey tailored trousers.",
    title: "Lavender in Motion",
    category: "Refined Casual",
    description:
      "A lavender knit polo paired with relaxed grey tailoring for a calm, contemporary silhouette.",
    tags: ["Knitwear", "Tailoring", "Neutral"],
    filters: ["polos", "knitwear", "tailoring"],
    width: 2246,
    height: 3040,
    objectPosition: "center 35%",
    span: "lg:col-span-7 lg:row-span-2",
  },
  {
    id: "02",
    src: "/images/lookbook/knot-nomad-lookbook-02.webp",
    alt: "Look 02: Black male model wearing a white round-neck tee with wide beige tailored trousers.",
    title: "The Essential Balance",
    category: "Everyday Essentials",
    description:
      "A clean white round-neck tee styled with wide beige trousers for effortless everyday refinement.",
    tags: ["Round Tee", "Tailoring", "Minimal"],
    filters: ["essentials", "tailoring"],
    width: 2338,
    height: 2921,
    objectPosition: "center 42%",
    span: "lg:col-span-5",
  },
  {
    id: "03",
    src: "/images/lookbook/knot-nomad-lookbook-03.webp",
    alt: "Look 03: Male model wearing a sage utility jacket and neutral trousers in a tropical garden.",
    title: "Garden Utility",
    category: "Modern Outerwear",
    description:
      "A sage utility jacket layered over soft neutral tailoring, photographed in a natural garden setting.",
    tags: ["Jacket", "Layering", "Earth Tone"],
    filters: ["outerwear", "tailoring"],
    width: 2246,
    height: 3040,
    objectPosition: "center 35%",
    span: "lg:col-span-5",
  },
  {
    id: "04",
    src: "/images/lookbook/knot-nomad-lookbook-04.webp",
    alt: "Look 04: Black male model wearing an ivory polo with white tailored trousers.",
    title: "Ivory Standard",
    category: "Smart Casual",
    description:
      "A refined ivory polo and white tailored trousers styled for understated, polished dressing.",
    tags: ["Polo", "Smart Casual", "Monochrome"],
    filters: ["essentials", "polos", "tailoring"],
    width: 2613,
    height: 2613,
    objectPosition: "center 30%",
    span: "lg:col-span-7",
  },
  {
    id: "05",
    src: "/images/lookbook/knot-nomad-lookbook-05.webp",
    alt: "Look 05: Black male model wearing a textured beige knitted polo in a studio portrait.",
    title: "Textured Neutral",
    category: "Knit Polo",
    description:
      "A close editorial portrait highlighting the structure and texture of a neutral knitted polo.",
    tags: ["Polo", "Knitwear", "Texture"],
    filters: ["polos", "knitwear"],
    width: 2338,
    height: 2921,
    objectPosition: "center 28%",
    span: "lg:col-span-4",
  },
  {
    id: "06",
    src: "/images/lookbook/knot-nomad-lookbook-06.webp",
    alt: "Look 06: Close editorial view of a Black male model wearing a caramel cable-knit polo.",
    title: "Caramel Structure",
    category: "Knitwear Detail",
    description:
      "Warm caramel knitwear presented through rich texture, soft tailoring, and directional studio light.",
    tags: ["Knitwear", "Detail", "Warm Neutral"],
    filters: ["polos", "knitwear"],
    width: 2132,
    height: 3203,
    objectPosition: "center 30%",
    span: "lg:col-span-4",
  },
];

const filterOptions: { value: LookFilter | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "essentials", label: "Essentials" },
  { value: "polos", label: "Polos" },
  { value: "knitwear", label: "Knitwear" },
  { value: "tailoring", label: "Tailoring" },
  { value: "outerwear", label: "Outerwear" },
];

function Lookbook() {
  const ref = useReveal();
  const { filter } = Route.useSearch();
  const navigate = useNavigate({ from: "/lookbook" });
  const [selected, setSelected] = useState<Shot | null>(null);

  const setFilter = (value: string) => {
    navigate({
      search: { filter: value as LookFilter | "all" },
      replace: true,
    });
  };

  const filtered = useMemo(
    () => shots.filter((shot) => filter === "all" || shot.filters.includes(filter)),
    [filter],
  );

  const reset = () => {
    navigate({ search: { filter: "all" }, replace: true });
  };

  return (
    <div ref={ref}>
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 pt-24 lg:pt-36 pb-12" data-reveal>
        <div className="flex items-end justify-between flex-wrap gap-6">
          <div>
            <div className="eyebrow">Lookbook · Vol. 01</div>
            <h1 className="mt-5 font-display text-5xl lg:text-7xl xl:text-8xl leading-[1.02] max-w-5xl">
              An editorial of <span className="text-accent">motion</span>.
            </h1>
            <p className="mt-6 max-w-xl text-muted-foreground leading-relaxed">
              Considered silhouettes, honest fabrics, and personal stories — captured between the
              studio and the street.
            </p>
          </div>
          <div className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground">
            <div>SS Capsule</div>
            <div className="mt-1">6 Looks · 1 Story</div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 pb-10" data-reveal>
        <div className="border-y border-border py-6 lg:py-8 space-y-5">
          <FilterRow label="Filter" options={filterOptions} value={filter} onChange={setFilter} />
          <div className="flex items-center justify-between pt-1 text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground">
            <span>
              {filtered.length} of {shots.length} looks
            </span>
            {filter !== "all" && (
              <button onClick={reset} className="hover:text-accent transition">
                Reset filters
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Editorial grid */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 pb-24">
        {filtered.length === 0 ? (
          <div className="py-24 text-center text-muted-foreground">
            <p className="font-display text-3xl text-foreground">No looks match those filters.</p>
            <button
              onClick={reset}
              className="mt-6 text-xs font-bold uppercase tracking-[0.28em] border-b border-foreground pb-1 hover:text-accent hover:border-accent transition"
            >
              Clear and see all
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 auto-rows-auto">
            {filtered.map((shot) => {
              const position = shots.findIndex((item) => item.id === shot.id) + 1;
              return (
                <button
                  key={shot.id}
                  type="button"
                  onClick={() => setSelected(shot)}
                  aria-label={`Open Look ${shot.id}: ${shot.title}`}
                  data-reveal
                  data-reveal-delay={(position % 4).toString()}
                  className={`group relative overflow-hidden bg-secondary text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 ${shot.span ?? "lg:col-span-6"}`}
                >
                  <div
                    className="overflow-hidden"
                    style={{ aspectRatio: `${shot.width} / ${shot.height}` }}
                  >
                    <img
                      src={shot.src}
                      alt={shot.alt}
                      loading={position <= 2 ? "eager" : "lazy"}
                      decoding="async"
                      width={shot.width}
                      height={shot.height}
                      style={{ objectPosition: shot.objectPosition }}
                      className="w-full h-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.04]"
                    />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-5 lg:p-6 flex items-end justify-between gap-4 bg-gradient-to-t from-black/70 via-black/20 to-transparent text-primary-foreground opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-visible:opacity-100 transition-opacity duration-500">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-80">
                        {shot.category}
                      </div>
                      <div className="font-display text-xl lg:text-2xl mt-1">{shot.title}</div>
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-80">
                      {shot.id} / 06
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <Dialog open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        {selected && (
          <DialogContent className="max-h-[94vh] max-w-[96vw] overflow-y-auto border-0 bg-background p-0 sm:rounded-none lg:max-w-6xl [&>button]:z-10 [&>button]:bg-background/90 [&>button]:p-2">
            <div className="grid lg:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.55fr)]">
              <div className="flex min-h-[45vh] max-h-[72vh] items-center justify-center bg-black lg:max-h-[94vh]">
                <img
                  src={selected.src}
                  alt={selected.alt}
                  width={selected.width}
                  height={selected.height}
                  className="h-full max-h-[72vh] w-full object-contain lg:max-h-[94vh]"
                />
              </div>
              <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-12">
                <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent">
                  Look {selected.id} · {selected.category}
                </div>
                <DialogTitle className="mt-4 font-display text-3xl leading-tight sm:text-4xl">
                  {selected.title}
                </DialogTitle>
                <DialogDescription className="mt-5 text-base leading-7">
                  {selected.description}
                </DialogDescription>
                <div className="mt-7 flex flex-wrap gap-2" aria-label="Look tags">
                  {selected.tags.map((tag) => (
                    <span
                      key={tag}
                      className="border border-border px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* CTA */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-20 lg:py-28 grid lg:grid-cols-2 gap-10 items-center">
          <h2 className="font-display text-4xl lg:text-6xl leading-[1.05]" data-reveal>
            See a piece you'd want — <span className="text-accent">made yours</span>?
          </h2>
          <div className="flex flex-col items-start gap-4" data-reveal data-reveal-delay="2">
            <p className="text-muted-foreground max-w-md">
              Every look in this editorial can be tailored to your colourway, fit, fabric and
              finish. Brief us in a few lines — we'll take it from there.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/custom-order"
                className="btn-pill inline-flex items-center gap-2 bg-foreground text-primary-foreground px-7 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-accent hover:text-accent-foreground transition-colors duration-500"
              >
                Customise a similar look <ArrowRight size={16} />
              </Link>
              <Link
                to="/shop"
                className="btn-pill inline-flex items-center gap-2 border-2 border-foreground px-7 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-foreground hover:text-primary-foreground"
              >
                Shop related pieces
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function FilterRow({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
      <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground w-20 shrink-0">
        {label}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              aria-pressed={active}
              className={cn(
                "px-4 py-2 text-[11px] font-bold uppercase tracking-[0.25em] border transition-colors duration-300",
                active
                  ? "bg-foreground text-primary-foreground border-foreground"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-foreground",
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
