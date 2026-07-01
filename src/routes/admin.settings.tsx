import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettings,
});

interface Settings {
  id: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  delivery_fee_ngn: number;
}

function AdminSettings() {
  const [s, setS] = useState<Settings | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.from("app_settings").select("*").limit(1).maybeSingle().then(({ data }) => setS(data as Settings | null));
  }, []);

  const save = async () => {
    if (!s) return;
    setBusy(true);
    const { error } = await supabase.from("app_settings").update({
      bank_name: s.bank_name, account_name: s.account_name,
      account_number: s.account_number, delivery_fee_ngn: s.delivery_fee_ngn,
    }).eq("id", s.id);
    setBusy(false);
    if (error) toast.error(error.message); else toast.success("Saved");
  };

  if (!s) return <p className="text-muted-foreground">Loading…</p>;

  return (
    <div className="max-w-2xl">
      <h2 className="font-display text-2xl mb-6">Settings</h2>
      <div className="space-y-4">
        <Field label="Bank name" value={s.bank_name} onChange={(v) => setS({ ...s, bank_name: v })} />
        <Field label="Account name" value={s.account_name} onChange={(v) => setS({ ...s, account_name: v })} />
        <Field label="Account number" value={s.account_number} onChange={(v) => setS({ ...s, account_number: v })} />
        <Field label="Delivery fee (NGN)" type="number" value={String(s.delivery_fee_ngn)} onChange={(v) => setS({ ...s, delivery_fee_ngn: Number(v) || 0 })} />
        <button onClick={save} disabled={busy} className="bg-foreground text-primary-foreground px-6 py-3 text-xs uppercase tracking-[0.25em] disabled:opacity-50">
          {busy ? "Saving…" : "Save settings"}
        </button>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="eyebrow mb-2 block">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-background border border-border px-3 py-2 text-sm" />
    </label>
  );
}
