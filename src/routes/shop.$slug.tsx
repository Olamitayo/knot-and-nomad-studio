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

export const Route = createFileRoute("/shop/$slug")({
  component: ProductDetail,
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
  is_sold_out: boolean;
  is_customizable: boolean;
  gallery?: GalleryItem[];
  sku: string | null;
  stock_level: number;
  material: string | null;
  fit: string | null;
  care_instructions: string | null;
  delivery_estimate: string | null;
}

interface GalleryItem { url: string; color: string; shot: string }
const SHOT_TYPES = ["Editorial", "Front", "Back", "Flat lay", "Fabric close-up", "Detail", "Size chart", "Styling reference"];

function ProductDetail() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
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
      .then(({ data }) => {
        setProduct(data as Product | null);
        if (data) {
          setSize((data as Product).sizes[0] ?? "");
          setColor((data as Product).colors[0] ?? "");
        }
        setLoading(false);
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

  const fullGallery: GalleryItem[] = product.gallery?.length
    ? product.gallery
    : product.images.map((url, index) => ({ url, color: "", shot: SHOT_TYPES[index] ?? `Image ${index + 1}` }));
  const colorGallery = fullGallery.filter((item) => !item.color || !color || item.color.toLowerCase() === color.toLowerCase());
  const visibleGallery = colorGallery.length ? colorGallery : fullGallery;
  const selectedItem = visibleGallery[imgIdx] ?? visibleGallery[0];
  const selectedImage = selectedItem?.url;

  const onAdd = async () => {
    if (product.is_sold_out || product.stock_level === 0) return;
    if (qty > product.stock_level) return toast.error(`Only ${product.stock_level} left in stock`);
    if (product.sizes.length && !size) return toast.error("Choose a size");
    if (product.colors.length && !color) return toast.error("Choose a color");

    let designUrl: string | undefined;
    if (customize && customFile) {
      try {
        setUploading(true);
        const ext = customFile.name.split(".").pop() ?? "png";
        const path = `custom/${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage
          .from("payment-receipts")
          .upload(path, customFile);
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
      unitPrice: product.price_ngn,
      size: size || undefined,
      color: color || undefined,
      quantity: qty,
      customizationNotes: customize ? customNotes || undefined : undefined,
      customDesignUrl: designUrl,
    });
    toast.success(`${product.name} added to cart`);
  };

  const onWhatsApp = () => {
    const msg = `Hi, I have a question about: ${product.name} (${product.slug})`;
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
              <img src={selectedImage} alt={product.name} className="aspect-[4/5] h-full w-full object-cover" />
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
          {selectedItem && <div className="mt-3 flex items-center justify-between gap-4 text-xs text-muted-foreground"><span>{selectedItem.shot}</span>{selectedItem.color && <span>{selectedItem.color}</span>}</div>}
        </div>

        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="eyebrow">{product.category}</p>
            {product.sku && <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">SKU {product.sku}</p>}
          </div>
          <div className="flex flex-wrap items-start justify-between gap-5">
            <h1 className="font-display text-5xl leading-[1.02] lg:text-6xl">{product.name}</h1>
            <p className="border border-border bg-card px-4 py-3 text-lg font-semibold">
              {formatNaira(product.price_ngn)}
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
            <span className={`inline-flex items-center gap-2 ${product.stock_level > 0 && !product.is_sold_out ? "text-accent" : "text-destructive"}`}>
              <span className="h-2 w-2 rounded-full bg-current" />
              {product.is_sold_out || product.stock_level === 0 ? "Out of stock" : product.stock_level <= 5 ? `Only ${product.stock_level} left` : "In stock"}
            </span>
            {product.delivery_estimate && <span className="text-muted-foreground">Delivery: {product.delivery_estimate}</span>}
          </div>

          <div className="my-8 grid grid-cols-2 gap-px bg-border text-sm sm:grid-cols-4">
            <TrustItem icon={<ShieldCheck size={16} />} label="Quality finish" />
            <TrustItem icon={<Truck size={16} />} label="Nigeria delivery" />
            <TrustItem icon={<Ruler size={16} />} label="Size options" />
            <TrustItem icon={<Wand2 size={16} />} label="Custom-ready" muted={!product.is_customizable} />
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
                    onClick={() => { setColor(item); setImgIdx(0); }}
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
                onClick={() => setQty((q) => Math.min(product.stock_level || 1, q + 1))}
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
              disabled={product.is_sold_out || product.stock_level === 0 || uploading}
              className="inline-flex min-h-14 items-center justify-center gap-2 bg-foreground px-6 text-xs font-bold uppercase tracking-[0.22em] text-primary-foreground transition hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
            >
              <ShoppingBag size={15} />
              {product.is_sold_out || product.stock_level === 0 ? "Sold out" : uploading ? "Uploading..." : "Add to cart"}
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
            <ProductInfo label="Fabric / material" value={product.material} fallback="Contact the studio for fabric details." />
            <ProductInfo label="Fit" value={product.fit} fallback="See the size guide or ask us for fit advice." />
            <ProductInfo label="Care" value={product.care_instructions} fallback="Gentle care recommended. Ask the studio for garment-specific guidance." />
            <ProductInfo label="Delivery" value={product.delivery_estimate} fallback="Delivery timing is confirmed at checkout." />
          </div>

          <button
            onClick={() => navigate({ to: "/cart" })}
            className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground transition hover:text-foreground"
          >
            View cart
            <ArrowRight size={14} />
          </button>
        </div>
      </section>
    </div>
  );
}

function ProductInfo({ label, value, fallback }: { label: string; value: string | null; fallback: string }) {
  return <div className="grid gap-2 border-b border-border py-5 sm:grid-cols-[10rem_1fr]"><p className="eyebrow">{label}</p><p className="text-sm leading-6 text-muted-foreground">{value || fallback}</p></div>;
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
