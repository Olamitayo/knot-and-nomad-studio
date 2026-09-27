import { Link } from "@tanstack/react-router";
import { Instagram, Facebook } from "lucide-react";
import { useState } from "react";
import { SITE, whatsappLink } from "@/lib/site";
import { BrandLogo } from "@/components/BrandLogo";
import { useServerFn } from "@tanstack/react-start";
import { subscribeNewsletter } from "@/lib/orders.functions";
import { toast } from "sonner";

export function Footer() {
  const subscribe = useServerFn(subscribeNewsletter);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubscribe(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await subscribe({ data: { email } });
      if (res.ok) {
        toast.success("Welcome to the Nomad Circle.");
        setEmail("");
      } else {
        toast.error(res.error || "Try again");
      }
    } catch {
      toast.error("Please enter a valid email.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <footer className="mt-32 bg-foreground text-primary-foreground">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="rounded-[2rem] border border-white/10 bg-white/3 p-5 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="eyebrow text-primary-foreground/60">Nomad circle</p>
              <h3 className="mt-2 font-display text-3xl leading-none sm:text-4xl">
                Design notes. New drops. Early access.
              </h3>
            </div>
            <form onSubmit={onSubscribe} className="flex w-full max-w-xl gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Join the Nomad Circle"
                className="btn-pill flex-1 border-2 border-primary-foreground/30 bg-transparent px-5 py-3 text-sm text-white placeholder:text-primary-foreground/50 focus:border-accent focus:outline-none"
              />
              <button
                disabled={loading}
                className="btn-pill bg-accent px-6 text-xs font-bold uppercase tracking-[0.14em] text-accent-foreground disabled:opacity-60"
              >
                {loading ? "…" : "Join"}
              </button>
            </form>
          </div>
        </div>

        <div className="mt-14 grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <BrandLogo variant="signature" theme="light" size="lg" className="hidden sm:block" />
            <div className="sm:hidden">
              <BrandLogo variant="primary" theme="light" size="md" />
              <p className="mt-3 whitespace-nowrap text-[0.58rem] font-semibold tracking-[0.12em] text-primary-foreground/70">
                CRAFTED TO TRAVEL. MADE TO LAST.
              </p>
            </div>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-primary-foreground/70">
              A custom apparel studio for individuals, creatives and brands — translating identity
              into considered, wearable pieces. Rooted in culture. Designed for movement.
            </p>
          </div>

          <FooterColumn
            title="Shop"
            links={[
              ["/shop", "Ready-to-Wear"],
              ["/shop", "Tops"],
              ["/shop", "Bottoms"],
              ["/shop", "Jackets"],
              ["/shop", "Sets"],
              ["/shop", "Accessories"],
            ]}
          />
          <FooterColumn
            title="Custom"
            links={[
              ["/custom-studio", "Custom Studio"],
              ["/custom-order", "Start Custom Order"],
              ["/custom-studio", "Brand Uniforms"],
              ["/custom-studio", "Native Wear"],
              ["/custom-studio", "Capsule Drops"],
            ]}
          />
          <FooterColumn
            title="Support"
            links={[
              ["/contact", "Contact"],
              ["/size-guide", "Size Guide"],
              ["/delivery", "Delivery"],
              ["/returns", "Returns"],
              ["/payment", "Payment"],
              ["/faqs", "FAQs"],
            ]}
          />
          <div className="lg:col-span-2">
            <FooterColumn
              title="Company"
              links={[
                ["/about", "About"],
                ["/lookbook", "Lookbook"],
                ["/collection", "Collection"],
                ["/garment-care", "Garment Care"],
                ["/privacy", "Privacy Policy"],
                ["/terms", "Terms"],
              ]}
              nested
            />
            <div className="mt-5 text-xs leading-6 text-primary-foreground/60">
              <a href={`mailto:${SITE.email}`} className="transition hover:text-accent">
                {SITE.email}
              </a>
              <br />
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-accent"
              >
                WhatsApp support
              </a>
            </div>
            <div className="eyebrow mt-6 text-primary-foreground/60">Follow</div>
            <div className="mt-5 flex gap-4">
              <a
                href={SITE.socials.instagram}
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-accent"
              >
                <Instagram size={20} />
              </a>
              <a
                href={SITE.socials.tiktok}
                aria-label="TikTok"
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-accent"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.5 2h2.7a5.5 5.5 0 0 0 5 5.2v2.7a8 8 0 0 1-5-1.7v6.6a5.8 5.8 0 1 1-5.8-5.8c.3 0 .6 0 .9.1v2.8a3 3 0 1 0 2.2 2.9V2z" />
                </svg>
              </a>
              <a
                href={SITE.socials.facebook}
                aria-label="Facebook"
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-accent"
              >
                <Facebook size={20} />
              </a>
            </div>
          </div>
        </div>
        <a
          href="/garment-care"
          className="mt-14 flex items-center justify-between gap-6 border-y border-primary-foreground/15 py-6 transition hover:border-accent hover:text-accent"
        >
          <div>
            <p className="font-display text-xl">Garment Care</p>
            <p className="mt-1 text-sm text-primary-foreground/65">
              Premium laundry, steaming, stain treatment and pickup service by Knot & Nomad.
            </p>
          </div>
          <span className="text-xs font-bold uppercase tracking-[0.18em]">
            Explore Garment Care →
          </span>
        </a>
        <div className="mt-16 flex flex-col justify-between gap-4 border-t border-primary-foreground/15 pt-8 text-xs text-primary-foreground/60 sm:flex-row">
          <span>
            © {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </span>
          <span className="tracking-[0.3em] uppercase">{SITE.tagline}</span>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
  nested,
}: {
  title: string;
  links: string[][];
  nested?: boolean;
}) {
  return (
    <div className={nested ? "" : "lg:col-span-2"}>
      <div className="eyebrow text-primary-foreground/60">{title}</div>
      <ul className="mt-5 space-y-2.5 text-xs font-bold uppercase tracking-[0.08em]">
        {links.map(([to, label]) => (
          <li key={`${to}-${label}`}>
            <Link to={to} className="transition hover:text-accent">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
