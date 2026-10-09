import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";
import { collections, getCollectionShots, shots } from "@/lib/lookbook-data";

export const Route = createFileRoute("/lookbook/")({
  head: () => ({
    meta: [
      { title: "Lookbook — Knot & Nomad | Editorial of Motion" },
      {
        name: "description",
        content:
          "Explore Knot & Nomad editorial looks in three edits: the white tee, the blue polo and black meets burgundy.",
      },
      { property: "og:title", content: "Lookbook — Knot & Nomad" },
      { property: "og:description", content: "Editorial visuals from the Knot & Nomad studio." },
      { property: "og:image", content: "https://knotnomad.com/og-knotnomad.png" },
    ],
  }),
  component: Lookbook,
});

function Lookbook() {
  const ref = useReveal();

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
            <span>12 looks · 03 edits</span>
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

      {/* Collections */}
      <section className="mx-auto max-w-[1600px] px-4 pb-24 pt-10 sm:px-6 lg:px-10 lg:pt-14">
        <div className="mb-7 flex items-end justify-between border-b border-border pb-4 sm:mb-10 sm:pb-5">
          <div>
            <div className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
              Three edits
            </div>
            <h2 className="mt-2 font-display text-3xl tracking-[-0.06em] sm:text-4xl">
              Choose a look
            </h2>
          </div>
          <span className="pb-1 text-[9px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
            {collections.length} edits · {shots.length} photographs
          </span>
        </div>
        <div className="grid grid-cols-1 gap-x-6 gap-y-12 md:grid-cols-3">
          {collections.map((collection, index) => {
            const items = getCollectionShots(collection.slug);
            const cover = items.find((s) => s.id === collection.coverId) ?? items[0];
            return (
              <Link
                key={collection.slug}
                to="/lookbook/$collection"
                params={{ collection: collection.slug }}
                data-reveal
                data-reveal-delay={index.toString()}
                className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4"
              >
                <div
                  className="relative overflow-hidden bg-[#dcd9d2]"
                  style={{ aspectRatio: "4 / 5" }}
                >
                  <img
                    src={cover.src}
                    alt={cover.alt}
                    loading={index === 0 ? "eager" : "lazy"}
                    decoding="async"
                    width={cover.width}
                    height={cover.height}
                    style={{ objectPosition: cover.objectPosition }}
                    className="h-full w-full object-contain object-bottom transition-transform duration-[1200ms] ease-out group-hover:scale-[1.025]"
                  />
                  <span className="absolute left-4 top-4 text-[9px] font-bold uppercase tracking-[0.25em] text-[#3f3931]/75 sm:left-6 sm:top-6">
                    Edit {collection.number}
                  </span>
                </div>
                <div className="border-b border-border py-4 sm:py-5">
                  <div className="text-[9px] font-bold uppercase tracking-[0.23em] text-muted-foreground">
                    {items.length} photographs
                  </div>
                  <div className="mt-2 font-display text-2xl tracking-[-0.04em] sm:text-3xl">
                    {collection.title}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{collection.tagline}</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] group-hover:text-accent">
                    View all {items.length} <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

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
