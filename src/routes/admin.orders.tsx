import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatNaira } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrders,
});

interface Order {
  id: string;
  reference: string;
  full_name: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  city: string;
  state: string;
  total_ngn: number;
  payment_method: string;
  payment_status: string;
  receipt_url: string | null;
  status: string;
  notes: string | null;
  created_at: string;
}
interface Item {
  id: string;
  product_name: string;
  size: string | null;
  color: string | null;
  quantity: number;
  unit_price_ngn: number;
  customization_notes: string | null;
  custom_design_url: string | null;
}

function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [open, setOpen] = useState<Order | null>(null);
  const [items, setItems] = useState<Item[]>([]);

  const reload = () => supabase.from("orders").select("*").order("created_at", { ascending: false }).then(({ data }) => setOrders((data as Order[]) ?? []));
  useEffect(() => { reload(); }, []);

  useEffect(() => {
    if (!open) { setItems([]); return; }
    supabase.from("order_items").select("*").eq("order_id", open.id).then(({ data }) => setItems((data as Item[]) ?? []));
  }, [open]);

  const updateStatus = async (id: string, payment_status?: string, status?: string) => {
    const patch: any = {};
    if (payment_status) patch.payment_status = payment_status;
    if (status) patch.status = status;
    const { error } = await supabase.from("orders").update(patch).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Updated"); reload(); if (open?.id === id) setOpen({ ...open, ...patch }); }
  };

  return (
    <div>
      <h2 className="font-display text-2xl mb-6">Orders</h2>
      <div className="border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left">
            <tr>
              <th className="p-3 font-medium">Reference</th>
              <th className="p-3 font-medium">Customer</th>
              <th className="p-3 font-medium">Total</th>
              <th className="p-3 font-medium">Payment</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t border-border hover:bg-muted/30 cursor-pointer" onClick={() => setOpen(o)}>
                <td className="p-3 font-mono text-xs">{o.reference}</td>
                <td className="p-3">{o.full_name}<div className="text-xs text-muted-foreground">{o.email}</div></td>
                <td className="p-3">{formatNaira(o.total_ngn)}</td>
                <td className="p-3 text-xs capitalize">{o.payment_method} · {o.payment_status.replace(/_/g, " ")}</td>
                <td className="p-3 text-xs capitalize">{o.status}</td>
                <td className="p-3 text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {orders.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No orders yet.</td></tr>}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setOpen(null)}>
          <div className="bg-background border border-border max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <p className="eyebrow mb-2">Order</p>
            <h3 className="font-display text-2xl font-mono">{open.reference}</h3>
            <p className="text-sm text-muted-foreground mt-1">{new Date(open.created_at).toLocaleString()}</p>

            <div className="grid sm:grid-cols-2 gap-3 mt-6 text-sm">
              <Detail label="Name" value={open.full_name} />
              <Detail label="Email" value={open.email} />
              <Detail label="Phone" value={open.phone} />
              <Detail label="WhatsApp" value={open.whatsapp} />
              <Detail label="City / State" value={`${open.city}, ${open.state}`} />
              <Detail label="Total" value={formatNaira(open.total_ngn)} />
            </div>
            <div className="mt-3 text-sm">
              <Detail label="Address" value={open.address} />
              {open.notes && <Detail label="Notes" value={open.notes} />}
            </div>

            <div className="mt-6">
              <p className="eyebrow mb-3">Items</p>
              <div className="space-y-2">
                {items.map((it) => (
                  <div key={it.id} className="flex justify-between text-sm border border-border p-3">
                    <div>
                      <p className="font-medium">{it.product_name}</p>
                      <p className="text-xs text-muted-foreground">{[it.size, it.color, `× ${it.quantity}`].filter(Boolean).join(" · ")}</p>
                      {it.customization_notes && <p className="text-xs italic mt-1">Custom: {it.customization_notes}</p>}
                      {it.custom_design_url && <a href={it.custom_design_url} target="_blank" rel="noopener noreferrer" className="text-xs underline">View design</a>}
                    </div>
                    <p className="text-sm">{formatNaira(it.unit_price_ngn * it.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>

            {open.receipt_url && (
              <div className="mt-6">
                <p className="eyebrow mb-2">Payment receipt</p>
                <a href={open.receipt_url} target="_blank" rel="noopener noreferrer" className="text-sm underline">View uploaded receipt</a>
              </div>
            )}

            <div className="mt-8 grid sm:grid-cols-2 gap-3">
              <div>
                <p className="eyebrow mb-2">Payment status</p>
                <select value={open.payment_status} onChange={(e) => updateStatus(open.id, e.target.value)} className="w-full bg-background border border-border px-3 py-2 text-sm">
                  <option value="pending">Pending</option>
                  <option value="receipt_submitted">Receipt submitted</option>
                  <option value="paid">Paid</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
              <div>
                <p className="eyebrow mb-2">Order status</p>
                <select value={open.status} onChange={(e) => updateStatus(open.id, undefined, e.target.value)} className="w-full bg-background border border-border px-3 py-2 text-sm">
                  <option value="new">New</option>
                  <option value="in_production">In production</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <button onClick={() => setOpen(null)} className="mt-6 w-full border border-border py-3 text-xs uppercase tracking-[0.25em]">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div><span className="text-muted-foreground">{label}: </span>{value}</div>;
}
