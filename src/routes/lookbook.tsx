import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useMemo, useState } from "react";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useReveal } from "@/hooks/useReveal";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

const searchSchema = z.object({
  filter: fallback(z.enum(["all", "essentials", "polos", "tailoring"]), "all").default("all"),
});

export const Route = createFileRoute("/lookbook")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "Lookbook — Knot & Nomad | Editorial of Motion" },
      {
        name: "description",
        content:
          "Explore Knot & Nomad editorial looks, from everyday tees and polos to relaxed tailoring.",
      },
      { property: "og:title", content: "Lookbook — Knot & Nomad" },
      { property: "og:description", content: "Editorial visuals from the Knot & Nomad studio." },
      { property: "og:image", content: "https://knotnomad.com/og-knotnomad.png" },
    ],
  }),
  component: Lookbook,
});

type LookFilter = "essentials" | "polos" | "tailoring";

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
};

const shots: Shot[] = [
  {
    id: "01",
    src: encodeURI("/images/lookbook/IMG-KNTNMD 001.png"),
    alt: "Black male model posing in a white tee and relaxed black trousers while taking a selfie.",
    title: "White Tee, Unscripted",
    category: "Everyday Essential",
    description: "Simple utility styling with a crisp white tee and a relaxed trouser silhouette.",
    tags: ["Essential", "Minimal", "Tailored"],
    filters: ["essentials", "tailoring"],
    width: 896,
    height: 1755,
    objectPosition: "center bottom",
  },
  {
    id: "02",
    src: encodeURI("/images/lookbook/ChatGPT Image Sep 24, 2026 at 06_52_40 PM (1).png"),
    alt: "Black male model in a deep blue polo with ivory wide-leg trousers and a backpack.",
    title: "Blue Polo in Motion",
    category: "Refined Casual",
    description:
      "A deep blue polo paired with soft white tailoring for a polished everyday statement.",
    tags: ["Polo", "Neutral", "Layered"],
    filters: ["essentials", "polos"],
    width: 878,
    height: 1792,
    objectPosition: "center bottom",
  },
  {
    id: "03",
    src: encodeURI("/images/lookbook/9af53bb7-6899-4e34-bc0a-be192c069e03.png"),
    alt: "Black male model in a black tee and burgundy wide-leg trousers taking a selfie portrait.",
    title: "Black Meets Burgundy",
    category: "Studio Contrast",
    description: "A tonal black tee with burgundy volume creating a strong, understated contrast.",
    tags: ["Tee", "Monochrome", "Statement"],
    filters: ["essentials", "tailoring"],
    width: 878,
    height: 1791,
    objectPosition: "center bottom",
  },
  {
    id: "04",
    src: "/images/lookbook/lookbook-04-white-tee-standing.webp",
    alt: "Model standing in a white T-shirt, relaxed black trousers and black shoes, carrying a brown leather bag.",
    title: "Ready to Carry",
    category: "Travel Edit",
    description: "A white tee and relaxed black trousers styled with a leather carryall.",
    tags: ["Essential", "Tee", "Travel"],
    filters: ["essentials", "tailoring"],
    width: 897,
    height: 1754,
    objectPosition: "center bottom",
  },
  {
    id: "05",
    src: "/images/lookbook/lookbook-05-black-tee-burgundy-seated.webp",
    alt: "Model seated in a black T-shirt and burgundy trousers against a light studio backdrop.",
    title: "Burgundy, at Ease",
    category: "Studio Portrait",
    description: "A relaxed seated portrait pairing a black tee with burgundy trousers.",
    tags: ["Tee", "Burgundy", "Studio"],
    filters: ["essentials", "tailoring"],
    width: 1024,
    height: 1536,
    objectPosition: "center bottom",
  },
  {
    id: "06",
    src: "/images/lookbook/lookbook-06-black-tee-burgundy-standing.webp",
    alt: "Model standing in a black T-shirt and burgundy trousers.",
    title: "Burgundy in Full",
    category: "Studio Contrast",
    description: "A full-length view of a black tee styled with burgundy trousers.",
    tags: ["Tee", "Burgundy", "Tailored"],
    filters: ["essentials", "tailoring"],
    width: 878,
    height: 1792,
    objectPosition: "center bottom",
  },
  {
    id: "07",
    src: "/images/lookbook/lookbook-07-white-tee-front.webp",
    alt: "Model facing forward in a white T-shirt and relaxed black trousers, carrying a brown leather bag.",
    title: "Clean Lines in White",
    category: "Everyday Essential",
    description: "A front-facing look at a white tee and relaxed black trouser pairing.",
    tags: ["Essential", "Tee", "Minimal"],
    filters: ["essentials", "tailoring"],
    width: 896,
    height: 1755,
    objectPosition: "center bottom",
  },
  {
    id: "08",
    src: "/images/lookbook/lookbook-08-white-tee-seated.webp",
    alt: "Model seated in a white T-shirt and relaxed black trousers with a brown leather bag.",
    title: "The Off-Duty Edit",
    category: "Everyday Essential",
    description: "A seated portrait in a white tee and relaxed black trousers.",
    tags: ["Essential", "Tee", "Studio"],
    filters: ["essentials", "tailoring"],
    width: 1024,
    height: 1536,
    objectPosition: "center bottom",
  },
  {
    id: "09",
    src: "/images/lookbook/lookbook-09-blue-polo-seated.webp",
    alt: "Model seated in a blue polo and white trousers with a tan backpack.",
    title: "Blue, at Ease",
    category: "Refined Casual",
    description: "A blue polo and white trousers styled with a tan backpack.",
    tags: ["Polo", "Casual", "Travel"],
    filters: ["essentials", "polos", "tailoring"],
    width: 1024,
    height: 1536,
    objectPosition: "center bottom",
  },
  {
    id: "10",
    src: "/images/lookbook/lookbook-10-blue-polo-standing.webp",
    alt: "Model standing in a blue polo and white trousers with a tan backpack.",
    title: "The Everyday Polo",
    category: "Refined Casual",
    description: "A full-length blue polo look with white trousers and a tan backpack.",
    tags: ["Polo", "Casual", "Travel"],
    filters: ["essentials", "polos", "tailoring"],
    width: 878,
    height: 1792,
    objectPosition: "center bottom",
  },
  {
    id: "11",
    src: "/images/lookbook/lookbook-11-black-tee-burgundy-walking.webp",
    alt: "Model walking in a black T-shirt and burgundy trousers.",
    title: "A Step in Burgundy",
    category: "Studio Contrast",
    description: "A walking portrait featuring a black tee and burgundy trousers.",
    tags: ["Tee", "Burgundy", "Motion"],
    filters: ["essentials", "tailoring"],
    width: 878,
    height: 1792,
    objectPosition: "center bottom",
  },
  {
    id: "12",
    src: "/images/lookbook/lookbook-12-blue-polo-front.webp",
    alt: "Model facing forward in a blue polo and white trousers with a tan backpack.",
    title: "Blue, Considered",
    category: "Refined Casual",
    description: "A front-facing view of a blue polo paired with white trousers.",
    tags: ["Polo", "Casual", "Tailored"],
    filters: ["essentials", "polos", "tailoring"],
    width: 878,
    height: 1791,
    objectPosition: "center bottom",
  },
];

const filterOptions: { value: LookFilter | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "essentials", label: "Essentials" },
  { value: "polos", label: "Polos" },
  { value: "tailoring", label: "Tailoring" },
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
  const galleryShots = filter === "all" ? filtered.filter((shot) => shot.id !== "01") : filtered;

  const reset = () => {
    navigate({ search: { filter: "all" }, replace: true });
  };

  return (
    <div ref={ref}>
      {/* Editorial cover */}
      <section
        className="relative isolate flex min-h-[680px] items-center overflow-hidden bg-[#e9e2d7] px-5 py-16 text-[#201d19] sm:px-8 lg:min-h-[min(820px,calc(100svh-5rem))] lg:px-16"
        data-reveal
      >
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_72%_44%,rgba(255,255,255,0.72),transparent_42%),linear-gradient(115deg,#e9e2d7_0%,#e4dbce_100%)]" />
        <div className="relative z-10 max-w-[58rem] pb-40 sm:pb-44 lg:pb-20">
          <div className="mb-7 flex items-center gap-3 text-[9px] font-bold uppercase tracking-[0.34em] text-[#62594e] sm:text-[10px]">
            <span className="h-px w-8 bg-[#8f806f]" />
            Knot &amp; Nomad · Studio notes · 01
          </div>
          <h1 className="font-display text-[clamp(4rem,10vw,9.5rem)] leading-[0.78] tracking-[-0.09em]">
            <span className="block">An editorial</span>
            <span className="mt-3 block">
              of <span className="text-accent">motion.</span>
            </span>
          </h1>
          <p className="mt-8 max-w-sm text-sm leading-6 text-[#62594e] sm:text-base sm:leading-7">
            Considered silhouettes, honest fabrics, and personal stories — captured between the
            studio and the street.
          </p>
          <div className="mt-8 flex items-center gap-5 text-[9px] font-bold uppercase tracking-[0.25em] text-[#62594e]">
            <span className="border-l border-[#9d9080] pl-4">SS Capsule</span>
            <span>12 looks · 01 story</span>
          </div>
        </div>
        <div className="pointer-events-none absolute bottom-0 right-[-1.25rem] z-0 flex h-[58%] w-[68%] items-end justify-center sm:h-[72%] sm:w-[56%] lg:right-[7%] lg:h-[94%] lg:w-[43%]">
          <img
            src={shots[0].src}
            alt="Model in a white tee and relaxed black trousers, carrying a leather bag."
            width={shots[0].width}
            height={shots[0].height}
            fetchPriority="high"
            className="h-full w-full object-contain object-bottom drop-shadow-[0_22px_26px_rgba(47,37,28,0.12)]"
          />
        </div>
        <div className="absolute bottom-5 right-5 z-10 text-right text-[8px] font-bold uppercase tracking-[0.25em] text-[#62594e] sm:bottom-8 sm:right-8 lg:right-16">
          <span className="block">Look 01 / 12</span>
          <span className="mt-1 block font-normal tracking-[0.16em]">Everyday, considered</span>
        </div>
      </section>

      {/* Filters */}
      <section className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8 pb-8" data-reveal>
        <div className="border-y border-border py-5 lg:py-7 space-y-5">
          <FilterRow label="Filter" options={filterOptions} value={filter} onChange={setFilter} />
          <div className="flex items-center justify-between pt-1 text-[10px] font-bold uppercase tracking-[0.28em] text-muted-foreground">
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

      {/* Editorial gallery */}
      <section className="mx-auto max-w-[1600px] px-4 pb-24 pt-5 sm:px-6 lg:px-10 lg:pt-10">
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
          <>
            <div className="mb-7 flex items-end justify-between border-b border-border pb-4 sm:mb-10 sm:pb-5">
              <div>
                <div className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
                  The collection
                </div>
                <h2 className="mt-2 font-display text-3xl tracking-[-0.06em] sm:text-4xl">
                  Looks in focus
                </h2>
              </div>
              <span className="pb-1 text-[9px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
                01 — {String(filtered.length).padStart(2, "0")}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-x-5 gap-y-12 sm:grid-cols-2 sm:gap-x-8 lg:gap-x-12 lg:gap-y-16">
              {galleryShots.map((shot) => {
                const position = shots.findIndex((item) => item.id === shot.id) + 1;
                return (
                  <button
                    key={shot.id}
                    type="button"
                    onClick={() => setSelected(shot)}
                    data-reveal
                    data-reveal-delay={(position % 4).toString()}
                    className="group text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4"
                  >
                    <div
                      className={`relative overflow-hidden ${shot.id === "02" ? "bg-[#d8d0c4]" : "bg-[#dcd9d2]"}`}
                      style={{ aspectRatio: "4 / 5" }}
                    >
                      <img
                        src={shot.src}
                        alt={shot.alt}
                        loading={position <= 2 ? "eager" : "lazy"}
                        decoding="async"
                        width={shot.width}
                        height={shot.height}
                        style={{ objectPosition: shot.objectPosition }}
                        className="h-full w-full object-contain object-bottom transition-transform duration-[1200ms] ease-out group-hover:scale-[1.025]"
                      />
                      <span className="absolute left-4 top-4 text-[9px] font-bold uppercase tracking-[0.25em] text-[#3f3931]/75 sm:left-6 sm:top-6">
                        No. {shot.id}
                      </span>
                    </div>
                    <div className="flex items-start justify-between gap-4 border-b border-border py-4 sm:py-5">
                      <div>
                        <div className="text-[9px] font-bold uppercase tracking-[0.23em] text-muted-foreground">
                          {shot.category}
                        </div>
                        <div className="mt-2 font-display text-2xl tracking-[-0.04em] sm:text-3xl">
                          {shot.title}
                        </div>
                      </div>
                      <span className="mt-1 shrink-0 text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                        View look ↗
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
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
              <a
                href="/shop#nomad-circle"
                className="btn-pill inline-flex items-center gap-2 border-2 border-foreground px-7 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-foreground hover:text-primary-foreground"
              >
                Join for drop updates
              </a>
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
