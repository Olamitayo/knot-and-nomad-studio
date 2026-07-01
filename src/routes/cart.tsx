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
      <div className="mx-auto max-w-3xl px-6 lg:px-10 py-24 text-center">
        <ShoppingBag size={32} className="mx-auto text-muted-foreground" />
        <h1 className="font-display text-4xl mt-6">Your cart is empty</h1>
        <p className="text-muted-foreground mt-3">Begin building your edit.</p>
        <Link to="/shop" className="mt-8 inline-block bg-foreground text-primary-foreground px-8 py-4 text-xs uppercase tracking-[0.25em] hover:bg-accent hover:text-accent-foreground transition">
          Browse the shop
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 lg:px-10 py-12 lg:py-16">
      <p className="eyebrow mb-3">Your bag</p>
      <h1 className="font-display text-4xl lg:text-5xl mb-12">Cart</h1>

      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          {items.map((it) => (
            <div key={it.id} className="flex gap-4 pb-6 border-b border-border">
              <div className="w-24 h-32 bg-muted shrink-0 overflow-hidden">
                {it.image && <img src={it.image} alt={it.name} className="h-full w-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between gap-4">
                  <h3 className="font-display text-xl">{it.name}</h3>
                  <button onClick={() => remove(it.id)} className="text-muted-foreground hover:text-foreground">
                    <X size={16} />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {[it.size, it.color].filter(Boolean).join(" · ")}
                </p>
                {it.customizationNotes && (
                  <p className="text-xs text-muted-foreground mt-1 italic">Custom: {it.customizationNotes.slice(0, 80)}{it.customizationNotes.length > 80 ? "…" : ""}</p>
                )}
                <div className="mt-3 flex items-center justify-between">
                  <div className="inline-flex items-center border border-border">
                    <button onClick={() => setQuantity(it.id, it.quantity - 1)} className="px-2.5 py-1.5 hover:bg-muted">
                      <Minus size={12} />
                    </button>
                    <span className="px-4 text-sm">{it.quantity}</span>
                    <button onClick={() => setQuantity(it.id, it.quantity + 1)} className="px-2.5 py-1.5 hover:bg-muted">
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
          <div className="bg-muted/40 border border-border p-6 lg:p-8 lg:sticky lg:top-28">
            <h2 className="font-display text-2xl mb-6">Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatNaira(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery</span>
                <span className="text-muted-foreground">Calculated at checkout</span>
              </div>
              <div className="h-px bg-border my-4" />
              <div className="flex justify-between text-base font-medium">
                <span>Total</span>
                <span>{formatNaira(subtotal)}</span>
              </div>
            </div>
            <Link
              to="/checkout"
              className="mt-6 w-full block text-center bg-foreground text-primary-foreground py-4 text-xs uppercase tracking-[0.25em] hover:bg-accent hover:text-accent-foreground transition"
            >
              Proceed to checkout
            </Link>
            <Link to="/shop" className="mt-4 block text-center text-xs uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground">
              Continue shopping
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
