import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import catTshirt from "@/assets/cat-tshirt.jpg";
import catCap from "@/assets/cat-cap.jpg";
import catHoodie from "@/assets/cat-hoodie.jpg";
import catStreet from "@/assets/cat-streetwear.jpg";
import catPolo from "@/assets/cat-polo.jpg";
import catAcc from "@/assets/cat-accessories.jpg";

export const Route = createFileRoute("/custom-studio")({
  head: () => ({
    meta: [
      { title: "Custom Studio — Knot & Nomad" },
      {
        name: "description",
        content:
          "Explore garments, uniforms and capsule drops you can customise with Knot & Nomad.",
      },
    ],
  }),
  component: CustomStudio,
});

const items = [
  {
    img: catTshirt,
    name: "Tees & Tops",
    desc: "Plain, oversized or printed tees, collar shirts and branded essentials.",
    use: "Personal pieces, merch and teamwear",
    methods: "DTF, screen print, puff print, embroidery",
    price: "From ₦18,000",
  },
  {
    img: catHoodie,
    name: "Jackets & Layers",
    desc: "Zip jackets, cropped silhouettes, wool pieces and premium outerwear.",
    use: "Statement layers and premium uniforms",
    methods: "Embroidery, patches, woven labels",
    price: "Quoted by fabric and finish",
  },
  {
    img: catStreet,
    name: "Trousers & Sets",
    desc: "Wide-leg, tailored and cargo trousers, plus coordinated sets.",
    use: "Events, teams and complete looks",
    methods: "Panel details, monogram, woven label",
    price: "From ₦35,000",
  },
  {
    img: catPolo,
    name: "Native Wear",
    desc: "Embroidered and panelled native tops, built as separates or full sets.",
    use: "Celebrations, work and modern occasion wear",
    methods: "Embroidery, monogram, fabric panels",
    price: "Made to measurement",
  },
  {
    img: catCap,
    name: "Brand Uniforms",
    desc: "Considered team uniforms with consistent fit, colour and branding.",
    use: "Hospitality, retail, creative and corporate teams",
    methods: "Embroidery, DTF, screen print, labels",
    price: "Volume quote available",
  },
  {
    img: catAcc,
    name: "Capsule Drops",
    desc: "A complete small-run collection for creatives, teams and brands.",
    use: "Launches, communities and limited releases",
    methods: "Full decoration and label programme",
    price: "Project quote",
  },
];

function CustomStudio() {
  return (
    <>
      <section className="mx-auto max-w-7xl px-6 pb-16 pt-24 lg:px-10 lg:pt-32">
        <p className="eyebrow">Made around your identity</p>
        <h1 className="mt-4 max-w-4xl font-display text-5xl leading-[1.02] lg:text-7xl xl:text-8xl">
          The Custom <span className="text-accent">Studio.</span>
        </h1>
        <p className="mt-7 max-w-2xl leading-relaxed text-muted-foreground">
          Choose a starting silhouette, then work with us on colour, fabric, fit, branding and
          finish. For one-off pieces, uniforms and capsule drops.
        </p>
      </section>
      <section className="mx-auto max-w-7xl px-6 pb-32 lg:px-10">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <article key={item.name} className="group border border-border bg-card">
              <div className="aspect-[4/5] overflow-hidden">
                <img
                  src={item.img}
                  alt={item.name}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
              </div>
              <div className="p-7">
                <h2 className="font-display text-2xl">{item.name}</h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.desc}</p>
                <dl className="mt-5 space-y-3 border-t border-border pt-5 text-xs">
                  <div>
                    <dt className="font-bold uppercase tracking-[0.14em]">Best for</dt>
                    <dd className="mt-1 text-muted-foreground">{item.use}</dd>
                  </div>
                  <div>
                    <dt className="font-bold uppercase tracking-[0.14em]">Suggested methods</dt>
                    <dd className="mt-1 text-muted-foreground">{item.methods}</dd>
                  </div>
                  <div>
                    <dt className="font-bold uppercase tracking-[0.14em]">Pricing</dt>
                    <dd className="mt-1 text-muted-foreground">{item.price}</dd>
                  </div>
                </dl>
                <Link
                  to="/custom-order"
                  className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em]"
                >
                  Start this order <ArrowRight size={14} />
                </Link>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-16 border border-border bg-foreground p-8 text-primary-foreground lg:p-10">
          <p className="eyebrow !text-primary-foreground/55">Branding & finishing</p>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-3 font-display text-xl lg:text-2xl">
            {[
              "DTF",
              "Embroidery",
              "Screen print",
              "Puff print",
              "Woven label",
              "Monogram",
              "Patches",
              "Fabric panel detail",
            ].map((method, index) => (
              <span key={method} className="inline-flex gap-5">
                <span>{method}</span>
                {index < 7 && <span className="text-accent">/</span>}
              </span>
            ))}
          </div>
          <Link
            to="/custom-order"
            className="btn-pill mt-8 inline-flex items-center gap-2 bg-primary-foreground px-6 py-3 text-xs font-bold uppercase tracking-[0.18em] text-foreground"
          >
            Brief the studio <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </>
  );
}
