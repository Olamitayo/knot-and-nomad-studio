import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useCart, cartSubtotal } from "@/lib/cart";
import { formatNaira, makeOrderReference } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";
import { openPaystackCheckout } from "@/lib/paystack";
import { verifyPaystackPayment, notifyNewOrder } from "@/lib/payments.functions";
import { NIGERIA_STATES } from "@/lib/nigeria-states";
import { toast } from "sonner";
import { CreditCard, Banknote, Lock, MessageCircle, Truck, Wand2, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — Knot & Nomad" }] }),
  component: CheckoutPage,
});

interface Settings {
  bank_name: string;
  account_name: string;
  account_number: string;
  delivery_fee_ngn: number;
}

interface DeliveryZone {
  id: string;
  area_name: string;
  fee_ngn: number;
}

function CheckoutPage() {
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const navigate = useNavigate();
  const verifyPayment = useServerFn(verifyPaystackPayment);
  const notifyOrder = useServerFn(notifyNewOrder);
  const subtotal = cartSubtotal(items);

  const [settings, setSettings] = useState<Settings | null>(null);
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [deliveryArea, setDeliveryArea] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"transfer" | "card">("transfer");
  const [submitting, setSubmitting] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<{
    id: string;
    reference: string;
    total: number;
  } | null>(null);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    whatsapp: "",
    address: "",
    city: "",
    state: "",
    delivery_option: "standard",
    notes: "",
  });

  useEffect(() => {
    supabase.from("app_settings").select("*").limit(1).maybeSingle().then(({ data }) => {
      if (data) setSettings(data as Settings);
    });
    supabase.from("delivery_zones").select("id, area_name, fee_ngn").order("sort_order").order("area_name").then(({ data }) => {
      setZones((data as DeliveryZone[]) ?? []);
    });
  }, []);

  // Cart items come from persisted localStorage, which zustand rehydrates
  // asynchronously after mount. Reading `useCart.getState()` directly (rather
  // than the `items` prop above) guarantees we see the post-rehydration value
  // instead of racing a stale empty array from before rehydration finished.
  useEffect(() => {
    if (submitting) return;
    const redirectIfEmpty = () => {
      if (useCart.getState().items.length === 0) navigate({ to: "/shop" });
    };
    if (useCart.persist?.hasHydrated() ?? true) {
      redirectIfEmpty();
      return;
    }
    return useCart.persist.onFinishHydration(redirectIfEmpty);
  }, [submitting, navigate]);

  const isPickup = form.delivery_option === "pickup";
  const isLagos = form.state.trim().toLowerCase() === "lagos";
  const selectedZone = zones.find((z) => z.area_name === deliveryArea);

  const deliveryFee = isPickup ? 0 : isLagos ? (selectedZone?.fee_ngn ?? 0) : 0;
  const deliveryFeeConfirmed = isPickup || isLagos;
  const total = subtotal + deliveryFee;

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const payWithCard = (order: { id: string; reference: string; total: number }) => {
    openPaystackCheckout({
      email: form.email,
      amountNgn: order.total,
      reference: order.reference,
      onSuccess: async () => {
        try {
          await verifyPayment({ data: { reference: order.reference } });
        } catch (err) {
          console.error(err);
          // Webhook will still catch it if this verification call fails.
        }
        clear();
        setSubmitting(false);
        navigate({ to: "/order-confirmation/$reference", params: { reference: order.reference } });
      },
      onClose: () => {
        setSubmitting(false);
        toast.info("Payment cancelled — you can try again whenever you're ready.");
      },
    }).catch((err) => {
      console.error(err);
      setSubmitting(false);
      toast.error(err instanceof Error ? err.message : "Could not open card checkout.");
    });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name || !form.email || !form.phone || !form.whatsapp || !form.address || !form.city || !form.state) {
      return toast.error("Please fill all required fields.");
    }
    if (isLagos && !isPickup && !deliveryArea) {
      return toast.error("Please select your delivery area.");
    }

    setSubmitting(true);

    // If a card order was already created (e.g. the customer closed the
    // Paystack popup last time), reopen payment for it instead of creating
    // a duplicate order.
    if (pendingOrder) {
      payWithCard(pendingOrder);
      return;
    }

    const reference = makeOrderReference();

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        reference,
        ...form,
        delivery_area: isPickup ? null : isLagos ? deliveryArea : null,
        delivery_fee_status: deliveryFeeConfirmed ? "confirmed" : "pending_negotiation",
        subtotal_ngn: subtotal,
        delivery_fee_ngn: deliveryFee,
        total_ngn: total,
        payment_method: paymentMethod,
        payment_status: "pending",
        status: "new",
      })
      .select()
      .single();

    if (error || !order) {
      console.error(error);
      toast.error("Could not place order. Please try again.");
      setSubmitting(false);
      return;
    }

    const { error: itemsError } = await supabase.from("order_items").insert(
      items.map((it) => ({
        order_id: order.id,
        product_id: it.productId,
        product_name: it.name,
        size: it.size,
        color: it.color,
        quantity: it.quantity,
        unit_price_ngn: it.unitPrice,
        customization_notes: it.customizationNotes,
        custom_design_url: it.customDesignUrl,
      })),
    );

    if (itemsError) {
      console.error(itemsError);
      toast.error("Order created but items failed to save.");
      setSubmitting(false);
      return;
    }

    notifyOrder({ data: { reference: order.reference } }).catch((err) => console.error(err));

    // Delivery fee isn't known yet (outside Lagos) — skip payment entirely.
    // The customer negotiates via WhatsApp, then pays from the confirmation
    // page once an admin confirms the fee.
    if (!deliveryFeeConfirmed) {
      clear();
      navigate({ to: "/order-confirmation/$reference", params: { reference } });
      return;
    }

    if (paymentMethod === "card") {
      const pending = { id: order.id, reference: order.reference, total: order.total_ngn };
      setPendingOrder(pending);
      payWithCard(pending);
      return;
    }

    clear();
    navigate({ to: "/order-confirmation/$reference", params: { reference } });
  };

  return (
    <div className="bg-background">
      <div className="mx-auto max-w-6xl px-6 lg:px-10 py-12 lg:py-16">
        <p className="eyebrow mb-3">Checkout</p>
        <h1 className="font-display text-4xl lg:text-5xl mb-2">Almost yours</h1>
        <p className="text-muted-foreground mb-12">Review the details below before we get started on your pieces.</p>

        <form onSubmit={onSubmit} className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-10">
            {/* Contact */}
            <section>
              <h2 className="font-display text-2xl mb-6">Contact</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Full name *" value={form.full_name} onChange={set("full_name")} />
                <Field label="Email *" type="email" value={form.email} onChange={set("email")} />
                <Field label="Phone *" value={form.phone} onChange={set("phone")} />
                <Field label="WhatsApp number *" value={form.whatsapp} onChange={set("whatsapp")} />
              </div>
            </section>

            {/* Delivery */}
            <section>
              <h2 className="font-display text-2xl mb-6">Delivery</h2>
              <div className="grid gap-4">
                <Field label="Delivery address *" value={form.address} onChange={set("address")} />
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="City *" value={form.city} onChange={set("city")} />
                  <div>
                    <label className="eyebrow mb-2 block">State *</label>
                    <select
                      value={form.state}
                      onChange={set("state")}
                      className="w-full bg-background border border-border px-3 py-3 text-sm"
                    >
                      <option value="">Select your state…</option>
                      {NIGERIA_STATES.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="eyebrow mb-2 block">Delivery option</label>
                  <select
                    value={form.delivery_option}
                    onChange={set("delivery_option")}
                    className="w-full bg-background border border-border px-3 py-3 text-sm"
                  >
                    <option value="standard">Standard (3–5 business days)</option>
                    <option value="express">Express (1–2 business days)</option>
                    <option value="pickup">Pickup in Lagos</option>
                  </select>
                </div>
                {isLagos && !isPickup && (
                  <div>
                    <label className="eyebrow mb-2 block">Delivery area (Lagos) *</label>
                    <select
                      value={deliveryArea}
                      onChange={(e) => setDeliveryArea(e.target.value)}
                      className="w-full bg-background border border-border px-3 py-3 text-sm"
                    >
                      <option value="">Select your area…</option>
                      {zones.map((z) => (
                        <option key={z.id} value={z.area_name}>
                          {z.area_name} — {formatNaira(z.fee_ngn)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {!isLagos && !isPickup && form.state && (
                  <p className="text-sm text-muted-foreground border border-border bg-muted/40 p-4">
                    We deliver outside Lagos too — the delivery fee for {form.state} will be confirmed with you via WhatsApp
                    right after you place this order, before any payment is taken.
                  </p>
                )}
                <div>
                  <label className="eyebrow mb-2 block">Order notes (optional)</label>
                  <textarea
                    value={form.notes}
                    onChange={set("notes")}
                    rows={3}
                    className="w-full bg-background border border-border px-3 py-3 text-sm"
                  />
                </div>
              </div>
            </section>

            {/* Payment */}
            <section>
              <h2 className="font-display text-2xl mb-6">Payment</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <PayOption
                  active={paymentMethod === "transfer"}
                  onClick={() => setPaymentMethod("transfer")}
                  icon={<Banknote size={18} />}
                  title="Bank transfer"
                  desc="Pay direct, send receipt via WhatsApp."
                />
                <PayOption
                  active={paymentMethod === "card"}
                  onClick={() => setPaymentMethod("card")}
                  icon={<CreditCard size={18} />}
                  title="Card payment"
                  desc="Visa · Mastercard · Verve — instant, secure."
                />
              </div>

              {!deliveryFeeConfirmed && (
                <p className="mt-6 text-sm text-muted-foreground border border-border bg-muted/40 p-4">
                  Payment happens after your delivery fee is confirmed — placing this order now just saves your details and starts the conversation on WhatsApp.
                </p>
              )}

              {deliveryFeeConfirmed && paymentMethod === "transfer" && settings && (
                <div className="mt-6 border border-border bg-muted/40 p-6 text-sm space-y-2">
                  <p className="eyebrow mb-2">Pay to</p>
                  <p><span className="text-muted-foreground">Bank: </span>{settings.bank_name}</p>
                  <p><span className="text-muted-foreground">Account name: </span>{settings.account_name}</p>
                  <p><span className="text-muted-foreground">Account number: </span><span className="font-mono">{settings.account_number}</span></p>
                  <p className="mt-3 text-muted-foreground">After placing this order, you'll be shown your unique reference. Send your payment receipt via WhatsApp with the reference for confirmation.</p>
                </div>
              )}
            </section>

            {/* Trust */}
            <section className="grid sm:grid-cols-2 gap-3 text-xs">
              <Trust icon={<Lock size={14} />} label="Secure checkout" />
              <Trust icon={<ShieldCheck size={14} />} label="Order review before payment" />
              <Trust icon={<MessageCircle size={14} />} label="WhatsApp support" />
              <Trust icon={<Wand2 size={14} />} label="Custom orders welcome" />
              <Trust icon={<Truck size={14} />} label="Delivery confirmation" />
              <Trust icon={<Banknote size={14} />} label="Bank transfer accepted" />
            </section>
          </div>

          {/* Summary */}
          <aside>
            <div className="bg-muted/40 border border-border p-6 lg:sticky lg:top-28">
              <h2 className="font-display text-xl mb-6">Order summary</h2>
              <div className="space-y-4 mb-6 max-h-72 overflow-y-auto pr-2">
                {items.map((it) => (
                  <div key={it.id} className="flex gap-3 text-sm">
                    <div className="w-14 h-16 bg-muted shrink-0 overflow-hidden">
                      {it.image && <img src={it.image} alt="" className="h-full w-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{it.name}</p>
                      <p className="text-xs text-muted-foreground">{[it.size, it.color, `× ${it.quantity}`].filter(Boolean).join(" · ")}</p>
                    </div>
                    <p className="text-sm whitespace-nowrap">{formatNaira(it.unitPrice * it.quantity)}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2 text-sm border-t border-border pt-4">
                <Row label="Subtotal" value={formatNaira(subtotal)} />
                <Row label="Delivery" value={deliveryFeeConfirmed ? formatNaira(deliveryFee) : "To be confirmed"} />
                <div className="h-px bg-border my-2" />
                <Row label="Total" value={deliveryFeeConfirmed ? formatNaira(total) : `${formatNaira(subtotal)} + delivery`} bold />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="btn-pill mt-6 w-full bg-foreground text-primary-foreground py-4 text-xs font-bold uppercase tracking-[0.25em] hover:bg-accent hover:text-accent-foreground transition disabled:opacity-50"
              >
                {submitting
                  ? deliveryFeeConfirmed && paymentMethod === "card" ? "Opening secure checkout…" : "Placing order…"
                  : deliveryFeeConfirmed && paymentMethod === "card" ? "Pay now" : "Place order"}
              </button>
              <Link to="/cart" className="mt-3 block text-center text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground">
                Edit cart
              </Link>
            </div>
          </aside>
        </form>
      </div>
    </div>
  );
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="eyebrow mb-2 block">{label}</span>
      <input {...props} className="w-full bg-background border border-border px-3 py-3 text-sm focus:outline-none focus:border-foreground" />
    </label>
  );
}

function PayOption({ active, onClick, icon, title, desc, disabled }: { active: boolean; onClick: () => void; icon: React.ReactNode; title: string; desc: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left p-4 border transition ${active ? "border-foreground bg-foreground text-primary-foreground" : "border-border hover:border-foreground"} ${disabled ? "opacity-60" : ""}`}
    >
      <div className="flex items-center gap-2 mb-1">{icon}<span className="font-medium">{title}</span></div>
      <p className="text-xs opacity-80">{desc}</p>
    </button>
  );
}

function Trust({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground border border-border px-3 py-2.5">
      {icon}<span>{label}</span>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "font-medium text-base" : ""}`}>
      <span className={bold ? "" : "text-muted-foreground"}>{label}</span>
      <span>{value}</span>
    </div>
  );
}
