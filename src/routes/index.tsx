import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, PenLine, CheckCircle2, Scissors, Truck, MessageCircle } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";
import heroEditorial from "@/assets/hero-editorial.jpg";
import hero1 from "@/assets/hero-1.jpg";
import hero2 from "@/assets/hero-2.jpg";
import hero3 from "@/assets/hero-3.jpg";
import hero4 from "@/assets/hero-4.jpg";
import { HeroSlideshow } from "@/components/HeroSlideshow";
import catTshirt from "@/assets/cat-tshirt.jpg";
import catCap from "@/assets/cat-cap.jpg";
import catHoodie from "@/assets/cat-hoodie.jpg";
import catStreet from "@/assets/cat-streetwear.jpg";
import catPolo from "@/assets/cat-polo.jpg";
import catAcc from "@/assets/cat-accessories.jpg";
import { supabase } from "@/integrations/supabase/client";
import { formatNaira } from "@/lib/format";
import { fallbackProducts } from "@/lib/products";
import { whatsappLink } from "@/lib/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Knot & Nomad — Custom Premium Apparel | Rooted in Motion" },
      {
        name: "description",
        content:
          "Design your own premium T-shirts, caps, hoodies and streetwear with Knot & Nomad. Custom apparel made around your identity.",
      },
      { property: "og:title", content: "Knot & Nomad — Custom Premium Apparel" },
      {
        property: "og:description",
        content: "Premium custom apparel designed around your identity.",
      },
      { property: "og:image", content: "https://knotnomad.com/og-knotnomad.png" },
      { name: "twitter:image", content: "https://knotnomad.com/og-knotnomad.png" },
    ],
  }),
  component: Home,
});

const categories = [
  {
    img: catTshirt,
    name: "Custom T-Shirts",
    desc: "Heavyweight cottons, signature fits, your design.",
    label: "Made to Order",
  },
  {
    img: catCap,
    name: "Branded Caps",
    desc: "Embroidered, printed or patched — your mark.",
    label: "Signature Piece",
  },
  {
    img: catHoodie,
    name: "Hoodies",
    desc: "Premium fleece, oversized cuts, statement prints.",
    label: "Custom Made",
  },
  {
    img: catStreet,
    name: "Streetwear",
    desc: "Limited drops engineered around your identity.",
    label: "Limited Edition",
  },
  {
    img: catPolo,
    name: "Polo Shirts",
    desc: "Refined essentials with a custom finish.",
    label: "Premium Finish",
  },
  {
    img: catAcc,
    name: "Accessories",
    desc: "Tote bags, beanies, patches and more.",
    label: "Studio Edit",
  },
];

const steps = [
  {
    icon: PenLine,
    title: "Submit your idea",
    text: "Describe the garment, colour, fit and finish, then upload any useful references.",
  },
  {
    icon: CheckCircle2,
    title: "We review your design",
    text: "The studio checks feasibility, material, decoration method and measurements.",
  },
  {
    icon: Scissors,
    title: "We confirm price & timeline",
    text: "You receive a clear production quote and expected delivery window.",
  },
  {
    icon: CheckCircle2,
    title: "You approve & pay deposit",
    text: "Production begins after your brief is approved and the required deposit is received.",
  },
  {
    icon: Truck,
    title: "We produce & deliver",
    text: "Your piece is made, quality checked and delivered nationwide.",
  },
];

function Home() {
  const ref = useReveal();
  const [featured, setFeatured] = useState<
    {
      id: string;
      slug: string;
      name: string;
      category: string;
      price_ngn: number;
      images: string[];
      colors: string[];
      is_customizable: boolean;
    }[]
  >([]);
  useEffect(() => {
    supabase
      .from("products")
      .select("id,slug,name,category,price_ngn,images,colors,is_customizable")
      .eq("is_active", true)
      .order("is_bestseller", { ascending: false })
      .order("sort_order")
      .limit(4)
      .then(({ data }) => setFeatured(data?.length ? data : fallbackProducts.slice(0, 4)));
  }, []);
  return (
    <div ref={ref}>
      {/* HERO */}
      <section className="editorial-list relative overflow-hidden border-b border-white/10 bg-[#1a1716]">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="space-y-0 py-2 sm:py-3">
            {[
              "02 Collar shirts",
              "03 Wide-leg trousers",
              "04 Jackets",
              "05 Native custom wear",
              "06 Brand uniforms & capsule drops",
            ].map((item, index) => (
              <div key={item} className="editorial-item flex items-center gap-4 py-5 sm:py-6">
                <span className="editorial-item__number">{item.split(" ")[0]}</span>
                <span className="editorial-item__label text-white/95">{item.replace(/^\d+\s/, "")}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="border-y border-[#3a4238] bg-[#b7c8b3] py-4 text-[#171717] overflow-hidden">
        <div className="marquee flex items-center gap-12 whitespace-nowrap text-[2.3rem] font-display uppercase tracking-[-0.06em] sm:text-[3.5rem] lg:text-[5rem]">
          <span>Rooted in motion</span>
          <span className="text-[#1b422d]">✦</span>
          <span>Custom apparel</span>
          <span className="text-[#1b422d]">✦</span>
          <span>Designed around you</span>
          <span className="text-[#1b422d]">✦</span>
          <span>Rooted in motion</span>
          <span className="text-[#1b422d]">✦</span>
          <span>Custom apparel</span>
          <span className="text-[#1b422d]">✦</span>
          <span>Designed around you</span>
          <span className="text-[#1b422d]">✦</span>
        </div>
      </div>

      <section className="editorial-showcase border-b border-border/70">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-20">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="overflow-hidden border border-[#d3cabd] bg-[#f8f4ee] p-4 sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#d7d0c7]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#c9c0b8]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#b8b1a5]" />
                </div>
                <span className="editorial-chip inline-flex items-center rounded-full px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.18em] text-[#254f37]">
                  14 colors
                </span>
              </div>
              <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
                <div className="overflow-hidden border border-[#d9d2c9] bg-[#f0ece4] p-3">
                  <img
                    src={heroEditorial}
                    alt="Editorial studio look"
                    className="h-[420px] w-full object-cover"
                  />
                </div>
                <div className="space-y-4">
                  <div className="rounded-[1.5rem] border border-[#d8d1c8] bg-white p-4 shadow-[0_18px_45px_rgba(30,25,20,0.06)]">
                    <p className="text-[0.62rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                      Premium tee
                    </p>
                    <h3 className="mt-2 font-display text-3xl leading-none">Signature fit</h3>
                    <p className="mt-3 text-sm text-muted-foreground">
                      Heavyweight cotton, relaxed drape and subtle structure.
                    </p>
                    <div className="mt-5 flex items-center justify-between gap-2">
                      <span className="text-base font-semibold">From ₦24,000</span>
                      <span className="text-xs font-bold uppercase tracking-[0.14em] text-accent">
                        Custom
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      "#d5d6c3",
                      "#d2b8a8",
                      "#8a9d7f",
                      "#4f5a75",
                      "#efefe9",
                    ].map((swatch) => (
                      <div
                        key={swatch}
                        className="h-10 rounded-full border border-[#d2cabd]"
                        style={{ backgroundColor: swatch }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between gap-6 rounded-[2rem] border border-[#d3cabd] bg-[#1f2a22] p-6 text-[#edf1ea] shadow-[0_20px_55px_rgba(23,25,22,0.12)]">
              <div>
                <p className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-[#d5e6d8]">
                  Studio edit
                </p>
                <h3 className="mt-4 font-display text-4xl leading-none text-white sm:text-5xl">
                  Built for movement.
                </h3>
              </div>
              <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#2a3a2f] p-3">
                <img
                  src={hero2}
                  alt="Studio capsule collection"
                  className="h-[280px] w-full object-cover"
                />
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-4">
                <div>
                  <p className="text-sm text-[#d4e1d5]">Custom orders in 5–14 days</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[#9bb69f]">
                    nationwide delivery
                  </p>
                </div>
                <Link
                  to="/custom-order"
                  className="inline-flex items-center justify-center rounded-full bg-[#dde7d7] px-4 py-2 text-[0.62rem] font-bold uppercase tracking-[0.18em] text-[#1b2a1f] transition hover:bg-white"
                >
                  Start now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMMERCIAL OFFER */}
      <section className="border-y border-border bg-foreground text-primary-foreground">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 lg:grid-cols-[0.8fr_1.2fr] lg:px-10 lg:py-18">
          <div data-reveal>
            <p className="eyebrow !text-primary-foreground/55">What we make</p>
            <h2 className="mt-4 font-display text-4xl leading-none sm:text-5xl">
              From one piece to a <span className="text-accent">full drop.</span>
            </h2>
            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-2 border-t border-primary-foreground/15 pt-6">
              <p className="font-display text-2xl">Starting from ₦12,000</p>
              <p className="self-center text-sm text-primary-foreground/65">
                Custom orders available nationwide
              </p>
            </div>
          </div>
          <div
            className="grid gap-px bg-primary-foreground/15 sm:grid-cols-2"
            data-reveal
            data-reveal-delay="2"
          >
            {[
              "Plain & custom tees",
              "Collar shirts",
              "Wide-leg trousers",
              "Jackets",
              "Native custom wear",
              "Brand uniforms & capsule drops",
            ].map((item, index) => (
              <div key={item} className="flex items-center gap-4 bg-foreground px-5 py-4">
                <span className="text-xs font-bold text-accent">0{index + 1}</span>
                <span className="text-sm font-semibold">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="border-y border-border py-6 overflow-hidden bg-secondary">
        <div className="marquee flex gap-12 whitespace-nowrap font-display uppercase text-2xl">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex gap-12 pr-12 items-center">
              <span>Rooted in Motion</span>
              <span className="text-accent">✦</span>
              <span>Custom Apparel Studio</span>
              <span className="text-accent">✦</span>
              <span>Designed Around You</span>
              <span className="text-accent">✦</span>
              <span>Limited. Considered. Crafted.</span>
              <span className="text-accent">✦</span>
            </div>
          ))}
        </div>
      </div>

      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
          <div className="mb-12 flex items-end justify-between gap-6" data-reveal>
            <div>
              <p className="eyebrow">Ready-to-wear</p>
              <h2 className="mt-3 font-display text-4xl lg:text-6xl">Featured pieces.</h2>
            </div>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em]"
            >
              Shop all <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {featured.map((product) => (
              <Link
                key={product.id}
                to="/shop/$slug"
                params={{ slug: product.slug }}
                className="group block overflow-hidden rounded-[1.75rem] border border-border/70 bg-card shadow-[0_18px_48px_rgba(15,14,12,0.04)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_30px_80px_rgba(15,14,12,0.08)]"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                  {product.images[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Image coming soon
                    </div>
                  )}

                  <div className="absolute inset-x-4 top-4 flex items-center justify-between gap-2">
                    <span className="rounded-full bg-background/75 px-2.5 py-1 text-[0.58rem] font-bold uppercase tracking-[0.14em] text-foreground backdrop-blur-sm">
                      {product.category}
                    </span>
                    {product.is_customizable && (
                      <span className="rounded-full border border-black/10 bg-white/80 px-2.5 py-1 text-[0.58rem] font-bold uppercase tracking-[0.14em] text-accent backdrop-blur-sm">
                        Custom
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-4 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-2xl leading-none">{product.name}</h3>
                    <span className="font-display text-3xl leading-none text-accent/80">↗</span>
                  </div>

                  <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
                    <p className="text-base font-semibold">From {formatNaira(product.price_ngn)}</p>
                    <p className="text-[0.62rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                      {product.colors.length} colour{product.colors.length === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ABOUT TEASER */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 py-24 lg:py-36 grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-5" data-reveal>
          <div className="eyebrow">About the brand</div>
          <h2 className="mt-5 font-display text-4xl lg:text-5xl xl:text-6xl leading-[1.05]">
            For people who carry their <span className="text-accent">roots</span> wherever they go.
          </h2>
        </div>
        <div
          className="lg:col-span-6 lg:col-start-7 space-y-5 text-muted-foreground leading-[1.75]"
          data-reveal
          data-reveal-delay="2"
        >
          <p className="text-foreground/90 text-lg leading-relaxed">
            Knot & Nomad creates custom apparel and fashion pieces for individuals, creatives, and
            brands who want style with identity.
          </p>
          <p>
            Rooted in culture and designed for movement, our pieces blend premium craftsmanship with
            modern expression — from heavyweight tees and oversized hoodies to wide-leg trousers,
            caps and full capsule drops.
          </p>
          <p>Every garment begins as a story. Yours.</p>
          <Link
            to="/about"
            className="inline-flex items-center gap-2 text-foreground hover:text-accent transition text-sm font-bold tracking-[0.15em] uppercase pt-2"
          >
            Read our story <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="bg-secondary py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="flex items-end justify-between mb-14" data-reveal>
            <div>
              <div className="eyebrow">The Studio</div>
              <h2 className="mt-3 font-display text-4xl lg:text-6xl">Categories.</h2>
            </div>
            <Link
              to="/custom-studio"
              className="hidden md:inline-flex items-center gap-2 text-sm font-bold tracking-[0.15em] uppercase hover:text-accent transition"
            >
              Explore Custom Studio <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((c, i) => (
              <article
                key={c.name}
                className="group overflow-hidden rounded-[1.8rem] border border-border bg-background shadow-[0_16px_38px_rgba(15,14,12,0.03)] transition-all duration-500 hover:-translate-y-1 hover:border-accent/40"
                data-reveal
                data-reveal-delay={String((i % 3) + 1)}
              >
                <div className="relative aspect-[4/5] overflow-hidden img-lift">
                  <img
                    src={c.img}
                    alt={c.name}
                    loading="lazy"
                    width={1024}
                    height={1280}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-4 left-4 bg-background/85 backdrop-blur-sm text-[0.62rem] font-bold tracking-[0.2em] uppercase px-3 py-1.5">
                    {c.label}
                  </span>
                </div>
                <div className="p-7">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="font-display text-2xl">{c.name}</h3>
                    <span className="text-[0.62rem] font-bold tracking-[0.2em] uppercase text-muted-foreground">
                      0{i + 1}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{c.desc}</p>
                  <Link
                    to="/custom-order"
                    className="mt-6 inline-flex items-center gap-2 text-xs font-bold tracking-[0.18em] uppercase border-b-2 border-foreground pb-1 hover:text-accent hover:border-accent transition"
                  >
                    Request this style <ArrowRight size={14} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 py-24 lg:py-32">
        <div data-reveal>
          <div className="eyebrow">Process</div>
          <h2 className="mt-3 font-display text-4xl lg:text-6xl max-w-3xl leading-[1.05]">
            From idea to wearable, in <span className="text-accent">five</span> steps.
          </h2>
        </div>
        <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-5 gap-px bg-border">
          {steps.map((s, i) => (
            <div
              key={s.title}
              className="relative p-8 lg:p-10 bg-background hover:bg-card transition-colors duration-500 group"
              data-reveal
              data-reveal-delay={String((i % 3) + 1)}
            >
              <div className="flex items-baseline justify-between">
                <s.icon size={26} className="text-accent" strokeWidth={2} />
                <span className="font-display text-3xl text-foreground/15 group-hover:text-accent/40 transition-colors">
                  0{i + 1}
                </span>
              </div>
              <h3 className="mt-8 font-display text-2xl">{s.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* LOOKBOOK PREVIEW */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 py-24 lg:py-32">
        <div className="flex items-end justify-between mb-12" data-reveal>
          <div>
            <div className="eyebrow">Lookbook</div>
            <h2 className="mt-3 font-display text-4xl lg:text-6xl">In the wild.</h2>
          </div>
          <Link
            to="/lookbook"
            className="hidden md:inline-flex items-center gap-2 text-sm font-bold tracking-[0.15em] uppercase hover:text-accent transition"
          >
            View gallery <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              src: "/images/lookbook/knot-nomad-lookbook-01.webp",
              alt: "Look 01: Black male model wearing a lavender knit polo and relaxed grey tailored trousers.",
              width: 2246,
              height: 3040,
              position: "center 35%",
            },
            {
              src: "/images/lookbook/knot-nomad-lookbook-03.webp",
              alt: "Look 03: Male model wearing a sage utility jacket and neutral trousers in a tropical garden.",
              width: 2246,
              height: 3040,
              position: "center 35%",
            },
            {
              src: "/images/lookbook/knot-nomad-lookbook-06.webp",
              alt: "Look 06: Close editorial view of a Black male model wearing a caramel cable-knit polo.",
              width: 2132,
              height: 3203,
              position: "center 30%",
            },
          ].map((look, i) => (
            <div
              key={look.src}
              className="overflow-hidden img-lift aspect-[3/4]"
              data-reveal
              data-reveal-delay={String(i + 1)}
            >
              <img
                src={look.src}
                alt={look.alt}
                loading="lazy"
                decoding="async"
                width={look.width}
                height={look.height}
                style={{ objectPosition: look.position }}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
          <div className="mb-10">
            <p className="eyebrow">Made with intention</p>
            <h2 className="mt-3 font-display text-4xl lg:text-6xl">Quality you can feel.</h2>
          </div>
          <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-5">
            {[
              ["Quality", "Considered construction and a clean finish."],
              ["Fit", "Silhouettes designed for movement and confidence."],
              ["Fabric", "Materials selected for feel, weight and purpose."],
              ["Identity", "Ready-to-wear and custom pieces with a point of view."],
              ["Support", "Responsive WhatsApp and email guidance within 24 hours."],
            ].map(([title, copy]) => (
              <div key={title} className="bg-background p-6">
                <h3 className="font-display text-xl">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-foreground py-24 text-primary-foreground lg:py-32">
        <div className="mx-auto max-w-5xl px-6 text-center lg:px-10">
          <p className="eyebrow !text-primary-foreground/55">Your idea, made wearable</p>
          <h2 className="mt-4 font-display text-5xl lg:text-7xl">
            Start with a brief. <span className="text-accent">We’ll take it from there.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl leading-7 text-primary-foreground/65">
            Custom production takes 5–14 working days depending on complexity. We respond within 24
            hours and confirm everything before your deposit.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link
              to="/custom-order"
              className="btn-pill inline-flex items-center gap-2 bg-accent px-8 py-4 text-xs font-bold uppercase tracking-[0.18em] text-accent-foreground"
            >
              Start Custom Order <ArrowRight size={15} />
            </Link>
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noreferrer"
              className="btn-pill inline-flex items-center gap-2 border border-primary-foreground/35 px-8 py-4 text-xs font-bold uppercase tracking-[0.18em]"
            >
              <MessageCircle size={15} /> Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
