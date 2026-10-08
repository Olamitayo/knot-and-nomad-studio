import { Link } from "@tanstack/react-router";
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
  const [message, setMessage] = useState("");

  async function onSubscribe(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await subscribe({ data: { email } });
      if (res.ok) {
        setMessage("You’re on the list. Thanks for subscribing.");
        toast.success("Welcome to the Nomad Circle.");
        setEmail("");
      } else {
        setMessage(res.error || "Subscription failed. Please try again.");
        toast.error(res.error || "Try again");
      }
    } catch {
      setMessage("We couldn’t complete your subscription. Please try again.");
      toast.error("Subscription failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <footer className="mt-32 bg-foreground text-primary-foreground">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div
          id="nomad-circle"
          className="scroll-mt-24 rounded-[2rem] border border-white/10 bg-white/3 p-5 sm:p-8"
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="eyebrow text-primary-foreground/60">Nomad circle</p>
              <h3 className="mt-2 font-display text-3xl leading-none sm:text-4xl">
                Design notes. New drops. Early access.
              </h3>
            </div>
            <form onSubmit={onSubscribe} className="w-full max-w-xl" aria-busy={loading}>
              <label
                htmlFor="newsletter-email"
                className="mb-2 block text-xs font-bold text-primary-foreground"
              >
                Email address
              </label>
              <div className="flex gap-3">
                <input
                  id="newsletter-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-describedby="newsletter-status"
                  placeholder="you@example.com"
                  className="btn-pill min-h-12 min-w-0 flex-1 border-2 border-primary-foreground/30 bg-transparent px-5 py-3 text-sm text-white placeholder:text-primary-foreground/70 focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-pill min-h-12 bg-accent px-6 text-xs font-bold uppercase tracking-[0.14em] text-accent-foreground disabled:opacity-60"
                >
                  {loading ? "Joining…" : "Join"}
                </button>
              </div>
              <p
                id="newsletter-status"
                className="mt-2 min-h-5 text-xs text-primary-foreground/75"
                role="status"
                aria-live="polite"
              >
                {message}
              </p>
              <p className="text-xs text-primary-foreground/70">
                We’ll use your email for Nomad Circle release and studio updates.
              </p>
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
            title="Explore"
            links={[
              ["/shop", "Ready-to-wear"],
              ["/custom-studio", "Custom Studio"],
              ["/custom-order", "Start Custom Order"],
              ["/lookbook", "Lookbook"],
              ["/about", "About"],
            ]}
          />
          <FooterColumn
            title="Support"
            links={[
              ["/contact", "Contact"],
              ["/delivery", "Delivery"],
              ["/returns", "Returns"],
              ["/privacy", "Privacy Policy"],
              ["/terms", "Terms"],
              ["/faqs", "FAQs"],
              ["/garment-care", "Garment Care"],
            ]}
          />
          <div className="lg:col-span-2">
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
          </div>
        </div>
        <a
          href="/garment-care"
          className="mt-14 flex items-center justify-between gap-6 border-y border-primary-foreground/15 py-6 transition hover:border-accent hover:text-accent"
        >
          <div>
            <p className="font-display text-xl">Garment Care</p>
            <p className="mt-1 text-sm text-primary-foreground/65">
              Contact the team to confirm available services, pricing and pickup arrangements.
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

function FooterColumn({ title, links }: { title: string; links: string[][] }) {
  return (
    <div className="lg:col-span-2">
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
