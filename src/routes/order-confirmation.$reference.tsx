import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatNaira } from "@/lib/format";
import { whatsappLink } from "@/lib/site";
import { toast } from "sonner";
import { CheckCircle2, Copy, MessageCircle, Upload } from "lucide-react";

export const Route = createFileRoute("/order-confirmation/$reference")({
  component: ConfirmationPage,
});

interface Order {
  id: string;
  reference: string;
  full_name: string;
  email: string;
  whatsapp: string;
  total_ngn: number;
  payment_method: string;
  payment_status: string;
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

  const reload = () =>
    supabase
      .from("orders")
      .select("id, reference, full_name, email, whatsapp, total_ngn, payment_method, payment_status, receipt_url")
      .eq("reference", reference)
      .maybeSingle()
      .then(({ data }) => setOrder(data as Order | null));

  useEffect(() => {
    reload();
    supabase.from("app_settings").select("*").limit(1).maybeSingle().then(({ data }) => {
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
      reload();
    }
    setUploading(false);
  };

  const copy = (txt: string) => {
    navigator.clipboard.writeText(txt);
    toast.success("Copied");
  };

  const whatsappMsg = order
    ? `Hi Knot & Nomad, I just placed order ${order.reference} (total ${formatNaira(order.total_ngn)}). Sending my payment receipt now.`
    : "";

  if (!order) {
    return <div className="mx-auto max-w-3xl px-6 py-24 text-center text-muted-foreground">Loading order…</div>;
  }

  const isTransfer = order.payment_method === "transfer";

  return (
    <div className="bg-background">
      <div className="mx-auto max-w-3xl px-6 lg:px-10 py-16">
        <div className="text-center mb-12">
          <CheckCircle2 size={48} className="mx-auto text-accent" />
          <p className="eyebrow mt-6 mb-3">Order received</p>
          <h1 className="font-display text-4xl lg:text-5xl">Thank you, {order.full_name.split(" ")[0]}.</h1>
          <p className="mt-4 text-muted-foreground">
            Your order has been received. {isTransfer && "Kindly send your payment receipt via WhatsApp for confirmation."} Our team will contact you shortly.
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
              className="text-xs uppercase tracking-[0.25em] flex items-center gap-2 hover:text-accent"
            >
              <Copy size={12} /> Copy
            </button>
          </div>
          <div className="h-px bg-border my-4" />
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <div><span className="text-muted-foreground">Total: </span>{formatNaira(order.total_ngn)}</div>
            <div><span className="text-muted-foreground">Payment: </span>{isTransfer ? "Bank transfer" : "Card"}</div>
            <div><span className="text-muted-foreground">Status: </span>{order.payment_status.replace(/_/g, " ")}</div>
            <div><span className="text-muted-foreground">Email: </span>{order.email}</div>
          </div>
        </div>

        {isTransfer && settings && (
          <div className="border border-border p-6 lg:p-8 mb-8">
            <p className="eyebrow mb-4">Bank transfer details</p>
            <div className="space-y-2 text-sm mb-6">
              <p><span className="text-muted-foreground">Bank: </span>{settings.bank_name}</p>
              <p><span className="text-muted-foreground">Account name: </span>{settings.account_name}</p>
              <p className="flex items-center gap-2">
                <span className="text-muted-foreground">Account number: </span>
                <span className="font-mono">{settings.account_number}</span>
                <button onClick={() => copy(settings.account_number)} className="text-muted-foreground hover:text-foreground">
                  <Copy size={12} />
                </button>
              </p>
            </div>

            <div className="space-y-3">
              <label className="block">
                <span className="eyebrow mb-2 block">Upload payment receipt</span>
                <label className="border border-border border-dashed p-6 flex flex-col items-center gap-2 cursor-pointer hover:bg-muted/40 transition">
                  <Upload size={18} className="text-muted-foreground" />
                  <span className="text-sm">{order.receipt_url ? "Receipt uploaded — replace?" : "Click to upload screenshot or PDF"}</span>
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
                <a href={order.receipt_url} target="_blank" rel="noopener noreferrer" className="text-xs uppercase tracking-[0.25em] underline">
                  View uploaded receipt
                </a>
              )}
              <a
                href={whatsappLink(whatsappMsg)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full block text-center bg-foreground text-primary-foreground py-4 text-xs uppercase tracking-[0.25em] hover:bg-accent hover:text-accent-foreground transition"
              >
                <span className="inline-flex items-center gap-2"><MessageCircle size={14} /> Confirm via WhatsApp</span>
              </a>
            </div>
          </div>
        )}

        <div className="text-center">
          <Link to="/shop" className="text-xs uppercase tracking-[0.25em] underline-offset-4 hover:underline">
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
