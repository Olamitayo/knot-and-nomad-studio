import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import catTshirt from "@/assets/cat-tshirt.jpg";
import catCap from "@/assets/cat-cap.jpg";
import catHoodie from "@/assets/cat-hoodie.jpg";
import catStreet from "@/assets/cat-streetwear.jpg";
import catPolo from "@/assets/cat-polo.jpg";
import catAcc from "@/assets/cat-accessories.jpg";

export const Route = createFileRoute("/collection")({
  head: () => ({
    meta: [
      { title: "Collection — Knot & Nomad" },
      { name: "description", content: "Explore Knot & Nomad's premium custom apparel collection — t-shirts, caps, hoodies, polos, streetwear and accessories." },
      { property: "og:title", content: "Collection — Knot & Nomad" },
      { property: "og:description", content: "Premium custom apparel collection." },
    ],
  }),
  component: Collection,
});

const items = [
  { img: catTshirt, name: "Custom T-Shirts", desc: "Heavyweight 220–260gsm cottons, oversized & regular fits, screen and DTG printing.", label: "Made to Order" },
  { img: catHoodie, name: "Hoodies & Sweats", desc: "Brushed fleece, dropped shoulders, embroidery and signature prints.", label: "Signature Piece" },
  { img: catCap, name: "Branded Caps", desc: "Six-panel, dad-cap, trucker. Embroidery, patches, gold thread.", label: "Custom Made" },
  { img: catStreet, name: "Streetwear Pieces", desc: "Bombers, cargo pants, layered statement looks for capsule drops.", label: "Limited Edition" },
  { img: catPolo, name: "Premium Polos", desc: "Pique cotton, refined collars, custom embroidery.", label: "Premium Finish" },
  { img: catAcc, name: "Accessories", desc: "Tote bags, beanies, patches and finishing touches.", label: "Studio Edit" },
];

function Collection() {
  return (
    <>
      <section className="mx-auto max-w-7xl px-6 lg:px-10 pt-24 lg:pt-32 pb-16">
        <div className="eyebrow">Collection — Vol. 01</div>
        <h1 className="mt-4 font-display text-5xl lg:text-7xl xl:text-8xl leading-[1.02] max-w-4xl tracking-tight">
          Every category, <span className="text-accent">custom-built</span>.
        </h1>
        <p className="mt-7 max-w-xl text-muted-foreground leading-relaxed">
          A working catalogue of our studio's silhouettes. Every piece below can be
          fully customised — colour, fabric, print, fit and finish. Tap any category
          to brief us on your vision.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-6 lg:px-10 pb-32">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {items.map((c, i) => (
            <article key={c.name} className="group bg-background border border-border hover:border-accent/60 transition-colors duration-500">
              <div className="relative aspect-[4/5] overflow-hidden">
                <img src={c.img} alt={c.name} loading="lazy" width={1024} height={1280}
                     className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.06]"/>
                <span className="absolute top-4 left-4 bg-background/85 backdrop-blur-sm text-[0.6rem] tracking-[0.3em] uppercase px-3 py-1.5 font-medium">
                  {c.label}
                </span>
                <span className="absolute bottom-4 right-4 font-display text-xs tracking-[0.3em] uppercase text-foreground/70">
                  0{i+1} / 0{items.length}
                </span>
              </div>
              <div className="p-7 lg:p-8">
                <h3 className="font-display text-2xl lg:text-3xl tracking-tight">{c.name}</h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{c.desc}</p>
                <Link to="/custom-order" className="mt-6 inline-flex items-center gap-2 text-xs tracking-[0.28em] uppercase border-b border-foreground pb-1 hover:text-accent hover:border-accent transition">
                  Request this style <ArrowRight size={14}/>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
