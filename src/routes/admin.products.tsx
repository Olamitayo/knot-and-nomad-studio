import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatNaira } from "@/lib/format";
import { toast } from "sonner";
import { Plus, Trash2, Upload } from "lucide-react";

export const Route = createFileRoute("/admin/products")({
  component: AdminProducts,
});

interface Product {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  description: string | null;
  category: string;
  price_ngn: number;
  images: string[];
  sizes: string[];
  colors: string[];
  is_active: boolean;
  is_sold_out: boolean;
  is_new_arrival: boolean;
  is_bestseller: boolean;
  is_customizable: boolean;
  sort_order: number;
}

const blank: Omit<Product, "id"> = {
  slug: "", name: "", short_description: "", description: "", category: "T-shirts",
  price_ngn: 0, images: [], sizes: ["S", "M", "L"], colors: ["Black"], is_active: true,
  is_sold_out: false, is_new_arrival: false, is_bestseller: false, is_customizable: false, sort_order: 0,
};

function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<(Product | (Omit<Product, "id"> & { id?: string })) | null>(null);
  const [uploading, setUploading] = useState(false);

  const reload = () => supabase.from("products").select("*").order("sort_order").then(({ data }) => setProducts((data as Product[]) ?? []));
  useEffect(() => { reload(); }, []);

  const save = async () => {
    if (!editing) return;
    const payload = { ...editing, slug: editing.slug || editing.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") };
    const { id, ...rest } = payload as any;
    const op = id
      ? supabase.from("products").update(rest).eq("id", id)
      : supabase.from("products").insert(rest);
    const { error } = await op;
    if (error) toast.error(error.message);
    else { toast.success("Saved"); setEditing(null); reload(); }
  };

  const del = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Deleted"); reload(); }
  };

  const uploadImage = async (file: File) => {
    if (!editing) return;
    setUploading(true);
    const path = `products/${crypto.randomUUID()}.${file.name.split(".").pop() ?? "jpg"}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file);
    if (error) { toast.error(error.message); setUploading(false); return; }
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    setEditing({ ...editing, images: [...editing.images, data.publicUrl] });
    setUploading(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-display text-2xl">Products</h2>
        <button onClick={() => setEditing({ ...blank })} className="bg-foreground text-primary-foreground px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] hover:bg-accent hover:text-accent-foreground transition flex items-center gap-2">
          <Plus size={14} /> New
        </button>
      </div>

      <div className="border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left">
            <tr>
              <th className="p-3 font-medium">Name</th>
              <th className="p-3 font-medium">Category</th>
              <th className="p-3 font-medium">Price</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="p-3">
                  <button onClick={() => setEditing(p)} className="hover:underline">{p.name}</button>
                </td>
                <td className="p-3 text-muted-foreground">{p.category}</td>
                <td className="p-3">{formatNaira(p.price_ngn)}</td>
                <td className="p-3 text-xs">
                  {!p.is_active && <span className="text-muted-foreground">Hidden · </span>}
                  {p.is_sold_out ? <span>Sold out</span> : <span className="text-accent">Live</span>}
                </td>
                <td className="p-3 text-right">
                  <button onClick={() => del(p.id)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No products yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setEditing(null)}>
          <div className="bg-background border border-border max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-2xl mb-6">{(editing as any).id ? "Edit" : "New"} product</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Name" value={editing.name} onChange={(v) => setEditing({ ...editing, name: v })} />
              <Input label="Slug (URL)" value={editing.slug} onChange={(v) => setEditing({ ...editing, slug: v })} />
              <Input label="Category" value={editing.category} onChange={(v) => setEditing({ ...editing, category: v })} />
              <Input label="Price (NGN)" type="number" value={String(editing.price_ngn)} onChange={(v) => setEditing({ ...editing, price_ngn: Number(v) || 0 })} />
              <div className="sm:col-span-2">
                <Input label="Short description" value={editing.short_description ?? ""} onChange={(v) => setEditing({ ...editing, short_description: v })} />
              </div>
              <div className="sm:col-span-2">
                <label className="block">
                  <span className="eyebrow mb-2 block">Full description</span>
                  <textarea value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={4} className="w-full bg-background border border-border px-3 py-2 text-sm" />
                </label>
              </div>
              <Input label="Sizes (comma-separated)" value={editing.sizes.join(", ")} onChange={(v) => setEditing({ ...editing, sizes: v.split(",").map((s) => s.trim()).filter(Boolean) })} />
              <Input label="Colors (comma-separated)" value={editing.colors.join(", ")} onChange={(v) => setEditing({ ...editing, colors: v.split(",").map((s) => s.trim()).filter(Boolean) })} />
              <Input label="Sort order" type="number" value={String(editing.sort_order)} onChange={(v) => setEditing({ ...editing, sort_order: Number(v) || 0 })} />
              <div className="sm:col-span-2">
                <span className="eyebrow mb-2 block">Images</span>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {editing.images.map((src, i) => (
                    <div key={i} className="relative aspect-square bg-muted">
                      <img src={src} alt="" className="h-full w-full object-cover" />
                      <button onClick={() => setEditing({ ...editing, images: editing.images.filter((_, j) => j !== i) })} className="absolute top-1 right-1 bg-background/90 p-1 hover:bg-destructive hover:text-destructive-foreground">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
                <label className="border border-border border-dashed p-4 flex items-center justify-center gap-2 text-sm cursor-pointer hover:bg-muted/40">
                  <Upload size={14} />{uploading ? "Uploading…" : "Add image"}
                  <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])} />
                </label>
                <p className="text-xs text-muted-foreground mt-2">Or paste URL:</p>
                <div className="flex gap-2 mt-1">
                  <input id="urlinput" placeholder="https://…" className="flex-1 bg-background border border-border px-3 py-2 text-sm" />
                  <button type="button" onClick={() => {
                    const el = document.getElementById("urlinput") as HTMLInputElement;
                    if (el?.value) { setEditing({ ...editing, images: [...editing.images, el.value] }); el.value = ""; }
                  }} className="border border-border px-3 text-xs font-bold uppercase tracking-[0.25em]">Add</button>
                </div>
              </div>
              <div className="sm:col-span-2 grid grid-cols-2 gap-2">
                <Toggle label="Active" value={editing.is_active} onChange={(v) => setEditing({ ...editing, is_active: v })} />
                <Toggle label="Sold out" value={editing.is_sold_out} onChange={(v) => setEditing({ ...editing, is_sold_out: v })} />
                <Toggle label="New arrival" value={editing.is_new_arrival} onChange={(v) => setEditing({ ...editing, is_new_arrival: v })} />
                <Toggle label="Bestseller" value={editing.is_bestseller} onChange={(v) => setEditing({ ...editing, is_bestseller: v })} />
                <Toggle label="Customizable" value={editing.is_customizable} onChange={(v) => setEditing({ ...editing, is_customizable: v })} />
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={save} className="flex-1 bg-foreground text-primary-foreground py-3 text-xs font-bold uppercase tracking-[0.25em]">Save</button>
              <button onClick={() => setEditing(null)} className="flex-1 border border-border py-3 text-xs font-bold uppercase tracking-[0.25em]">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Input({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="eyebrow mb-2 block">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-background border border-border px-3 py-2 text-sm" />
    </label>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm cursor-pointer">
      <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} className="accent-accent" />
      <span>{label}</span>
    </label>
  );
}
