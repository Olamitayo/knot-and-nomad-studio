import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatNaira } from "@/lib/format";

export const Route = createFileRoute("/admin/")({
  component: AdminOverview,
});

function AdminOverview() {
  const [counts, setCounts] = useState({ products: 0, orders: 0, pending: 0, revenue: 0 });

  useEffect(() => {
    (async () => {
      const [{ count: pCount }, { count: oCount }, { data: pending }, { data: paid }] = await Promise.all([
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("id").eq("payment_status", "pending"),
        supabase.from("orders").select("total_ngn").in("payment_status", ["paid", "receipt_submitted"]),
      ]);
      setCounts({
        products: pCount ?? 0,
        orders: oCount ?? 0,
        pending: pending?.length ?? 0,
        revenue: (paid ?? []).reduce((s, o: any) => s + (o.total_ngn ?? 0), 0),
      });
    })();
  }, []);

  const stats = [
    { label: "Products", value: counts.products, to: "/admin/products" as const },
    { label: "Orders", value: counts.orders, to: "/admin/orders" as const },
    { label: "Awaiting payment", value: counts.pending, to: "/admin/orders" as const },
    { label: "Revenue (received)", value: formatNaira(counts.revenue), to: "/admin/orders" as const },
  ];

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => (
        <Link key={s.label} to={s.to} className="border border-border p-6 hover:bg-muted/40 transition">
          <p className="eyebrow mb-3">{s.label}</p>
          <p className="font-display text-3xl">{s.value}</p>
        </Link>
      ))}
    </div>
  );
}
