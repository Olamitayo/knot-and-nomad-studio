import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { formatNaira } from "@/lib/format";
import { whatsappLink } from "@/lib/site";
import { openPaystackCheckout } from "@/lib/paystack";
import { verifyPaystackPayment, notifyReceiptSubmitted } from "@/lib/payments.functions";
import { toast } from "sonner";
import { CheckCircle2, Copy, CreditCard, MessageCircle, Upload } from "lucide-react";

export const Route = createFileRoute("/order-confirmation/$reference")({
  component: ConfirmationPage,
});

interface Order {
  id: string;
  reference: string;
  full_name: string;
  email: string;
  whatsapp: string;
  city: string;
  state: string;
  subtotal_ngn: number;
  total_ngn: number;
  payment_method: string;
  payment_status: string;
  delivery_fee_status: string;
  receipt_url: string | null;
}

interface Settings {
  bank_name: string;
  account_name: string;
  account_number: string;
}

function ConfirmationPage() {
  const { reference } = Route.useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [uploading, setUploading] = useState(false);
  const [paying, setPaying] = useState(false);
  const verifyPayment = useServerFn(verifyPaystackPayment);
  const notifyReceipt = useServerFn(notifyReceiptSubmitted);

  const reload = () =>
    supabase
      .from("orders")
      .select(
        "id, reference, full_name, email, whatsapp, city, state, subtotal_ngn, total_ngn, payment_method, payment_status, delivery_fee_status, receipt_url",
      )
      .eq("reference", reference)
      .maybeSingle()
      .then(({ data }) => setOrder(data as Order | null));

  useEffect(() => {
    reload();
    supabase
      .from("app_settings")
      .select("*")
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setSettings(data as Settings);
      });
  }, [reference]);

  const onUploadReceipt = async (file: File) => {
    if (!order) return;
    setUploading(true);
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `receipts/${order.id}-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("payment-receipts").upload(path, file);
    if (upErr) {
      toast.error("Upload failed");
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("payment-receipts").getPublicUrl(path);
    const { error: updErr } = await supabase
      .from("orders")
      .update({ receipt_url: data.publicUrl, payment_status: "receipt_submitted" })
      .eq("id", order.id);
    if (updErr) {
      toast.error("Could not attach receipt");
    } else {
      toast.success("Receipt uploaded — please confirm via WhatsApp.");
      notifyReceipt({ data: { reference: order.reference } }).catch((err) => console.error(err));
      reload();
    }
    setUploading(false);
  };

  const copy = (txt: string) => {
    navigator.clipboard.writeText(txt);
    toast.success("Copied");
  };

  const retryCardPayment = () => {
    if (!order) return;
    setPaying(true);
    openPaystackCheckout({
      email: order.email,
      amountNgn: order.total_ngn,
      reference: order.reference,
      onSuccess: async () => {
        try {
          await verifyPayment({ data: { reference: order.reference } });
        } catch (err) {
          console.error(err);
        }
        setPaying(false);
        reload();
      },
      onClose: () => setPaying(false),
    }).catch((err) => {
      console.error(err);
      setPaying(false);
      toast.error(err instanceof Error ? err.message : "Could not open card checkout.");
    });
  };

  const whatsappMsg = order
    ? `Hi Knot & Nomad, I just placed order ${order.reference} (total ${formatNaira(order.total_ngn)}). Sending my payment receipt now.`
    : "";

  const deliveryWhatsappMsg = order
    ? `Hi Knot & Nomad, I'd like to confirm my delivery fee for order ${order.reference} — my delivery address is in ${order.city}, ${order.state}.`
    : "";

  if (!order) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center text-muted-foreground">
        Loading order…
      </div>
    );
  }

  const awaitingDeliveryFee = order.delivery_fee_status === "pending_negotiation";
  const isTransfer = order.payment_method === "transfer" && !awaitingDeliveryFee;
  const isCardPending =
    order.payment_method === "card" && order.payment_status !== "paid" && !awaitingDeliveryFee;
  const isCardPaid = order.payment_method === "card" && order.payment_status === "paid";

  return (
    <div className="bg-background">
      <div className="mx-auto max-w-3xl px-6 lg:px-10 py-16">
        <div className="text-center mb-12">
          <CheckCircle2 size={48} className="mx-auto text-accent" />
          <p className="eyebrow mt-6 mb-3">Order received</p>
          <h1 className="font-display text-4xl lg:text-5xl">
            Thank you, {order.full_name.split(" ")[0]}.
          </h1>
          <p className="mt-4 text-muted-foreground">
            Your order has been received.{" "}
            {awaitingDeliveryFee &&
              "We'll confirm your delivery fee via WhatsApp before any payment is taken. "}
            {isTransfer && "Kindly send your payment receipt via WhatsApp for confirmation. "}
            {isCardPending &&
              "Your card payment hasn't completed yet — pay below to confirm your order. "}
            Our team will contact you shortly.
          </p>
        </div>

        <div className="border border-border p-6 lg:p-8 bg-muted/40 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <div>
              <p className="eyebrow">Order reference</p>
              <p className="font-mono text-lg mt-1">{order.reference}</p>
            </div>
            <button
              onClick={() => copy(order.reference)}
              className="text-xs font-bold uppercase tracking-[0.25em] flex items-center gap-2 hover:text-accent"
            >
              <Copy size={12} /> Copy
            </button>
          </div>
          <div className="h-px bg-border my-4" />
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Total: </span>
              {awaitingDeliveryFee
                ? `${formatNaira(order.subtotal_ngn)} + delivery (tbc)`
                : formatNaira(order.total_ngn)}
            </div>
            <div>
              <span className="text-muted-foreground">Payment: </span>
              {order.payment_method === "transfer" ? "Bank transfer" : "Card"}
            </div>
            <div>
              <span className="text-muted-foreground">Status: </span>
              {awaitingDeliveryFee
                ? "awaiting delivery fee"
                : order.payment_status.replace(/_/g, " ")}
            </div>
            <div>
              <span className="text-muted-foreground">Email: </span>
              {order.email}
            </div>
          </div>
        </div>

        {awaitingDeliveryFee && (
          <div className="border border-border p-6 lg:p-8 mb-8 text-center">
            <p className="eyebrow mb-3">Delivery fee</p>
            <p className="text-sm text-muted-foreground mb-6">
              Since your delivery address is outside Lagos, we'll confirm the delivery fee with you
              directly. Once agreed, refresh this page (or reopen this link) to complete payment.
            </p>
            <a
              href={whatsappLink(deliveryWhatsappMsg)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-pill inline-flex items-center gap-2 bg-foreground text-primary-foreground px-7 py-4 text-xs font-bold uppercase tracking-[0.25em] hover:bg-accent hover:text-accent-foreground transition"
            >
              <MessageCircle size={16} /> Discuss delivery on WhatsApp
            </a>
          </div>
        )}

        {isCardPending && (
          <div className="border border-border p-6 lg:p-8 mb-8 text-center">
            <p className="eyebrow mb-3">Card payment</p>
            <p className="text-sm text-muted-foreground mb-6">
              Your payment wasn't completed. Click below to open secure checkout and finish paying —
              your order is already saved.
            </p>
            <button
              onClick={retryCardPayment}
              disabled={paying}
              className="btn-pill inline-flex items-center gap-2 bg-foreground text-primary-foreground px-7 py-4 text-xs font-bold uppercase tracking-[0.25em] hover:bg-accent hover:text-accent-foreground transition disabled:opacity-50"
            >
              <CreditCard size={16} /> {paying ? "Opening secure checkout…" : "Pay now"}
            </button>
          </div>
        )}

        {isCardPaid && (
          <div className="border border-accent/40 bg-accent/5 p-6 lg:p-8 mb-8 text-center">
            <CheckCircle2 size={28} className="mx-auto text-accent mb-3" />
            <p className="text-sm">Payment confirmed — thank you.</p>
          </div>
        )}

        {isTransfer && settings && (
          <div className="border border-border p-6 lg:p-8 mb-8">
            <p className="eyebrow mb-4">Bank transfer details</p>
            <div className="space-y-2 text-sm mb-6">
              <p>
                <span className="text-muted-foreground">Bank: </span>
                {settings.bank_name}
              </p>
              <p>
                <span className="text-muted-foreground">Account name: </span>
                {settings.account_name}
              </p>
              <p className="flex items-center gap-2">
                <span className="text-muted-foreground">Account number: </span>
                <span className="font-mono">{settings.account_number}</span>
                <button
                  onClick={() => copy(settings.account_number)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Copy size={12} />
                </button>
              </p>
            </div>

            <div className="space-y-3">
              <label className="block">
                <span className="eyebrow mb-2 block">Upload payment receipt</span>
                <label className="border border-border border-dashed p-6 flex flex-col items-center gap-2 cursor-pointer hover:bg-muted/40 transition">
                  <Upload size={18} className="text-muted-foreground" />
                  <span className="text-sm">
                    {order.receipt_url
                      ? "Receipt uploaded — replace?"
                      : "Click to upload screenshot or PDF"}
                  </span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    disabled={uploading}
                    onChange={(e) => e.target.files?.[0] && onUploadReceipt(e.target.files[0])}
                  />
                </label>
              </label>
              {order.receipt_url && (
                <a
                  href={order.receipt_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold uppercase tracking-[0.25em] underline"
                >
                  View uploaded receipt
                </a>
              )}
              <a
                href={whatsappLink(whatsappMsg)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-pill w-full block text-center bg-foreground text-primary-foreground py-4 text-xs font-bold uppercase tracking-[0.25em] hover:bg-accent hover:text-accent-foreground transition"
              >
                <span className="inline-flex items-center gap-2">
                  <MessageCircle size={14} /> Confirm via WhatsApp
                </span>
              </a>
            </div>
          </div>
        )}

        <div className="text-center">
          <Link
            to="/shop"
            className="text-xs font-bold uppercase tracking-[0.25em] underline-offset-4 hover:underline"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
