import { Link } from "@tanstack/react-router";
import { Instagram, Facebook } from "lucide-react";
import { useState } from "react";
import { SITE, whatsappLink } from "@/lib/site";
import { KnotIcon } from "@/components/KnotIcon";
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
    <footer className="bg-foreground text-primary-foreground mt-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-20">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="flex items-center gap-4">
              <KnotIcon className="h-12 w-12" />
              <div>
                <div className="font-display text-2xl tracking-tight">{SITE.name}</div>
                <div className="eyebrow text-primary-foreground/70">{SITE.tagline}</div>
              </div>
            </div>
            <p className="mt-6 max-w-md text-sm text-primary-foreground/70 leading-relaxed">
              A custom apparel studio for individuals, creatives and brands — translating identity
              into considered, wearable pieces. Rooted in culture. Designed for movement.
            </p>
            <form onSubmit={onSubscribe} className="mt-8 flex gap-3 max-w-md">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Join the Nomad Circle"
                className="btn-pill flex-1 bg-transparent border-2 border-primary-foreground/30 px-5 py-3 text-sm placeholder:text-primary-foreground/50 focus:outline-none focus:border-accent"
              />
              <button
                disabled={loading}
                className="btn-pill bg-accent text-accent-foreground px-6 text-xs font-bold uppercase tracking-[0.14em] disabled:opacity-60"
              >
                {loading ? "…" : "Join"}
              </button>
            </form>
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
                ["/laundry", "Garment Care"],
                ["/privacy", "Privacy Policy"],
                ["/terms", "Terms"],
              ]}
              nested
            />
            <div className="mt-5 text-xs leading-6 text-primary-foreground/60">
              <a href={`mailto:${SITE.email}`} className="hover:text-accent">
                {SITE.email}
              </a>
              <br />
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent"
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
                className="hover:text-accent"
              >
                <Instagram size={20} />
              </a>
              <a
                href={SITE.socials.tiktok}
                aria-label="TikTok"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent"
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
                className="hover:text-accent"
              >
                <Facebook size={20} />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-primary-foreground/15 flex flex-col sm:flex-row justify-between gap-4 text-xs text-primary-foreground/60">
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
