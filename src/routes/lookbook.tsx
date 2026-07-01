import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useMemo } from "react";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useReveal } from "@/hooks/useReveal";
import { cn } from "@/lib/utils";
import lb1 from "@/assets/lb-1.jpg";
import lb2 from "@/assets/lb-2.jpg";
import lb3 from "@/assets/lb-3.jpg";
import lb4 from "@/assets/lb-4.jpg";
import lb5 from "@/assets/lb-5.jpg";
import lb6 from "@/assets/lb-6.jpg";
import lb7 from "@/assets/lb-7.jpg";

const searchSchema = z.object({
  type: fallback(z.enum(["all", "tee", "sweater", "polo", "detail"]), "all").default("all"),
  tone: fallback(z.enum(["all", "earth", "neutral", "monochrome", "graphic"]), "all").default("all"),
  print: fallback(z.enum(["all", "none", "front", "back", "chest"]), "all").default("all"),
});

export const Route = createFileRoute("/lookbook")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "Lookbook — Knot & Nomad | Editorial of Motion" },
      { name: "description", content: "An editorial gallery of Knot & Nomad custom apparel — premium streetwear, sweats, tees and runway pieces, photographed in motion." },
      { property: "og:title", content: "Lookbook — Knot & Nomad" },
      { property: "og:description", content: "Editorial visuals from the Knot & Nomad studio." },
      { property: "og:image", content: "/og-about.jpg" },
    ],
  }),
  component: Lookbook,
});

type ClothingType = "sweater" | "tee" | "polo" | "detail";
type ColorTone = "earth" | "neutral" | "monochrome" | "graphic";
type PrintPosition = "none" | "front" | "back" | "chest";

type Shot = {
  src: string;
  alt: string;
  caption: string;
  tag: string;
  ratio: string;
  span?: string;
  type: ClothingType;
  tone: ColorTone;
  print: PrintPosition;
};

const shots: Shot[] = [
  { src: lb2, alt: "Heavyweight mock-neck sweater in the city", caption: "Skyline Mock-Neck", tag: "Chapter 01 — Urban", ratio: "aspect-[3/4]", span: "lg:col-span-7 lg:row-span-2", type: "sweater", tone: "neutral", print: "none" },
  { src: lb1, alt: "Premium fleece detail in earth tones", caption: "Earthtone Fleece Study", tag: "Material — 320gsm", ratio: "aspect-[4/5]", span: "lg:col-span-5", type: "detail", tone: "earth", print: "none" },
  { src: lb4, alt: "Acid-wash boxy denim tee", caption: "Acid-Wash Denim Tee", tag: "Capsule — Stonework", ratio: "aspect-[4/5]", span: "lg:col-span-5", type: "tee", tone: "monochrome", print: "none" },
  { src: lb6, alt: "Statement print tee — Inspiration", caption: "Inspiration — Graphic Tee", tag: "Print — Editorial", ratio: "aspect-[4/5]", span: "lg:col-span-7", type: "tee", tone: "graphic", print: "back" },
  { src: lb5, alt: "Runway look — half-zip and cargo set", caption: "Runway 02 — Half-Zip Set", tag: "Runway — SS Capsule", ratio: "aspect-[3/4]", span: "lg:col-span-4", type: "polo", tone: "monochrome", print: "none" },
  { src: lb3, alt: "Oversized sand tee on stand", caption: "Sand Oversized Tee", tag: "Studio — Atelier", ratio: "aspect-[1/1]", span: "lg:col-span-4", type: "tee", tone: "neutral", print: "none" },
  { src: lb7, alt: "Embroidered Seek Ye First detail", caption: "Seek Ye First — Embroidery", tag: "Detail — Tonal Stitch", ratio: "aspect-[3/4]", span: "lg:col-span-4", type: "tee", tone: "monochrome", print: "chest" },
];

const typeOptions: { value: ClothingType | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "tee", label: "Tees" },
  { value: "sweater", label: "Sweaters" },
  { value: "polo", label: "Polos" },
  { value: "detail", label: "Details" },
];

const toneOptions: { value: ColorTone | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "earth", label: "Earth" },
  { value: "neutral", label: "Neutral" },
  { value: "monochrome", label: "Monochrome" },
  { value: "graphic", label: "Graphic" },
];

const printOptions: { value: PrintPosition | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "none", label: "Blank" },
  { value: "chest", label: "Chest" },
  { value: "front", label: "Front" },
  { value: "back", label: "Back" },
];

function Lookbook() {
  const ref = useReveal();
  const { type, tone, print } = Route.useSearch();
  const navigate = useNavigate({ from: "/lookbook" });

  const setParam = (key: "type" | "tone" | "print", value: string) => {
    navigate({
      search: (prev: Record<string, string>) => ({ ...prev, [key]: value }),
      replace: true,
    });
  };

  const filtered = useMemo(
    () =>
      shots.filter(
        (s) =>
          (type === "all" || s.type === type) &&
          (tone === "all" || s.tone === tone) &&
          (print === "all" || s.print === print),
      ),
    [type, tone, print],
  );

  const reset = () => {
    navigate({ search: { type: "all", tone: "all", print: "all" }, replace: true });
  };

  const activeCount = [type, tone, print].filter((v) => v !== "all").length;

  return (
    <div ref={ref}>
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 pt-24 lg:pt-36 pb-12" data-reveal>
        <div className="flex items-end justify-between flex-wrap gap-6">
          <div>
            <div className="eyebrow">Lookbook · Vol. 01</div>
            <h1 className="mt-5 font-display text-5xl lg:text-7xl xl:text-8xl leading-[1.02] max-w-5xl">
              An editorial of <em className="italic text-accent">motion</em>.
            </h1>
            <p className="mt-6 max-w-xl text-muted-foreground leading-relaxed">
              Considered silhouettes, honest fabrics, and personal stories — captured between the studio and the street.
            </p>
          </div>
          <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            <div>SS Capsule</div>
            <div className="mt-1">7 Looks · 1 Story</div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 pb-10" data-reveal>
        <div className="border-y border-border py-6 lg:py-8 space-y-5">
          <FilterRow label="Clothing" options={typeOptions} value={type} onChange={(v) => setParam("type", v)} />
          <FilterRow label="Tone" options={toneOptions} value={tone} onChange={(v) => setParam("tone", v)} />
          <FilterRow label="Print" options={printOptions} value={print} onChange={(v) => setParam("print", v)} />
          <div className="flex items-center justify-between pt-1 text-xs uppercase tracking-[0.25em] text-muted-foreground">
            <span>
              {filtered.length} of {shots.length} looks
            </span>
            {activeCount > 0 && (
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
            <button onClick={reset} className="mt-6 text-xs uppercase tracking-[0.28em] border-b border-foreground pb-1 hover:text-accent hover:border-accent transition">
              Clear and see all
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 auto-rows-auto">
            {filtered.map((s, i) => (
              <figure
                key={s.src}
                data-reveal
                data-reveal-delay={(i % 4).toString()}
                className={`group relative overflow-hidden bg-secondary ${s.span ?? "lg:col-span-6"}`}
              >
                <div className={`overflow-hidden ${s.ratio}`}>
                  <img
                    src={s.src}
                    alt={s.alt}
                    loading="lazy"
                    width={1200}
                    height={1500}
                    className="w-full h-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.04]"
                  />
                </div>
                <figcaption className="absolute inset-x-0 bottom-0 p-5 lg:p-6 flex items-end justify-between gap-4 bg-gradient-to-t from-black/60 via-black/10 to-transparent text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.3em] opacity-80">{s.tag}</div>
                    <div className="font-display text-xl lg:text-2xl mt-1">{s.caption}</div>
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.3em] opacity-80">
                    {String(i + 1).padStart(2, "0")} / {String(filtered.length).padStart(2, "0")}
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-20 lg:py-28 grid lg:grid-cols-2 gap-10 items-center">
          <h2 className="font-display text-4xl lg:text-6xl leading-[1.05]" data-reveal>
            See a piece you'd want — <em className="italic text-accent">made yours</em>?
          </h2>
          <div className="flex flex-col items-start gap-4" data-reveal data-reveal-delay="2">
            <p className="text-muted-foreground max-w-md">
              Every look in this editorial can be tailored to your colourway, fit, fabric and finish. Brief us in a few lines — we'll take it from there.
            </p>
            <Link
              to="/custom-order"
              className="inline-flex items-center gap-2 bg-foreground text-primary-foreground px-7 py-4 text-xs uppercase tracking-[0.28em] hover:bg-accent hover:text-accent-foreground transition-colors duration-500"
            >
              Start your piece <ArrowRight size={16} />
            </Link>
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
      <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground w-20 shrink-0">
        {label}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={cn(
                "px-4 py-2 text-[11px] uppercase tracking-[0.25em] border transition-colors duration-300",
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
