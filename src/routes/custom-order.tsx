import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, Upload, ArrowRight, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { submitCustomOrder } from "@/lib/orders.functions";
import { supabase } from "@/integrations/supabase/client";
import { whatsappLink } from "@/lib/site";

export const Route = createFileRoute("/custom-order")({
  head: () => ({
    meta: [
      { title: "Create Your Custom Design — Knot & Nomad" },
      { name: "description", content: "Brief our studio: T-shirts, caps, hoodies and streetwear, custom designed around your story. Submit your idea and we'll reach out on WhatsApp or email." },
      { property: "og:title", content: "Create Your Custom Design — Knot & Nomad" },
      { property: "og:description", content: "Submit your custom apparel idea and we'll bring it to life." },
      { property: "og:image", content: "/og-custom.jpg" },
      { name: "twitter:image", content: "/og-custom.jpg" },
    ],
  }),
  component: CustomOrder,
});

const clothingTypes = ["T-shirt", "Cap", "Hoodie", "Sweatshirt", "Polo", "Other"];
const positions = ["Front", "Back", "Chest", "Sleeve", "Cap front", "Cap side", "Other"];
const sizes = ["XS", "S", "M", "L", "XL", "XXL", "Custom"];
const budgets = [
  "Under ₦100,000",
  "₦100,000–₦300,000",
  "₦300,000–₦700,000",
  "₦700,000–₦1,500,000",
  "₦1,500,000+",
];

function CustomOrder() {
  const submit = useServerFn(submitCustomOrder);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) {
      toast.error("File must be under 10MB");
      return;
    }
    setUploading(true);
    const path = `${crypto.randomUUID()}-${f.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
    const { error } = await supabase.storage.from("design-uploads").upload(path, f);
    if (error) {
      toast.error("Upload failed");
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("design-uploads").getPublicUrl(path);
    setFileUrl(data.publicUrl);
    setUploading(false);
    toast.success("File uploaded");
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const data: Record<string, unknown> = {
      full_name: fd.get("full_name"),
      email: fd.get("email"),
      whatsapp: fd.get("whatsapp"),
      clothing_type: fd.get("clothing_type"),
      preferred_color: fd.get("preferred_color"),
      size: fd.get("size"),
      quantity: fd.get("quantity") ? Number(fd.get("quantity")) : null,
      print_position: fd.get("print_position"),
      print_text: fd.get("print_text"),
      design_description: fd.get("design_description"),
      design_file_url: fileUrl,
      deadline: fd.get("deadline") || null,
      budget: fd.get("budget"),
      ai_idea: fd.get("ai_idea"),
      additional_notes: fd.get("additional_notes"),
    };
    try {
      const res = await submit({ data: data as any });
      if (res.ok) {
        setSubmitted(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        toast.error(res.error || "Submission failed");
      }
    } catch (err: any) {
      toast.error(err?.message || "Please check the form");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <section className="mx-auto max-w-3xl px-6 lg:px-10 py-32 text-center">
        <Sparkles className="mx-auto text-accent" size={40} />
        <h1 className="mt-6 font-display text-5xl">Thank you.</h1>
        <p className="mt-4 text-muted-foreground">
          Our team will review your design idea and contact you shortly via WhatsApp or email
          to discuss the design, specifications, pricing and production details.
        </p>
        <div className="mt-10 flex flex-wrap gap-3 justify-center">
          <a href={whatsappLink()} target="_blank" rel="noopener noreferrer"
             className="btn-pill inline-flex items-center gap-2 bg-foreground text-primary-foreground px-7 py-4 text-xs font-bold uppercase tracking-[0.25em] hover:bg-accent hover:text-accent-foreground transition">
            <MessageCircle size={16}/> Continue on WhatsApp
          </a>
          <a href="/" className="btn-pill inline-flex items-center gap-2 border-2 border-foreground px-7 py-4 text-xs font-bold uppercase tracking-[0.25em] hover:bg-foreground hover:text-primary-foreground transition">
            Back home
          </a>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="mx-auto max-w-7xl px-6 lg:px-10 pt-24 lg:pt-32 pb-12">
        <div className="eyebrow">Custom order</div>
        <h1 className="mt-4 font-display text-5xl lg:text-7xl leading-[1.05] max-w-4xl">
          Create your <span className="text-accent">custom</span> design.
        </h1>
        <p className="mt-6 max-w-2xl text-muted-foreground">
          Tell us what you want to make. The more detail, the better — we'll follow up on
          WhatsApp or email to confirm the design, materials, pricing and timeline.
        </p>
      </section>

      <section className="mx-auto max-w-5xl px-6 lg:px-10 pb-12">
        <div className="border border-accent/40 bg-accent/5 p-6 lg:p-8 flex gap-4">
          <Sparkles className="shrink-0 text-accent mt-1" size={22}/>
          <div>
            <div className="eyebrow">AI design assistant</div>
            <h2 className="mt-2 font-display text-2xl">Describe your dream apparel.</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              In plain words — colours, materials, vibe, references. Example:
              <span className="italic"> "Black oversized tee, gold embroidered logo on the chest, bold quote on the back in serif type."</span>
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 lg:px-10 pb-32">
        <form onSubmit={onSubmit} className="space-y-10">
          <Field label="Describe your idea (AI assist)" name="ai_idea" textarea placeholder="e.g. Black oversized tee, gold logo at the front, bold quote at the back…" rows={4}/>

          <Group title="Your details">
            <div className="grid md:grid-cols-2 gap-6">
              <Field label="Full name" name="full_name" required />
              <Field label="Email address" name="email" type="email" required />
              <Field label="WhatsApp number" name="whatsapp" required placeholder="+234 800 000 0000"/>
            </div>
          </Group>

          <Group title="The garment">
            <div className="grid md:grid-cols-2 gap-6">
              <Select label="Clothing type" name="clothing_type" required options={clothingTypes}/>
              <Field label="Preferred colour" name="preferred_color" placeholder="e.g. Cream, charcoal"/>
              <Select label="Size" name="size" options={sizes}/>
              <Field label="Quantity" name="quantity" type="number" placeholder="1"/>
            </div>
          </Group>

          <Group title="Print & design">
            <div className="grid md:grid-cols-2 gap-6">
              <Select label="Print position" name="print_position" options={positions}/>
              <Field label="Text or slogan to print" name="print_text"/>
            </div>
            <Field label="Design description / instructions" name="design_description" textarea rows={4}
                   placeholder="Style, references, fonts, mood, anything we should know…"/>
            <div>
              <label className="eyebrow">Upload logo or design file</label>
              <label className="mt-3 flex items-center gap-3 border border-dashed border-border p-4 cursor-pointer hover:border-accent transition">
                <Upload size={18} className="text-muted-foreground"/>
                <span className="text-sm text-muted-foreground">
                  {uploading ? "Uploading…" : fileUrl ? "File uploaded — replace?" : "Click to upload (PNG, JPG, PDF, AI — up to 10MB)"}
                </span>
                <input type="file" className="hidden" onChange={handleFile}
                       accept="image/*,application/pdf,.ai,.psd"/>
              </label>
            </div>
          </Group>

          <Group title="Logistics">
            <div className="grid md:grid-cols-2 gap-6">
              <Field label="Preferred deadline" name="deadline" type="date"/>
              <Select label="Budget range" name="budget" options={budgets}/>
            </div>
            <Field label="Additional notes" name="additional_notes" textarea rows={3}/>
          </Group>

          <button disabled={loading || uploading}
                  className="btn-pill group inline-flex items-center gap-2 bg-foreground text-primary-foreground px-9 py-5 text-xs font-bold uppercase tracking-[0.3em] hover:bg-accent hover:text-accent-foreground transition disabled:opacity-60">
            {loading ? "Submitting…" : "Submit custom request"} <ArrowRight size={16} className="group-hover:translate-x-1 transition"/>
          </button>
          <p className="text-xs text-muted-foreground">By submitting, you agree to be contacted by our studio via WhatsApp or email.</p>
        </form>
      </section>
    </>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-border pt-8 space-y-6">
      <div className="eyebrow">{title}</div>
      {children}
    </div>
  );
}

function Field({ label, name, type = "text", required, placeholder, textarea, rows }: any) {
  return (
    <div>
      <label htmlFor={name} className="eyebrow">{label}{required && <span className="text-accent ml-1">*</span>}</label>
      {textarea ? (
        <textarea id={name} name={name} required={required} rows={rows || 3} placeholder={placeholder}
                  className="mt-3 w-full bg-card border border-border px-4 py-3 text-sm focus:outline-none focus:border-accent transition"/>
      ) : (
        <input id={name} name={name} type={type} required={required} placeholder={placeholder}
               className="mt-3 w-full bg-card border border-border px-4 py-3 text-sm focus:outline-none focus:border-accent transition"/>
      )}
    </div>
  );
}

function Select({ label, name, required, options }: any) {
  return (
    <div>
      <label htmlFor={name} className="eyebrow">{label}{required && <span className="text-accent ml-1">*</span>}</label>
      <select id={name} name={name} required={required}
              className="mt-3 w-full bg-card border border-border px-4 py-3 text-sm focus:outline-none focus:border-accent transition">
        <option value="">Select…</option>
        {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
