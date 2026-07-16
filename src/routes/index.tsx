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
import look1 from "@/assets/look-1.jpg";
import look2 from "@/assets/look-2.jpg";
import look3 from "@/assets/look-3.jpg";
import look4 from "@/assets/look-4.jpg";
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
      { property: "og:image", content: "/og-home.jpg" },
      { name: "twitter:image", content: "/og-home.jpg" },
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
      <section className="relative min-h-[94vh] flex items-end overflow-hidden">
        <HeroSlideshow
          images={[
            {
              src: heroEditorial,
              alt: "Knot & Nomad editorial — oversized cream hoodie and wide-leg trousers",
            },
            { src: hero1, alt: "Charcoal hoodie editorial" },
            { src: hero2, alt: "Sweatshirt against concrete" },
            { src: hero3, alt: "Black essentials hoodie" },
            { src: hero4, alt: "Cream waffle hoodie" },
          ]}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/10 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-background/20 to-transparent" />
        <div className="relative mx-auto max-w-7xl w-full px-6 lg:px-10 pb-20 lg:pb-28">
          <div className="fade-up">
            <div className="flex items-center gap-3 text-foreground/80">
              <span className="block h-px w-10 bg-accent" />
              <span className="eyebrow text-foreground/80">
                Premium custom apparel — Est. Worldwide
              </span>
            </div>
            <h1 className="mt-7 font-display uppercase text-[2.8rem] sm:text-6xl lg:text-7xl xl:text-[7.5rem] leading-[0.92] max-w-5xl">
              Fashion <span className="text-accent">rooted</span>
              <br />
              in motion.
            </h1>
            <p className="mt-7 max-w-xl text-base lg:text-lg text-muted-foreground leading-relaxed">
              A premium ready-to-wear fashion brand and custom apparel studio—creating considered
              pieces for individuals, creatives and brands.
            </p>
            <div className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-2">
              <Link
                to="/shop"
                className="btn-pill group inline-flex items-center justify-center gap-2 bg-foreground text-primary-foreground px-7 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-accent hover:text-accent-foreground transition-colors duration-300"
              >
                Shop Ready-to-Wear{" "}
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/custom-order"
                className="btn-pill group inline-flex items-center justify-center gap-2 border-2 border-foreground px-7 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-foreground hover:text-primary-foreground transition-colors duration-300"
              >
                Start a Custom Order{" "}
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
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
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {featured.map((product) => (
              <Link
                key={product.id}
                to="/shop/$slug"
                params={{ slug: product.slug }}
                className="group"
              >
                <div className="aspect-[4/5] overflow-hidden border border-border bg-muted">
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
                </div>
                <p className="mt-4 text-[0.62rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  {product.category}
                </p>
                <h3 className="mt-1 font-display text-lg leading-tight sm:text-xl">
                  {product.name}
                </h3>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">From {formatNaira(product.price_ngn)}</p>
                  <p className="text-xs text-muted-foreground">
                    {product.colors.length} colour{product.colors.length === 1 ? "" : "s"}
                  </p>
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
                className="group bg-background overflow-hidden border border-transparent hover:border-accent/40 transition-colors duration-500"
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[look1, look2, look3, look4].map((src, i) => (
            <div
              key={i}
              className={`overflow-hidden img-lift ${i % 3 === 0 ? "row-span-2 lg:row-span-1" : ""}`}
              data-reveal
              data-reveal-delay={String((i % 4) + 1)}
            >
              <img
                src={src}
                alt="Lookbook"
                loading="lazy"
                width={1024}
                height={1280}
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
