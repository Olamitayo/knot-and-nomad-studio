import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, ShoppingBag } from "lucide-react";
import { SITE, whatsappLink } from "@/lib/site";
import { useCart, cartCount } from "@/lib/cart";
import logo from "@/assets/knot-nomad-monogram.png";

const nav = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/shop", label: "Shop" },
  { to: "/collection", label: "Collection" },
  { to: "/lookbook", label: "Lookbook" },
  { to: "/custom-order", label: "Custom Order" },
  { to: "/contact", label: "Contact" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const items = useCart((s) => s.items);
  const count = cartCount(items);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/60">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group" aria-label={SITE.name}>
          <img src={logo} alt={SITE.name} width={40} height={40} className="h-9 w-9 object-contain transition-transform duration-500 group-hover:rotate-[8deg]" />
          <span className="font-display text-xl tracking-tight">{SITE.name}</span>
        </Link>
        <nav className="hidden lg:flex items-center gap-7">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="text-sm tracking-wide text-muted-foreground hover:text-foreground transition-colors"
              activeProps={{ className: "text-foreground" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2 lg:gap-3">
          <Link to="/cart" className="relative p-2 hover:text-accent transition" aria-label="Cart">
            <ShoppingBag size={20} />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-accent text-accent-foreground text-[10px] font-medium min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1">
                {count}
              </span>
            )}
          </Link>
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:inline-block text-xs tracking-[0.2em] uppercase border border-foreground px-4 py-2 hover:bg-foreground hover:text-primary-foreground transition"
          >
            WhatsApp
          </a>
          <Link
            to="/shop"
            className="hidden lg:inline-block text-xs tracking-[0.2em] uppercase bg-foreground text-primary-foreground px-4 py-2 hover:bg-accent hover:text-accent-foreground transition"
          >
            Shop now
          </Link>
          <button className="lg:hidden p-2" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
      {open && (
        <div className="lg:hidden border-t border-border bg-background">
          <nav className="flex flex-col px-6 py-4 gap-3">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="py-2 text-sm tracking-wide"
              >
                {n.label}
              </Link>
            ))}
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="py-2 text-sm text-accent">
              WhatsApp us
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
