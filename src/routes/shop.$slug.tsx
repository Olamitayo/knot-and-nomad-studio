import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  MessageCircle,
  Minus,
  Palette,
  Plus,
  Ruler,
  ShieldCheck,
  ShoppingBag,
  Truck,
  Upload,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { formatNaira } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { whatsappLink } from "@/lib/site";
import {
  displayPrice,
  fallbackProducts,
  productGroup,
  type GalleryItem,
  type StoreProduct,
} from "@/lib/products";

export const Route = createFileRoute("/shop/$slug")({
  component: ProductDetail,
});

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

function ProductDetail() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<StoreProduct | null>(null);
  const [related, setRelated] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);
  const [size, setSize] = useState<string>("");
  const [color, setColor] = useState<string>("");
  const [qty, setQty] = useState(1);
  const [customize, setCustomize] = useState(false);
  const [customNotes, setCustomNotes] = useState("");
  const [customFile, setCustomFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const add = useCart((s) => s.add);

  useEffect(() => {
    supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .maybeSingle()
      .then(({ data, error }) => {
        const resolved =
          !error && data
            ? (data as StoreProduct)
            : (fallbackProducts.find((item) => item.slug === slug) ?? null);
        setProduct(resolved);
        if (resolved) {
          setSize(resolved.sizes[0] ?? "");
          setColor(resolved.colors[0] ?? "");
        }
        setLoading(false);
      });
    supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .limit(12)
      .then(({ data }) => {
        if (data)
          setRelated((data as StoreProduct[]).filter((item) => item.slug !== slug).slice(0, 4));
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-20 text-muted-foreground lg:px-10">
        Loading piece...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-24 text-center lg:px-10">
        <h1 className="font-display text-4xl">Piece not found</h1>
        <Link
          to="/shop"
          className="btn-pill mt-6 inline-flex items-center gap-2 border-2 border-foreground px-5 py-3 text-xs font-bold uppercase tracking-[0.22em] transition hover:bg-foreground hover:text-primary-foreground"
        >
          <ArrowLeft size={14} />
          Back to shop
        </Link>
      </div>
    );
  }

  const selectedVariant = product.variants?.find(
    (variant) => variant.colour.toLowerCase() === color.toLowerCase(),
  );
  const variantGallery: GalleryItem[] =
    selectedVariant?.images?.map((item) => ({ ...item, color })) ?? [];
  const fullGallery: GalleryItem[] = variantGallery.length
    ? variantGallery
    : product.gallery?.length
      ? product.gallery
      : product.images.map((url, index) => ({
          url,
          color: "",
          shot: SHOT_TYPES[index] ?? `Image ${index + 1}`,
        }));
  const colorGallery = fullGallery.filter(
    (item) => !item.color || !color || item.color.toLowerCase() === color.toLowerCase(),
  );
  const visibleGallery = colorGallery.length ? colorGallery : fullGallery;
  const selectedItem = visibleGallery[imgIdx] ?? visibleGallery[0];
  const selectedImage = selectedItem?.url;
  const currentPrice = displayPrice(product, color);
  const availableStock = selectedVariant ? selectedVariant.stockLevel : product.stock_level;

  const onAdd = async () => {
    if (product.isFallback)
      return toast.info("Please use WhatsApp to confirm this studio reference piece.");
    if (product.is_sold_out || availableStock === 0) return;
    if (qty > availableStock) return toast.error(`Only ${availableStock} left in stock`);
    if (product.sizes.length && !size) return toast.error("Choose a size");
    if (product.colors.length && !color) return toast.error("Choose a color");

    let designUrl: string | undefined;
    if (customize && customFile) {
      try {
        setUploading(true);
        const ext = customFile.name.split(".").pop() ?? "png";
        const path = `custom/${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage.from("payment-receipts").upload(path, customFile);
        if (error) throw error;
        const { data } = supabase.storage.from("payment-receipts").getPublicUrl(path);
        designUrl = data.publicUrl;
      } catch {
        toast.error("Could not upload your design");
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    add({
      productId: product.id,
      name: product.name,
      image: selectedImage ?? product.images[0] ?? "",
      unitPrice: currentPrice,
      size: size || undefined,
      color: color || undefined,
      quantity: qty,
      customizationNotes: customize ? customNotes || undefined : undefined,
      customDesignUrl: designUrl,
    });
    toast.success(`${product.name} added to cart`);
  };

  const onWhatsApp = () => {
    const msg = `Hi, I have a question about: ${product.name} (${product.sku || product.slug})${color ? ` in ${color}` : ""}`;
    window.open(whatsappLink(msg), "_blank");
  };

  return (
    <div className="bg-background">
      <section className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-5 lg:px-10">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft size={14} />
            Back to shop
          </Link>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">
            Priced in Nigerian Naira
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(25rem,0.92fr)] lg:px-10 lg:py-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className="overflow-hidden border border-border bg-muted">
            {selectedImage ? (
              <img
                src={selectedImage}
                alt={product.name}
                className="aspect-[4/5] h-full w-full object-cover"
              />
            ) : (
              <div className="flex aspect-[4/5] items-center justify-center bg-[linear-gradient(135deg,var(--muted),var(--card))] px-6 text-center">
                <span className="text-xs font-bold uppercase tracking-[0.24em] text-muted-foreground">
                  Image coming soon
                </span>
              </div>
            )}
          </div>

          {visibleGallery.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-5">
              {visibleGallery.map((item, i) => (
                <button
                  key={`${item.url}-${i}`}
                  onClick={() => setImgIdx(i)}
                  className={`aspect-square overflow-hidden border transition ${
                    imgIdx === i ? "border-foreground" : "border-border hover:border-foreground"
                  }`}
                  aria-label={`View ${item.color ? `${item.color} ` : ""}${item.shot}`}
                >
                  <img src={item.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
          {selectedItem && (
            <div className="mt-3 flex items-center justify-between gap-4 text-xs text-muted-foreground">
              <span>{selectedItem.shot}</span>
              {selectedItem.color && <span>{selectedItem.color}</span>}
            </div>
          )}
        </div>

        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="eyebrow">{product.category}</p>
            {product.sku && (
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                SKU {product.sku}
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-start justify-between gap-5">
            <h1 className="font-display text-5xl leading-[1.02] lg:text-6xl">{product.name}</h1>
            <p className="border border-border bg-card px-4 py-3 text-lg font-semibold">
              {formatNaira(currentPrice)}
            </p>
          </div>

          {product.short_description && (
            <p className="mt-7 max-w-2xl text-base leading-8 text-muted-foreground">
              {product.short_description}
            </p>
          )}
          {product.description && (
            <p className="mt-4 max-w-2xl whitespace-pre-line text-sm leading-7 text-muted-foreground">
              {product.description}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-[0.16em]">
            <span
              className={`inline-flex items-center gap-2 ${product.stock_level > 0 && !product.is_sold_out ? "text-accent" : "text-destructive"}`}
            >
              <span className="h-2 w-2 rounded-full bg-current" />
              {product.isFallback
                ? "Confirm availability"
                : product.is_sold_out || availableStock === 0
                  ? "Out of stock"
                  : availableStock <= 5
                    ? `Only ${availableStock} left`
                    : "In stock"}
            </span>
            {product.delivery_estimate && (
              <span className="text-muted-foreground">Delivery: {product.delivery_estimate}</span>
            )}
          </div>

          <div className="my-8 grid grid-cols-2 gap-px bg-border text-sm sm:grid-cols-4">
            <TrustItem icon={<ShieldCheck size={16} />} label="Quality finish" />
            <TrustItem icon={<Truck size={16} />} label="Nigeria delivery" />
            <TrustItem icon={<Ruler size={16} />} label="Size options" />
            <TrustItem
              icon={<Wand2 size={16} />}
              label="Custom-ready"
              muted={!product.is_customizable}
            />
          </div>

          {product.sizes.length > 0 && (
            <div className="mb-7">
              <div className="mb-3 flex items-center gap-2">
                <Ruler size={16} className="text-muted-foreground" />
                <p className="eyebrow">Size</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((item) => (
                  <button
                    key={item}
                    onClick={() => setSize(item)}
                    className={`min-h-11 min-w-12 border px-4 text-sm transition ${
                      size === item
                        ? "border-foreground bg-foreground text-primary-foreground"
                        : "border-border bg-card hover:border-foreground"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.colors.length > 0 && (
            <div className="mb-7">
              <div className="mb-3 flex items-center gap-2">
                <Palette size={16} className="text-muted-foreground" />
                <p className="eyebrow">Color</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      setColor(item);
                      setImgIdx(0);
                    }}
                    className={`inline-flex min-h-11 items-center gap-2 border px-4 text-sm transition ${
                      color === item
                        ? "border-foreground bg-foreground text-primary-foreground"
                        : "border-border bg-card hover:border-foreground"
                    }`}
                  >
                    <ColorDot color={item} />
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-7">
            <p className="eyebrow mb-3">Quantity</p>
            <div className="inline-flex h-12 items-center border border-border bg-card">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="flex h-full w-11 items-center justify-center transition hover:bg-muted"
                aria-label="Decrease quantity"
              >
                <Minus size={14} />
              </button>
              <span className="min-w-12 text-center text-sm">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(availableStock || 1, q + 1))}
                className="flex h-full w-11 items-center justify-center transition hover:bg-muted"
                aria-label="Increase quantity"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {product.is_customizable && (
            <div className="mb-8 border border-border bg-card p-5">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={customize}
                  onChange={(e) => setCustomize(e.target.checked)}
                  className="accent-accent"
                />
                <span className="font-medium">Customise this piece</span>
              </label>
              {customize && (
                <div className="mt-4 space-y-3">
                  <textarea
                    value={customNotes}
                    onChange={(e) => setCustomNotes(e.target.value)}
                    placeholder="Describe placement, text, colours, references..."
                    className="min-h-[96px] w-full border border-border bg-background p-3 text-sm outline-none transition focus:border-foreground"
                    maxLength={1000}
                  />
                  <label className="flex cursor-pointer items-center gap-2 border border-dashed border-border p-3 text-sm text-muted-foreground transition hover:border-foreground hover:text-foreground">
                    <Upload size={14} />
                    <span>{customFile ? customFile.name : "Upload design or logo"}</span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setCustomFile(e.target.files?.[0] ?? null)}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              onClick={onAdd}
              disabled={
                product.isFallback || product.is_sold_out || availableStock === 0 || uploading
              }
              className="inline-flex min-h-14 items-center justify-center gap-2 bg-foreground px-6 text-xs font-bold uppercase tracking-[0.22em] text-primary-foreground transition hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
            >
              <ShoppingBag size={15} />
              {product.isFallback
                ? "Confirm availability"
                : product.is_sold_out || availableStock === 0
                  ? "Sold out"
                  : uploading
                    ? "Uploading..."
                    : "Add to cart"}
            </button>
            <button
              onClick={onWhatsApp}
              className="btn-pill inline-flex min-h-14 items-center justify-center gap-2 border-2 border-foreground px-6 text-xs font-bold uppercase tracking-[0.22em] transition hover:bg-foreground hover:text-primary-foreground"
            >
              <MessageCircle size={15} />
              WhatsApp inquiry
            </button>
          </div>

          <Link
            to="/custom-order"
            className="mt-3 inline-flex min-h-14 w-full items-center justify-center gap-2 border border-border bg-card px-6 text-xs font-bold uppercase tracking-[0.22em] transition hover:border-accent hover:text-accent"
          >
            <Wand2 size={15} /> Request customisation
          </Link>

          <div className="mt-10 border-t border-border">
            <ProductInfo
              label="Fabric / material"
              value={product.material}
              fallback="Contact the studio for fabric details."
            />
            <ProductInfo
              label="Fit"
              value={product.fit}
              fallback="See the size guide or ask us for fit advice."
            />
            <ProductInfo
              label="Care"
              value={product.care_instructions}
              fallback="Gentle care recommended. Ask the studio for garment-specific guidance."
            />
            <ProductInfo
              label="Delivery"
              value={product.delivery_estimate}
              fallback="Delivery timing is confirmed at checkout."
            />
          </div>

          <SizeGuide product={product} />

          <button
            onClick={() => navigate({ to: "/cart" })}
            className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground transition hover:text-foreground"
          >
            View cart
            <ArrowRight size={14} />
          </button>
        </div>
      </section>
      {related.length > 0 && (
        <section className="mx-auto max-w-7xl border-t border-border px-6 py-20 lg:px-10">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Complete the edit</p>
              <h2 className="mt-2 font-display text-4xl">Related pieces.</h2>
            </div>
            <Link to="/shop" className="text-xs font-bold uppercase tracking-[0.18em]">
              Shop all
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {related.map((item) => (
              <Link key={item.id} to="/shop/$slug" params={{ slug: item.slug }} className="group">
                <div className="aspect-[4/5] overflow-hidden bg-muted">
                  {item.images[0] && (
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                  )}
                </div>
                <p className="mt-3 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  {productGroup(item)}
                </p>
                <h3 className="mt-1 font-display text-lg">{item.name}</h3>
                <p className="mt-1 text-sm">{formatNaira(displayPrice(item))}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function SizeGuide({ product }: { product: StoreProduct }) {
  const group = productGroup(product);
  const columns =
    group === "Bottoms" || group === "Sets"
      ? [
          ["size", "Size"],
          ["waist", "Waist"],
          ["hip", "Hip"],
          ["thigh", "Thigh"],
          ["inseam", "Inseam"],
          ["length", "Length"],
          ["fitGuide", "Fit guide"],
        ]
      : group === "Native Wear"
        ? [
            ["chest", "Chest"],
            ["shoulder", "Shoulder"],
            ["sleeve", "Sleeve"],
            ["topLength", "Top length"],
            ["trouserWaist", "Trouser waist"],
            ["trouserLength", "Trouser length"],
            ["neck", "Neck / cap"],
          ]
        : [
            ["size", "Size"],
            ["chest", "Chest"],
            ["shoulder", "Shoulder"],
            ["sleeve", "Sleeve"],
            ["length", "Length"],
            ["fitGuide", "Fit guide"],
          ];
  const rows = product.size_guide ?? [];

  return (
    <section className="mt-10" id="size-guide">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Fit support</p>
          <h2 className="mt-2 font-display text-2xl">{group} size guide</h2>
        </div>
        <Link to="/size-guide" className="text-xs font-bold uppercase tracking-[0.16em]">
          Measurement help
        </Link>
      </div>
      {rows.length ? (
        <div className="mt-5 overflow-x-auto border border-border">
          <table className="min-w-full text-left text-xs">
            <thead className="bg-muted">
              <tr>
                {columns.map(([key, label]) => (
                  <th
                    key={key}
                    className="whitespace-nowrap px-4 py-3 font-bold uppercase tracking-[0.12em]"
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index} className="border-t border-border">
                  {columns.map(([key]) => (
                    <td key={key} className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {row[key] || "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-5 border border-border bg-card p-5 text-sm leading-6 text-muted-foreground">
          Product-specific measurements are being prepared. Send your measurements on WhatsApp for
          fit advice before ordering.
        </div>
      )}
    </section>
  );
}

function ProductInfo({
  label,
  value,
  fallback,
}: {
  label: string;
  value?: string | null;
  fallback: string;
}) {
  return (
    <div className="grid gap-2 border-b border-border py-5 sm:grid-cols-[10rem_1fr]">
      <p className="eyebrow">{label}</p>
      <p className="text-sm leading-6 text-muted-foreground">{value || fallback}</p>
    </div>
  );
}

function TrustItem({
  icon,
  label,
  muted,
}: {
  icon: React.ReactNode;
  label: string;
  muted?: boolean;
}) {
  return (
    <div
      className={`flex min-h-24 flex-col justify-between bg-card p-4 ${
        muted ? "text-muted-foreground" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        {icon}
        {!muted && <CheckCircle2 size={14} className="text-accent" />}
      </div>
      <span className="text-xs font-bold uppercase tracking-[0.18em]">{label}</span>
    </div>
  );
}

function ColorDot({ color }: { color: string }) {
  return (
    <span
      className="h-3.5 w-3.5 shrink-0 rounded-full border border-border"
      style={{ background: colorValue(color) }}
      aria-hidden="true"
    />
  );
}

function colorValue(color: string) {
  const map: Record<string, string> = {
    Black: "#111111",
    White: "#ffffff",
    Cream: "#f4efe4",
    Charcoal: "#2d2d2d",
    Sand: "#c8bca7",
    Olive: "#626c45",
    Navy: "#18253f",
    Gold: "#c59a43",
  };

  return map[color] ?? color.toLowerCase();
}
