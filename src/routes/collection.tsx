import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import look1 from "@/assets/look-1.jpg";
import look2 from "@/assets/look-2.jpg";
import look3 from "@/assets/look-3.jpg";
import look4 from "@/assets/look-4.jpg";

export const Route = createFileRoute("/collection")({
  head: () => ({
    meta: [
      { title: "Collection — Knot & Nomad" },
      {
        name: "description",
        content:
          "Discover Knot & Nomad product drops, seasonal stories and limited fashion collections.",
      },
    ],
  }),
  component: Collection,
});

const looks = [
  { image: look1, number: "Look 01", title: "Soft structure" },
  { image: look2, number: "Look 02", title: "Nomad layers" },
  { image: look3, number: "Look 03", title: "Quiet utility" },
  { image: look4, number: "Look 04", title: "After dark" },
];

function Collection() {
  return (
    <>
      <section className="border-b border-border bg-foreground text-primary-foreground">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
          <p className="eyebrow !text-primary-foreground/55">Collection 001 — Rooted in Motion</p>
          <h1 className="mt-5 max-w-5xl font-display text-6xl leading-[0.92] sm:text-7xl lg:text-9xl">
            Clothes for the space <span className="text-accent">between places.</span>
          </h1>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link
              to="/shop"
              className="btn-pill inline-flex items-center gap-2 bg-primary-foreground px-7 py-4 text-xs font-bold uppercase tracking-[0.2em] text-foreground"
            >
              Shop the collection <ArrowRight size={15} />
            </Link>
            <Link
              to="/custom-order"
              className="btn-pill inline-flex items-center gap-2 border border-primary-foreground/30 px-7 py-4 text-xs font-bold uppercase tracking-[0.2em]"
            >
              Start a custom order
            </Link>
            <p className="w-full max-w-md pt-2 text-sm leading-6 text-primary-foreground/60">
              A study in ease, proportion and movement. Limited pieces designed as a single
              wardrobe.
            </p>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {looks.map((look, index) => (
            <figure key={look.number} className={index % 3 === 0 ? "col-span-2 lg:col-span-1" : ""}>
              <div className="aspect-[3/4] overflow-hidden">
                <img
                  src={look.image}
                  alt={`${look.number}: ${look.title}`}
                  className="h-full w-full object-cover transition duration-700 hover:scale-105"
                />
              </div>
              <figcaption className="mt-4 flex justify-between gap-3">
                <span className="eyebrow">{look.number}</span>
                <span className="text-sm">{look.title}</span>
              </figcaption>
            </figure>
          ))}
        </div>
        <div className="mt-24 grid gap-8 border-t border-border pt-10 lg:grid-cols-2">
          <h2 className="font-display text-4xl lg:text-5xl">
            Want something made specifically for you?
          </h2>
          <div>
            <p className="max-w-lg text-muted-foreground">
              The collection is our product story. The Custom Studio is where your story begins.
            </p>
            <Link
              to="/custom-studio"
              className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em]"
            >
              Explore Custom Studio <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
