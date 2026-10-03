import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";
import look2 from "@/assets/look-2.jpg";
import look3 from "@/assets/look-3.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Knot & Nomad | Rooted in Motion" },
      {
        name: "description",
        content:
          "The story of Knot & Nomad: a premium custom apparel studio built on culture, movement and individuality.",
      },
      { property: "og:title", content: "About — Knot & Nomad" },
      {
        property: "og:description",
        content: "A premium custom apparel studio rooted in culture, movement and individuality.",
      },
      { property: "og:image", content: "https://knotnomad.com/og-knotnomad.png" },
      { name: "twitter:image", content: "https://knotnomad.com/og-knotnomad.png" },
    ],
  }),
  component: About,
});

function About() {
  const ref = useReveal();

  return (
    <div ref={ref}>
      <section className="mx-auto max-w-7xl px-6 pb-12 pt-24 lg:px-10 lg:pt-36" data-reveal>
        <div className="grid items-end gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="eyebrow">About the studio</div>
            <h1 className="mt-5 max-w-5xl font-display text-5xl leading-[1.02] lg:text-7xl xl:text-8xl">
              A studio for those who carry their <span className="text-accent">roots</span>
              wherever they go.
            </h1>
          </div>

          <div className="rounded-[2rem] border border-border bg-card p-6 shadow-[0_22px_60px_rgba(15,14,12,0.05)]">
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Rooted in motion
            </p>
            <div className="mt-6 grid grid-cols-3 gap-4">
              {[
                ["Custom", "5–14 days"],
                ["Made", "Worldwide"],
                ["Focus", "Identity"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-border bg-background p-3 text-center"
                >
                  <p className="text-[0.58rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                    {label}
                  </p>
                  <p className="mt-2 font-display text-2xl leading-none">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-6 pb-24 lg:grid-cols-12 lg:px-10 lg:pb-32">
        <div className="img-lift lg:col-span-7" data-reveal>
          <img
            src={look3}
            alt="Knot & Nomad lookbook"
            loading="lazy"
            width={1024}
            height={1280}
            className="aspect-[4/5] w-full object-cover"
          />
        </div>

        <div
          className="space-y-6 leading-[1.8] text-muted-foreground lg:col-span-5"
          data-reveal
          data-reveal-delay="2"
        >
          <p className="font-display text-xl italic leading-snug text-foreground">
            “Clothing should feel like you. Not the loud version. The honest one.”
          </p>
          <p>
            Knot & Nomad began with a simple belief — that a garment carries more than fabric. It
            carries the place you come from, the people who shaped you, and the future you're
            walking towards.
          </p>
          <p>
            We're a custom apparel studio designing premium pieces — T-shirts, caps, hoodies, polos
            and streetwear — for creators, brands and individuals. Every garment we make starts as a
            story. Yours.
          </p>
          <p>
            Inspired by culture and movement, our work blends modern fashion with personal
            narrative. Considered details. Honest materials. Craft that travels with you.
          </p>
          <p className="pt-2 font-display text-3xl italic text-foreground">— Rooted in Motion.</p>
        </div>
      </section>

      <section className="bg-secondary py-24 lg:py-32">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 lg:grid-cols-2 lg:px-10">
          <div className="img-lift" data-reveal>
            <img
              src={look2}
              alt="Detail shot"
              loading="lazy"
              width={1024}
              height={1280}
              className="aspect-square w-full object-cover"
            />
          </div>

          <div data-reveal data-reveal-delay="2">
            <div className="eyebrow">Our practice</div>
            <h2 className="mt-3 font-display text-4xl leading-[1.05] lg:text-5xl xl:text-6xl">
              Considered. Crafted. <span className="text-accent">Cared for.</span>
            </h2>

            <ul className="mt-10 space-y-6">
              {[
                ["Premium materials", "Heavyweight cottons, brushed fleece, durable threads."],
                ["Custom-first", "From a single piece to a full capsule — built around you."],
                ["Direct dialogue", "We talk through every brief on WhatsApp or email."],
                ["Limited & considered", "We don't mass-produce. We craft."],
              ].map(([t, d]) => (
                <li key={t} className="group border-b border-border pb-5">
                  <div className="font-display text-2xl tracking-tight transition-colors group-hover:text-accent">
                    {t}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{d}</p>
                </li>
              ))}
            </ul>

            <Link
              to="/custom-order"
              className="btn-pill mt-12 inline-flex items-center gap-2 bg-foreground px-7 py-4 text-xs font-bold uppercase tracking-[0.28em] text-primary-foreground transition-colors duration-500 hover:bg-accent hover:text-accent-foreground"
            >
              Start your piece <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
        <div
          className="mb-12 rounded-[2rem] border border-border bg-card p-6 text-center shadow-[0_18px_50px_rgba(15,14,12,0.04)] sm:p-8"
          data-reveal
        >
          <div className="eyebrow">What we believe</div>
          <p className="mx-auto mt-4 max-w-4xl font-display text-3xl leading-tight text-foreground sm:text-4xl lg:text-5xl">
            “Style should feel like a second skin — personal, confident, and built for real life.”
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {[
            ["Identity", "We design around how you move, speak, work and express yourself."],
            ["Quality", "Fabric, finish and fit are chosen with intention — never by accident."],
            ["Movement", "Our pieces are built to feel easy, elevated and ready for real life."],
          ].map(([title, copy], index) => (
            <div
              key={title}
              className="rounded-[1.8rem] border border-border bg-card p-7 shadow-[0_10px_30px_rgba(15,14,12,0.03)]"
              data-reveal
              data-reveal-delay={String(index + 1)}
            >
              <span className="font-display text-4xl leading-none text-accent">0{index + 1}</span>
              <h3 className="mt-6 font-display text-2xl">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{copy}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
