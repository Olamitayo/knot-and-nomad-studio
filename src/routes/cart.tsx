import { createFileRoute, Link } from "@tanstack/react-router";
import { useCart, cartSubtotal } from "@/lib/cart";
import { formatNaira } from "@/lib/format";
import { Minus, Plus, X, ShoppingBag } from "lucide-react";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Cart — Knot & Nomad" }] }),
  component: CartPage,
});

function CartPage() {
  const items = useCart((s) => s.items);
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);
  const subtotal = cartSubtotal(items);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center lg:px-10">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-border bg-card">
          <ShoppingBag size={32} className="text-muted-foreground" />
        </div>
        <h1 className="mt-6 font-display text-4xl">Your cart is empty</h1>
        <p className="mt-3 text-muted-foreground">Begin building your edit.</p>
        <Link
          to="/shop"
          className="btn-pill mt-8 inline-block bg-foreground px-8 py-4 text-xs font-bold uppercase tracking-[0.25em] text-primary-foreground transition hover:bg-accent hover:text-accent-foreground"
        >
          Browse the shop
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 lg:px-10 lg:py-16">
      <p className="eyebrow mb-3">Your bag</p>
      <h1 className="mb-12 font-display text-4xl lg:text-5xl">Cart</h1>

      <div className="grid gap-12 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {items.map((it) => (
            <div key={it.id} className="flex gap-4 rounded-[1.75rem] border border-border bg-card p-4 sm:p-5">
              <div className="h-28 w-24 shrink-0 overflow-hidden rounded-[1rem] bg-muted sm:h-32 sm:w-28">
                {it.image && (
                  <img src={it.image} alt={it.name} className="h-full w-full object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex justify-between gap-4">
                  <h3 className="font-display text-xl">{it.name}</h3>
                  <button
                    onClick={() => remove(it.id)}
                    className="text-muted-foreground transition hover:text-foreground"
                  >
                    <X size={16} />
                  </button>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {[it.size, it.color].filter(Boolean).join(" · ")}
                </p>
                {it.customizationNotes && (
                  <p className="mt-1 text-xs italic text-muted-foreground">
                    Custom: {it.customizationNotes.slice(0, 80)}
                    {it.customizationNotes.length > 80 ? "…" : ""}
                  </p>
                )}
                <div className="mt-4 flex items-center justify-between gap-4">
                  <div className="inline-flex items-center border border-border bg-background">
                    <button
                      onClick={() => setQuantity(it.id, it.quantity - 1)}
                      className="px-2.5 py-1.5 transition hover:bg-muted"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="px-4 text-sm">{it.quantity}</span>
                    <button
                      onClick={() => setQuantity(it.id, it.quantity + 1)}
                      className="px-2.5 py-1.5 transition hover:bg-muted"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  <p className="text-sm font-medium">{formatNaira(it.unitPrice * it.quantity)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="lg:col-span-1">
          <div className="rounded-[2rem] border border-border bg-muted/40 p-6 shadow-[0_26px_70px_rgba(17,16,14,0.04)] lg:sticky lg:top-28 lg:p-8">
            <h2 className="mb-6 font-display text-2xl">Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatNaira(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery</span>
                <span className="text-muted-foreground">Calculated at checkout</span>
              </div>
              <div className="my-4 h-px bg-border" />
              <div className="flex justify-between text-base font-medium">
                <span>Total</span>
                <span>{formatNaira(subtotal)}</span>
              </div>
            </div>
            <Link
              to="/checkout"
              className="btn-pill mt-6 block w-full bg-foreground px-5 py-4 text-center text-xs font-bold uppercase tracking-[0.25em] text-primary-foreground transition hover:bg-accent hover:text-accent-foreground"
            >
              Proceed to checkout
            </Link>
            <Link
              to="/shop"
              className="mt-4 block text-center text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground transition hover:text-foreground"
            >
              Continue shopping
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
