import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useReveal } from "@/hooks/useReveal";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { collections, getCollection, getCollectionShots, type Shot } from "@/lib/lookbook-data";

export const Route = createFileRoute("/lookbook/$collection")({
  loader: ({ params }) => {
    const collection = getCollection(params.collection);
    if (!collection) throw notFound();
    return { collection };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.collection.title ?? "Lookbook"} — Knot & Nomad Lookbook` },
      { name: "description", content: loaderData?.collection.description ?? "" },
      {
        property: "og:title",
        content: `${loaderData?.collection.title ?? "Lookbook"} — Knot & Nomad`,
      },
      { property: "og:description", content: loaderData?.collection.description ?? "" },
      { property: "og:image", content: "https://knotnomad.com/og-knotnomad.png" },
    ],
  }),
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl px-6 py-32 text-center">
      <h1 className="font-display text-4xl">Look not found</h1>
      <Link
        to="/lookbook"
        className="mt-8 inline-block border-b border-foreground pb-1 text-xs font-bold uppercase tracking-[0.28em]"
      >
        Back to the lookbook
      </Link>
    </div>
  ),
  component: CollectionPage,
});

function CollectionPage() {
  const ref = useReveal();
  const { collection } = Route.useLoaderData();
  const items = getCollectionShots(collection.slug);
  const [selected, setSelected] = useState<Shot | null>(null);
  const others = collections.filter((c) => c.slug !== collection.slug);

  return (
    <div ref={ref}>
      <section className="mx-auto max-w-[1600px] px-4 pb-8 pt-10 sm:px-6 lg:px-10 lg:pt-14">
        <Link
          to="/lookbook"
          className="inline-flex min-h-11 items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-muted-foreground transition hover:text-accent"
        >
          <ArrowLeft size={14} /> All edits
        </Link>
        <div className="mt-6 grid gap-6 border-b border-border pb-8 lg:grid-cols-[1fr_minmax(0,28rem)] lg:items-end">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent">
              Edit {collection.number} · {items.length} photographs
            </div>
            <h1 className="mt-3 font-display text-5xl leading-[0.95] tracking-[-0.06em] sm:text-7xl">
              {collection.title}
            </h1>
          </div>
          <p className="text-muted-foreground">{collection.description}</p>
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-4 pb-20 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-x-5 gap-y-12 sm:grid-cols-2 sm:gap-x-8 lg:gap-x-12 lg:gap-y-16">
          {items.map((shot, index) => (
            <button
              key={shot.id}
              type="button"
              onClick={() => setSelected(shot)}
              data-reveal
              data-reveal-delay={(index % 4).toString()}
              className="group text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4"
            >
              <div
                className="relative overflow-hidden bg-[#dcd9d2]"
                style={{ aspectRatio: "4 / 5" }}
              >
                <img
                  src={shot.src}
                  alt={shot.alt}
                  loading={index < 2 ? "eager" : "lazy"}
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
              <div className="border-b border-border py-4 sm:py-5">
                <div className="text-[9px] font-bold uppercase tracking-[0.23em] text-muted-foreground">
                  {shot.category}
                </div>
                <div className="mt-2 font-display text-2xl tracking-[-0.04em] sm:text-3xl">
                  {shot.title}
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-5 px-6 py-12 lg:flex-row lg:items-center lg:justify-between lg:px-10">
          <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
            More edits
          </div>
          <div className="flex flex-wrap gap-3">
            {others.map((c) => (
              <Link
                key={c.slug}
                to="/lookbook/$collection"
                params={{ collection: c.slug }}
                className="inline-flex min-h-11 items-center gap-2 border border-border px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] transition hover:border-foreground"
              >
                {c.title} <ArrowRight size={14} />
              </Link>
            ))}
            <Link
              to="/custom-order"
              className="btn-pill inline-flex min-h-11 items-center gap-2 bg-foreground px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Customise a similar look <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      <Dialog open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        {selected && (
          <DialogContent className="max-h-[94vh] max-w-[96vw] overflow-y-auto border-0 bg-background p-0 sm:rounded-none lg:max-w-6xl [&>button]:z-10 [&>button]:bg-background/90 [&>button]:p-2">
            <div className="grid lg:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.55fr)]">
              <div className="flex max-h-[72vh] min-h-[45vh] items-center justify-center bg-black lg:max-h-[94vh]">
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
    </div>
  );
}
