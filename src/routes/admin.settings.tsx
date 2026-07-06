import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

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

interface DeliveryZone {
  id: string;
  area_name: string;
  fee_ngn: number;
  sort_order: number;
}

function AdminSettings() {
  const [s, setS] = useState<Settings | null>(null);
  const [busy, setBusy] = useState(false);
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [newZone, setNewZone] = useState({ area_name: "", fee_ngn: "" });
  const [zoneBusy, setZoneBusy] = useState(false);

  useEffect(() => {
    supabase.from("app_settings").select("*").limit(1).maybeSingle().then(({ data }) => setS(data as Settings | null));
    reloadZones();
  }, []);

  const reloadZones = () =>
    supabase.from("delivery_zones").select("*").order("sort_order").order("area_name")
      .then(({ data }) => setZones((data as DeliveryZone[]) ?? []));

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

  const addZone = async () => {
    if (!newZone.area_name.trim()) return toast.error("Enter an area name.");
    setZoneBusy(true);
    const { error } = await supabase.from("delivery_zones").insert({
      area_name: newZone.area_name.trim(),
      fee_ngn: Number(newZone.fee_ngn) || 0,
      sort_order: zones.length,
    });
    setZoneBusy(false);
    if (error) return toast.error(error.message);
    setNewZone({ area_name: "", fee_ngn: "" });
    reloadZones();
  };

  const updateZoneFee = async (zone: DeliveryZone, fee_ngn: number) => {
    const { error } = await supabase.from("delivery_zones").update({ fee_ngn }).eq("id", zone.id);
    if (error) toast.error(error.message);
    else reloadZones();
  };

  const deleteZone = async (id: string) => {
    if (!confirm("Delete this delivery area?")) return;
    const { error } = await supabase.from("delivery_zones").delete().eq("id", id);
    if (error) toast.error(error.message);
    else reloadZones();
  };

  if (!s) return <p className="text-muted-foreground">Loading…</p>;

  return (
    <div className="max-w-2xl space-y-12">
      <div>
        <h2 className="font-display text-2xl mb-6">Settings</h2>
        <div className="space-y-4">
          <Field label="Bank name" value={s.bank_name} onChange={(v) => setS({ ...s, bank_name: v })} />
          <Field label="Account name" value={s.account_name} onChange={(v) => setS({ ...s, account_name: v })} />
          <Field label="Account number" value={s.account_number} onChange={(v) => setS({ ...s, account_number: v })} />
          <button onClick={save} disabled={busy} className="bg-foreground text-primary-foreground px-6 py-3 text-xs font-bold uppercase tracking-[0.25em] disabled:opacity-50">
            {busy ? "Saving…" : "Save settings"}
          </button>
        </div>
      </div>

      <div>
        <h2 className="font-display text-2xl mb-2">Lagos delivery areas</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Each area has its own delivery fee, shown to customers at checkout when their state is Lagos.
          Orders outside Lagos aren't priced here — their delivery fee is negotiated per order (see Orders).
          Pickup orders are always free regardless of these fees.
        </p>
        <div className="border border-border divide-y divide-border">
          {zones.map((z) => (
            <div key={z.id} className="flex items-center gap-3 p-3">
              <span className="flex-1 text-sm">{z.area_name}</span>
              <input
                type="number"
                defaultValue={z.fee_ngn}
                onBlur={(e) => {
                  const v = Number(e.target.value) || 0;
                  if (v !== z.fee_ngn) updateZoneFee(z, v);
                }}
                className="w-32 bg-background border border-border px-3 py-2 text-sm"
              />
              <button onClick={() => deleteZone(z.id)} className="p-2 text-muted-foreground hover:text-destructive">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {zones.length === 0 && <p className="p-4 text-sm text-muted-foreground">No delivery areas yet — add one below.</p>}
        </div>

        <div className="flex items-end gap-3 mt-4">
          <label className="flex-1 block">
            <span className="eyebrow mb-2 block">Area name</span>
            <input
              value={newZone.area_name}
              onChange={(e) => setNewZone({ ...newZone, area_name: e.target.value })}
              placeholder="e.g. Ikeja"
              className="w-full bg-background border border-border px-3 py-2 text-sm"
            />
          </label>
          <label className="w-32 block">
            <span className="eyebrow mb-2 block">Fee (NGN)</span>
            <input
              type="number"
              value={newZone.fee_ngn}
              onChange={(e) => setNewZone({ ...newZone, fee_ngn: e.target.value })}
              className="w-full bg-background border border-border px-3 py-2 text-sm"
            />
          </label>
          <button onClick={addZone} disabled={zoneBusy} className="bg-foreground text-primary-foreground px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] hover:bg-accent hover:text-accent-foreground transition disabled:opacity-50 flex items-center gap-2">
            <Plus size={14} /> Add
          </button>
        </div>
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
