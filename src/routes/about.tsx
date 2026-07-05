import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";
import look2 from "@/assets/look-2.jpg";
import look3 from "@/assets/look-3.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Knot & Nomad | Rooted in Motion" },
      { name: "description", content: "The story of Knot & Nomad: a premium custom apparel studio built on culture, movement and individuality." },
      { property: "og:title", content: "About — Knot & Nomad" },
      { property: "og:description", content: "A premium custom apparel studio rooted in culture, movement and individuality." },
      { property: "og:image", content: "/og-about.jpg" },
      { name: "twitter:image", content: "/og-about.jpg" },
    ],
  }),
  component: About,
});

function About() {
  const ref = useReveal();
  return (
    <div ref={ref}>
      <section className="mx-auto max-w-7xl px-6 lg:px-10 pt-24 lg:pt-36 pb-12" data-reveal>
        <div className="eyebrow">About the studio</div>
        <h1 className="mt-5 font-display text-5xl lg:text-7xl xl:text-8xl leading-[1.02] max-w-5xl">
          A studio for those who carry their <span className="text-accent">roots</span> wherever they go.
        </h1>
      </section>

      <section className="mx-auto max-w-7xl px-6 lg:px-10 grid lg:grid-cols-12 gap-12 pb-24 lg:pb-32">
        <div className="lg:col-span-7 img-lift" data-reveal>
          <img src={look3} alt="Knot & Nomad lookbook" loading="lazy" width={1024} height={1280}
               className="w-full aspect-[4/5] object-cover" />
        </div>
        <div className="lg:col-span-5 space-y-6 text-muted-foreground leading-[1.8]" data-reveal data-reveal-delay="2">
          <p className="text-xl text-foreground font-display italic leading-snug">
            "Clothing should feel like you. Not the loud version. The honest one."
          </p>
          <p>
            Knot & Nomad began with a simple belief — that a garment carries
            more than fabric. It carries the place you come from, the people
            who shaped you, and the future you're walking towards.
          </p>
          <p>
            We're a custom apparel studio designing premium pieces — T-shirts,
            caps, hoodies, polos and streetwear — for creators, brands and
            individuals. Every garment we make starts as a story. Yours.
          </p>
          <p>
            Inspired by culture and movement, our work blends modern fashion
            with personal narrative. Considered details. Honest materials.
            Craft that travels with you.
          </p>
          <p className="text-foreground font-display text-3xl italic pt-2">— Rooted in Motion.</p>
        </div>
      </section>

      <section className="bg-secondary py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 grid lg:grid-cols-2 gap-14 items-center">
          <div className="img-lift" data-reveal>
            <img src={look2} alt="Detail shot" loading="lazy" width={1024} height={1280}
                 className="w-full aspect-square object-cover" />
          </div>
          <div data-reveal data-reveal-delay="2">
            <div className="eyebrow">Our practice</div>
            <h2 className="mt-3 font-display text-4xl lg:text-5xl xl:text-6xl leading-[1.05]">
              Considered. Crafted. <span className="text-accent">Cared for.</span>
            </h2>
            <ul className="mt-10 space-y-6">
              {[
                ["Premium materials", "Heavyweight cottons, brushed fleece, durable threads."],
                ["Custom-first", "From a single piece to a full capsule — built around you."],
                ["Direct dialogue", "We talk through every brief on WhatsApp or email."],
                ["Limited & considered", "We don't mass-produce. We craft."],
              ].map(([t, d]) => (
                <li key={t} className="border-b border-border pb-5 group">
                  <div className="font-display text-2xl tracking-tight group-hover:text-accent transition-colors">{t}</div>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{d}</p>
                </li>
              ))}
            </ul>
            <Link to="/custom-order" className="btn-pill mt-12 inline-flex items-center gap-2 bg-foreground text-primary-foreground px-7 py-4 text-xs font-bold uppercase tracking-[0.28em] hover:bg-accent hover:text-accent-foreground transition-colors duration-500">
              Start your piece <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
