import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Menu, X, ShoppingBag } from "lucide-react";
import { whatsappLink } from "@/lib/site";
import { useCart, cartCount } from "@/lib/cart";
import { BrandLogo } from "@/components/BrandLogo";

const nav = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/custom-studio", label: "Custom Studio" },
  { to: "/lookbook", label: "Lookbook" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLElement>(null);
  const items = useCart((s) => s.items);
  const count = cartCount(items);

  useEffect(() => {
    if (!open) return;
    const menuButton = menuButtonRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.dataset.mobileMenuOpen = "true";

    const getFocusable = () =>
      Array.from(
        menuRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );
    getFocusable()[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
      } else if (event.key === "Tab") {
        const focusable = getFocusable();
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      delete document.body.dataset.mobileMenuOpen;
      menuButton?.focus();
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">
        <Link to="/" className="flex items-center" aria-label="KnotNomad home">
          <BrandLogo variant="primary" size="md" priority decorative className="hidden sm:block" />
          <BrandLogo variant="monogram" size="md" priority decorative className="sm:hidden" />
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-accent"
              activeProps={{ className: "text-foreground" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 lg:gap-3">
          <Link
            to="/cart"
            className="relative inline-flex h-11 w-11 items-center justify-center transition hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Cart"
          >
            <ShoppingBag size={20} strokeWidth={2.25} />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
                {count}
              </span>
            )}
          </Link>

          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-pill hidden border-2 border-foreground px-5 py-2.5 text-[0.68rem] font-bold uppercase tracking-[0.14em] transition hover:bg-foreground hover:text-primary-foreground lg:inline-block"
          >
            WhatsApp
          </a>

          <Link
            to="/shop"
            className="btn-pill hidden bg-foreground px-5 py-2.5 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-primary-foreground transition hover:bg-accent hover:text-accent-foreground lg:inline-block"
          >
            Shop now
          </Link>

          <button
            ref={menuButtonRef}
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card transition hover:border-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent lg:hidden"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-controls="mobile-navigation"
            aria-expanded={open}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <div
        className={`${open ? "fixed" : "hidden"} inset-x-0 bottom-0 top-20 z-50 overflow-y-auto border-t border-border bg-background lg:hidden`}
        data-mobile-menu
        aria-hidden={!open}
      >
        <nav
          id="mobile-navigation"
          ref={menuRef}
          aria-label="Mobile navigation"
          className="mx-auto flex min-h-full max-w-7xl flex-col gap-1 bg-background px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-5"
        >
          <div className="mb-2 flex items-center justify-between border-b border-border pb-3">
            <span className="text-[0.62rem] font-bold uppercase tracking-[0.22em] text-muted-foreground">
              Menu
            </span>
            <Link
              to="/shop"
              onClick={() => setOpen(false)}
              className="btn-pill inline-flex min-h-11 items-center bg-foreground px-4 py-2 text-[0.58rem] font-bold uppercase tracking-[0.18em] text-primary-foreground"
            >
              Shop now
            </Link>
          </div>

          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              onClick={() => setOpen(false)}
              className="flex min-h-12 items-center justify-between border-b border-border/70 py-3 text-sm font-bold uppercase tracking-[0.14em] text-foreground/80 transition hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <span>{n.label}</span>
              <span className="text-xs text-muted-foreground">→</span>
            </Link>
          ))}

          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex min-h-12 items-center justify-center rounded-full border border-foreground px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] text-foreground transition hover:bg-foreground hover:text-primary-foreground"
          >
            WhatsApp us
          </a>
        </nav>
      </div>
    </header>
  );
}
