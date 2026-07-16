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
  gallery: GalleryItem[];
  sku: string | null;
  stock_level: number;
  material: string | null;
  fit: string | null;
  care_instructions: string | null;
  delivery_estimate: string | null;
  subcategory: string | null;
  starting_price_ngn: number | null;
  is_ready_to_wear: boolean;
  product_tags: string[];
  variants: ProductVariant[];
  size_guide: Record<string, string>[];
}

interface GalleryItem {
  url: string;
  color: string;
  shot: string;
}
interface ProductVariant {
  colour: string;
  sku: string;
  stockLevel: number;
  images: { url: string; shot: string }[];
  priceOverride?: number | null;
}
const SHOT_TYPES = [
  "Editorial",
  "Front",
  "Back",
  "Flat lay",
  "Fabric close-up",
  "Detail",
  "Size chart",
  "Styling reference",
];

const blank: Omit<Product, "id"> = {
  slug: "",
  name: "",
  short_description: "",
  description: "",
  category: "T-shirts",
  price_ngn: 0,
  images: [],
  sizes: ["S", "M", "L"],
  colors: ["Black"],
  is_active: true,
  is_sold_out: false,
  is_new_arrival: false,
  is_bestseller: false,
  is_customizable: false,
  sort_order: 0,
  gallery: [],
  sku: "",
  stock_level: 0,
  material: "",
  fit: "",
  care_instructions: "",
  delivery_estimate: "5–7 working days",
  subcategory: "",
  starting_price_ngn: null,
  is_ready_to_wear: true,
  product_tags: ["Ready-to-wear"],
  variants: [],
  size_guide: [],
};

function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<
    (Product | (Omit<Product, "id"> & { id?: string })) | null
  >(null);
  const [uploading, setUploading] = useState(false);

  const reload = () =>
    supabase
      .from("products")
      .select("*")
      .order("sort_order")
      .then(({ data }) => setProducts((data as Product[]) ?? []));
  useEffect(() => {
    reload();
  }, []);

  const save = async () => {
    if (!editing) return;
    if (editing.is_active && !editing.sku?.trim()) {
      toast.error("Add a SKU before publishing this product");
      return;
    }
    const gallery = editing.gallery?.length
      ? editing.gallery
      : editing.images.map((url, index) => ({
          url,
          color: editing.colors[0] ?? "",
          shot: SHOT_TYPES[index] ?? "Detail",
        }));
    const incompleteColor = editing.colors.find(
      (color) =>
        gallery.filter((item) => !item.color || item.color.toLowerCase() === color.toLowerCase())
          .length < 5,
    );
    if (editing.is_active && incompleteColor) {
      toast.error(`Add at least 5 gallery images for ${incompleteColor}`);
      return;
    }
    const variants = editing.colors.map((colour) => {
      const current = editing.variants?.find(
        (variant) => variant.colour.toLowerCase() === colour.toLowerCase(),
      );
      return {
        colour,
        sku: current?.sku || `${editing.sku}-${colour.slice(0, 3).toUpperCase()}`,
        stockLevel: current?.stockLevel ?? 0,
        priceOverride: current?.priceOverride ?? null,
        images: gallery
          .filter((item) => item.color.toLowerCase() === colour.toLowerCase())
          .map(({ url, shot }) => ({ url, shot })),
      };
    });
    const payload = {
      ...editing,
      gallery,
      variants,
      stock_level:
        variants.reduce((sum, variant) => sum + variant.stockLevel, 0) || editing.stock_level,
      slug: editing.slug || editing.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    };
    const { id, ...rest } = payload;
    const op = id
      ? supabase.from("products").update(rest).eq("id", id)
      : supabase.from("products").insert(rest);
    const { error } = await op;
    if (error) toast.error(error.message);
    else {
      toast.success("Saved");
      setEditing(null);
      reload();
    }
  };

  const del = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Deleted");
      reload();
    }
  };

  const uploadImage = async (file: File) => {
    if (!editing) return;
    setUploading(true);
    const path = `products/${crypto.randomUUID()}.${file.name.split(".").pop() ?? "jpg"}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file);
    if (error) {
      toast.error(error.message);
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    setEditing({
      ...editing,
      images: [...editing.images, data.publicUrl],
      gallery: [
        ...(editing.gallery ?? []),
        { url: data.publicUrl, color: editing.colors[0] ?? "", shot: "Editorial" },
      ],
    });
    setUploading(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-display text-2xl">Products</h2>
        <button
          onClick={() => setEditing({ ...blank })}
          className="bg-foreground text-primary-foreground px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] hover:bg-accent hover:text-accent-foreground transition flex items-center gap-2"
        >
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
                  <button onClick={() => setEditing(p)} className="hover:underline">
                    {p.name}
                  </button>
                </td>
                <td className="p-3 text-muted-foreground">{p.category}</td>
                <td className="p-3">{formatNaira(p.price_ngn)}</td>
                <td className="p-3 text-xs">
                  {!p.is_active && <span className="text-muted-foreground">Hidden · </span>}
                  {p.is_sold_out ? (
                    <span>Sold out</span>
                  ) : (
                    <span className="text-accent">Live</span>
                  )}
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => del(p.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  No products yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setEditing(null)}
        >
          <div
            className="bg-background border border-border max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-2xl mb-6">{editing.id ? "Edit" : "New"} product</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Name"
                value={editing.name}
                onChange={(v) => setEditing({ ...editing, name: v })}
              />
              <Input
                label="Slug (URL)"
                value={editing.slug}
                onChange={(v) => setEditing({ ...editing, slug: v })}
              />
              <label className="block">
                <span className="eyebrow mb-2 block">Category / product type</span>
                <input
                  list="product-categories"
                  value={editing.category}
                  onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                  className="w-full bg-background border border-border px-3 py-2 text-sm"
                />
                <datalist id="product-categories">
                  {[
                    "Plain Tees",
                    "Custom Tees",
                    "Collar Shirts",
                    "Oversized Tees",
                    "Wide-Leg Trousers",
                    "Tailored Trousers",
                    "Cargo / Streetwear Pants",
                    "Zip Jackets",
                    "Cropped Jackets",
                    "Wool / Premium Sets",
                    "Embroidered Native Tops",
                    "Panel Native Tops",
                    "Custom Native Sets",
                    "Jacket + Trouser Sets",
                    "Tee + Trouser Sets",
                    "Caps",
                    "Tote Bags",
                    "Patches",
                  ].map((item) => (
                    <option key={item} value={item} />
                  ))}
                </datalist>
              </label>
              <Input
                label="Price (NGN)"
                type="number"
                value={String(editing.price_ngn)}
                onChange={(v) => setEditing({ ...editing, price_ngn: Number(v) || 0 })}
              />
              <Input
                label="Starting price (optional)"
                type="number"
                value={editing.starting_price_ngn ? String(editing.starting_price_ngn) : ""}
                onChange={(v) =>
                  setEditing({ ...editing, starting_price_ngn: v ? Number(v) : null })
                }
              />
              <Input
                label="SKU (one per style)"
                value={editing.sku ?? ""}
                onChange={(v) => setEditing({ ...editing, sku: v })}
              />
              <Input
                label="Stock level"
                type="number"
                value={String(editing.stock_level ?? 0)}
                onChange={(v) =>
                  setEditing({ ...editing, stock_level: Math.max(0, Number(v) || 0) })
                }
              />
              <div className="sm:col-span-2">
                <Input
                  label="Short description"
                  value={editing.short_description ?? ""}
                  onChange={(v) => setEditing({ ...editing, short_description: v })}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block">
                  <span className="eyebrow mb-2 block">Full description</span>
                  <textarea
                    value={editing.description ?? ""}
                    onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                    rows={4}
                    className="w-full bg-background border border-border px-3 py-2 text-sm"
                  />
                </label>
              </div>
              <Input
                label="Sizes (comma-separated)"
                value={editing.sizes.join(", ")}
                onChange={(v) =>
                  setEditing({
                    ...editing,
                    sizes: v
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
              />
              <Input
                label="Colors (comma-separated)"
                value={editing.colors.join(", ")}
                onChange={(v) =>
                  setEditing({
                    ...editing,
                    colors: v
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
              />
              <Input
                label="Subcategory"
                value={editing.subcategory ?? ""}
                onChange={(v) => setEditing({ ...editing, subcategory: v })}
              />
              <Input
                label="Tags (comma-separated)"
                value={(editing.product_tags ?? []).join(", ")}
                onChange={(v) =>
                  setEditing({
                    ...editing,
                    product_tags: v
                      .split(",")
                      .map((tag) => tag.trim())
                      .filter(Boolean),
                  })
                }
              />
              <Input
                label="Fabric / material"
                value={editing.material ?? ""}
                onChange={(v) => setEditing({ ...editing, material: v })}
              />
              <Input
                label="Fit"
                value={editing.fit ?? ""}
                onChange={(v) => setEditing({ ...editing, fit: v })}
              />
              <Input
                label="Delivery estimate"
                value={editing.delivery_estimate ?? ""}
                onChange={(v) => setEditing({ ...editing, delivery_estimate: v })}
              />
              <div className="sm:col-span-2">
                <Input
                  label="Care instructions"
                  value={editing.care_instructions ?? ""}
                  onChange={(v) => setEditing({ ...editing, care_instructions: v })}
                />
              </div>
              <Input
                label="Sort order"
                type="number"
                value={String(editing.sort_order)}
                onChange={(v) => setEditing({ ...editing, sort_order: Number(v) || 0 })}
              />
              <div className="sm:col-span-2">
                <span className="eyebrow mb-2 block">Colour variants</span>
                <div className="space-y-2">
                  {editing.colors.map((colour) => {
                    const variant = editing.variants?.find(
                      (item) => item.colour.toLowerCase() === colour.toLowerCase(),
                    ) ?? {
                      colour,
                      sku: `${editing.sku || "SKU"}-${colour.slice(0, 3).toUpperCase()}`,
                      stockLevel: 0,
                      priceOverride: null,
                      images: [],
                    };
                    const updateVariant = (next: ProductVariant) =>
                      setEditing({
                        ...editing,
                        variants: [
                          ...(editing.variants ?? []).filter(
                            (item) => item.colour.toLowerCase() !== colour.toLowerCase(),
                          ),
                          next,
                        ],
                      });
                    return (
                      <div
                        key={colour}
                        className="grid gap-2 border border-border p-3 sm:grid-cols-[1fr_1.5fr_1fr_1fr]"
                      >
                        <p className="self-center text-sm font-semibold">{colour}</p>
                        <input
                          aria-label={`${colour} variant SKU`}
                          value={variant.sku}
                          onChange={(e) => updateVariant({ ...variant, sku: e.target.value })}
                          placeholder="Variant SKU"
                          className="border border-border bg-background px-2 py-2 text-xs"
                        />
                        <input
                          aria-label={`${colour} stock`}
                          type="number"
                          min="0"
                          value={variant.stockLevel}
                          onChange={(e) =>
                            updateVariant({
                              ...variant,
                              stockLevel: Math.max(0, Number(e.target.value) || 0),
                            })
                          }
                          placeholder="Stock"
                          className="border border-border bg-background px-2 py-2 text-xs"
                        />
                        <input
                          aria-label={`${colour} price override`}
                          type="number"
                          min="0"
                          value={variant.priceOverride ?? ""}
                          onChange={(e) =>
                            updateVariant({
                              ...variant,
                              priceOverride: e.target.value ? Number(e.target.value) : null,
                            })
                          }
                          placeholder="Price override"
                          className="border border-border bg-background px-2 py-2 text-xs"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="block">
                  <span className="eyebrow mb-2 block">Size guide rows (JSON)</span>
                  <textarea
                    defaultValue={JSON.stringify(editing.size_guide ?? [], null, 2)}
                    onBlur={(e) => {
                      try {
                        setEditing({ ...editing, size_guide: JSON.parse(e.target.value) });
                      } catch {
                        toast.error("Size guide must be valid JSON");
                      }
                    }}
                    rows={6}
                    className="w-full border border-border bg-background px-3 py-2 font-mono text-xs"
                  />
                </label>
                <p className="mt-2 text-xs text-muted-foreground">
                  Bottoms: size, waist, hip, thigh, inseam, length, fitGuide. Tops: size, chest,
                  shoulder, sleeve, length, fitGuide.
                </p>
              </div>
              <div className="sm:col-span-2">
                <span className="eyebrow mb-2 block">Colour gallery</span>
                <p className="mb-3 text-xs leading-5 text-muted-foreground">
                  Keep every colour under this one SKU. Add 5–8 shots per colour: editorial, front,
                  back, flat lay, fabric, detail, size/fit and styling.
                </p>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {(editing.gallery?.length
                    ? editing.gallery
                    : editing.images.map((url, index) => ({
                        url,
                        color: editing.colors[0] ?? "",
                        shot: SHOT_TYPES[index] ?? "Detail",
                      }))
                  ).map((item, i) => (
                    <div key={`${item.url}-${i}`} className="border border-border bg-muted p-2">
                      <div className="relative aspect-square">
                        <img src={item.url} alt="" className="h-full w-full object-cover" />
                        <button
                          onClick={() =>
                            setEditing({
                              ...editing,
                              images: editing.images.filter((url) => url !== item.url),
                              gallery: (editing.gallery ?? []).filter((_, j) => j !== i),
                            })
                          }
                          className="absolute top-1 right-1 bg-background/90 p-1 hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      <select
                        aria-label="Shot type"
                        value={item.shot}
                        onChange={(e) => {
                          const gallery = [
                            ...(editing.gallery?.length
                              ? editing.gallery
                              : editing.images.map((url, index) => ({
                                  url,
                                  color: editing.colors[0] ?? "",
                                  shot: SHOT_TYPES[index] ?? "Detail",
                                }))),
                          ];
                          gallery[i] = { ...gallery[i], shot: e.target.value };
                          setEditing({ ...editing, gallery });
                        }}
                        className="mt-2 w-full border border-border bg-background p-1 text-[0.65rem]"
                      >
                        {SHOT_TYPES.map((shot) => (
                          <option key={shot}>{shot}</option>
                        ))}
                      </select>
                      <input
                        aria-label="Image colour"
                        placeholder="Colour"
                        value={item.color}
                        onChange={(e) => {
                          const gallery = [
                            ...(editing.gallery?.length
                              ? editing.gallery
                              : editing.images.map((url, index) => ({
                                  url,
                                  color: editing.colors[0] ?? "",
                                  shot: SHOT_TYPES[index] ?? "Detail",
                                }))),
                          ];
                          gallery[i] = { ...gallery[i], color: e.target.value };
                          setEditing({ ...editing, gallery });
                        }}
                        className="mt-1 w-full border border-border bg-background p-1 text-[0.65rem]"
                      />
                    </div>
                  ))}
                </div>
                <label className="border border-border border-dashed p-4 flex items-center justify-center gap-2 text-sm cursor-pointer hover:bg-muted/40">
                  <Upload size={14} />
                  {uploading ? "Uploading…" : "Add image"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploading}
                    onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])}
                  />
                </label>
                <p className="text-xs text-muted-foreground mt-2">Or paste URL:</p>
                <div className="flex gap-2 mt-1">
                  <input
                    id="urlinput"
                    placeholder="https://…"
                    className="flex-1 bg-background border border-border px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById("urlinput") as HTMLInputElement;
                      if (el?.value) {
                        setEditing({
                          ...editing,
                          images: [...editing.images, el.value],
                          gallery: [
                            ...(editing.gallery ?? []),
                            { url: el.value, color: editing.colors[0] ?? "", shot: "Editorial" },
                          ],
                        });
                        el.value = "";
                      }
                    }}
                    className="border border-border px-3 text-xs font-bold uppercase tracking-[0.25em]"
                  >
                    Add
                  </button>
                </div>
              </div>
              <div className="sm:col-span-2 grid grid-cols-2 gap-2">
                <Toggle
                  label="Active"
                  value={editing.is_active}
                  onChange={(v) => setEditing({ ...editing, is_active: v })}
                />
                <Toggle
                  label="Sold out"
                  value={editing.is_sold_out}
                  onChange={(v) => setEditing({ ...editing, is_sold_out: v })}
                />
                <Toggle
                  label="New arrival"
                  value={editing.is_new_arrival}
                  onChange={(v) => setEditing({ ...editing, is_new_arrival: v })}
                />
                <Toggle
                  label="Bestseller"
                  value={editing.is_bestseller}
                  onChange={(v) => setEditing({ ...editing, is_bestseller: v })}
                />
                <Toggle
                  label="Customizable"
                  value={editing.is_customizable}
                  onChange={(v) => setEditing({ ...editing, is_customizable: v })}
                />
                <Toggle
                  label="Ready-to-wear"
                  value={editing.is_ready_to_wear ?? true}
                  onChange={(v) => setEditing({ ...editing, is_ready_to_wear: v })}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button
                onClick={save}
                className="flex-1 bg-foreground text-primary-foreground py-3 text-xs font-bold uppercase tracking-[0.25em]"
              >
                Save
              </button>
              <button
                onClick={() => setEditing(null)}
                className="flex-1 border border-border py-3 text-xs font-bold uppercase tracking-[0.25em]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="eyebrow mb-2 block">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-background border border-border px-3 py-2 text-sm"
      />
    </label>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm cursor-pointer">
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-accent"
      />
      <span>{label}</span>
    </label>
  );
}
