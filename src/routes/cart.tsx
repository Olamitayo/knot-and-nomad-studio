import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useCart, cartSubtotal } from "@/lib/cart";
import { formatNaira } from "@/lib/format";
import { Minus, Plus, X, ShoppingBag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  hasVerifiedReadyToWearProducts,
  isCatalogueReadyProduct,
  isValidProductColour,
  isValidProductSize,
  parseProductData,
} from "@/lib/product-data";
import { displayPrice } from "@/lib/products";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Cart — Knot & Nomad" }] }),
  component: CartPage,
});

function CartPage() {
  const items = useCart((s) => s.items);
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);
  const subtotal = cartSubtotal(items);
  const [cartState, setCartState] = useState<"checking" | "ready" | "error">("checking");

  useEffect(() => {
    let active = true;

    const verifyCart = async () => {
      setCartState("checking");
      const currentItems = useCart.getState().items;
      if (currentItems.length === 0 || !hasVerifiedReadyToWearProducts()) {
        if (currentItems.length > 0) useCart.getState().clear();
        if (active) setCartState("ready");
        return;
      }

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .in("id", [...new Set(currentItems.map((item) => item.productId))])
        .eq("is_active", true);

      if (!active) return;
      if (error) {
        setCartState("error");
        return;
      }

      const availableProducts = new Map(
        (data ?? [])
          .map(parseProductData)
          .filter(isCatalogueReadyProduct)
          .map((product) => [product.id, product]),
      );
      const unavailableItems = currentItems.filter((item) => {
        const product = availableProducts.get(item.productId);
        if (!product || product.name !== item.name) return true;
        if (displayPrice(product, item.color) !== item.unitPrice) return true;
        if (
          product.sizes.length > 0 &&
          (!item.size || !isValidProductSize(item.size) || !product.sizes.includes(item.size))
        )
          return true;
        if (
          product.colors.length > 0 &&
          (!item.color || !isValidProductColour(item.color) || !product.colors.includes(item.color))
        )
          return true;
        const variant = product.variants?.find(
          (entry) => entry.colour.toLowerCase() === item.color?.toLowerCase(),
        );
        const stock = variant?.stockLevel ?? product.stock_level;
        if (product.is_sold_out || stock <= 0 || item.quantity > stock) return true;
        const currentImages = new Set([
          ...product.images,
          ...(product.gallery ?? []).map((entry) => entry.url),
          ...(product.variants ?? []).flatMap((entry) => entry.images.map((image) => image.url)),
        ]);
        return !currentImages.has(item.image);
      });

      unavailableItems.forEach((item) => useCart.getState().remove(item.id));
      if (active) setCartState("ready");
    };

    const hasHydrated = useCart.persist?.hasHydrated() ?? true;
    let unsubscribe: (() => void) | undefined;
    if (hasHydrated) {
      void verifyCart();
    } else {
      unsubscribe = useCart.persist?.onFinishHydration(() => void verifyCart());
    }

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, [items]);

  if (cartState === "checking") {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center" role="status" aria-live="polite">
        Checking your cart availability…
      </div>
    );
  }

  if (cartState === "error") {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="font-display text-4xl">We couldn’t verify your cart.</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Your saved cart has been kept, but its items and prices are hidden until availability can
          be checked.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="btn-pill mt-6 inline-flex min-h-12 items-center justify-center border-2 border-foreground px-6 text-xs font-bold uppercase tracking-[0.18em]"
        >
          Try again
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center lg:px-10">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-border bg-card">
          <ShoppingBag size={32} className="text-muted-foreground" />
        </div>
        <p className="eyebrow mt-6">Ready-to-wear</p>
        <h1 className="mt-3 font-display text-4xl">Your cart is clear.</h1>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          Ready-to-wear releases are being prepared, so there are no pieces to purchase right now.
          Start a custom brief or join Nomad Circle for release updates.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/custom-order"
            className="btn-pill inline-flex min-h-12 items-center justify-center bg-foreground px-6 text-xs font-bold uppercase tracking-[0.18em] text-primary-foreground transition hover:bg-accent hover:text-accent-foreground"
          >
            Start a custom order
          </Link>
          <a
            href="/shop#nomad-circle"
            className="inline-flex min-h-12 items-center justify-center border-2 border-foreground px-6 text-xs font-bold uppercase tracking-[0.18em] transition hover:bg-foreground hover:text-primary-foreground"
          >
            Join for drop updates
          </a>
        </div>
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
            <div
              key={it.id}
              className="flex gap-4 rounded-[1.75rem] border border-border bg-card p-4 sm:p-5"
            >
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
