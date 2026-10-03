import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
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
      {
        name: "description",
        content:
          "Brief our studio: T-shirts, caps, hoodies and streetwear, custom designed around your story. Submit your idea and we'll reach out on WhatsApp or email.",
      },
      { property: "og:title", content: "Create Your Custom Design — Knot & Nomad" },
      {
        property: "og:description",
        content: "Submit your custom apparel idea and we'll bring it to life.",
      },
      { property: "og:image", content: "https://knotnomad.com/og-knotnomad.png" },
      { name: "twitter:image", content: "https://knotnomad.com/og-knotnomad.png" },
    ],
  }),
  component: CustomOrder,
});

const clothingTypes = [
  "T-shirt",
  "Polo or collar shirt",
  "Hoodie or sweatshirt",
  "Trousers",
  "Jacket",
  "Native wear",
  "Set",
  "Cap or accessory",
  "Brand uniform",
  "Capsule drop",
  "Other",
];
const positions = ["Front", "Back", "Chest", "Sleeve", "Cap front", "Cap side", "Other"];
const sizes = ["XS", "S", "M", "L", "XL", "XXL", "Custom"];
const budgets = [
  "Under ₦100,000",
  "₦100,000–₦300,000",
  "₦300,000–₦700,000",
  "₦700,000–₦1,500,000",
  "₦1,500,000+",
];
const orderSteps = ["Garment", "Design & references", "Quantity & timing", "Your details"];

function CustomOrder() {
  const submit = useServerFn(submitCustomOrder);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [formError, setFormError] = useState("");
  const [briefSummary, setBriefSummary] = useState<string[]>([]);
  const formRef = useRef<HTMLFormElement>(null);

  function refreshBriefSummary() {
    const form = formRef.current;
    if (!form) return;
    const values = new FormData(form);
    const value = (name: string) => String(values.get(name) ?? "").trim();
    setBriefSummary(
      [
        `Garment: ${value("clothing_type")}`,
        value("preferred_color") && `Colour: ${value("preferred_color")}`,
        value("size") && `Size: ${value("size")}`,
        value("ai_idea") && `Idea: ${value("ai_idea")}`,
        value("design_description") && `Design notes: ${value("design_description")}`,
        value("print_position") && `Placement: ${value("print_position")}`,
        value("print_text") && `Text: ${value("print_text")}`,
        value("quantity") && `Quantity: ${value("quantity")}`,
        value("budget") && `Budget: ${value("budget")}`,
        value("deadline") && `Preferred deadline: ${value("deadline")}`,
        fileUrl && "Design reference attached",
        value("full_name") && `Name: ${value("full_name")}`,
        value("email") && `Email: ${value("email")}`,
        value("whatsapp") && `WhatsApp: ${value("whatsapp")}`,
      ].filter((item): item is string => Boolean(item)),
    );
  }

  function validateStage(stage: number) {
    const fields = Array.from(
      formRef.current?.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
        `[data-order-stage="${stage}"] input, [data-order-stage="${stage}"] select, [data-order-stage="${stage}"] textarea`,
      ) ?? [],
    );
    const invalid = fields.find((field) => !field.checkValidity());
    if (invalid) {
      invalid.focus();
      invalid.reportValidity();
      return false;
    }
    return true;
  }

  function goToStage(next: number) {
    if (next === 3) refreshBriefSummary();
    setFormError("");
    setStep(Math.max(0, Math.min(orderSteps.length - 1, next)));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) {
      toast.error("File must be under 10MB");
      return;
    }
    setUploading(true);
    const path = `${crypto.randomUUID()}-${f.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
    try {
      const { error } = await supabase.storage.from("design-uploads").upload(path, f);
      if (error) throw error;
      const { data } = supabase.storage.from("design-uploads").getPublicUrl(path);
      setFileUrl(data.publicUrl);
      toast.success("File uploaded");
    } catch {
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = formRef.current;
    if (!form) return;
    const invalid = Array.from(
      form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
        "input, select, textarea",
      ),
    ).find((field) => !field.checkValidity());
    if (invalid) {
      const stageNode = invalid.closest<HTMLElement>("[data-order-stage]");
      const invalidStage = Number(stageNode?.dataset.orderStage ?? step);
      setFormError("Please complete the required fields before sending your brief.");
      setStep(invalidStage);
      requestAnimationFrame(() => {
        invalid.focus();
        invalid.reportValidity();
      });
      return;
    }
    setLoading(true);
    const fd = new FormData(form);
    const text = (name: string) => {
      const value = fd.get(name);
      return typeof value === "string" ? value : "";
    };
    const rawQuantity = text("quantity");
    const data = {
      full_name: text("full_name"),
      email: text("email"),
      whatsapp: text("whatsapp"),
      clothing_type: text("clothing_type"),
      preferred_color: text("preferred_color") || null,
      size: text("size") || null,
      quantity: rawQuantity ? Number(rawQuantity) : null,
      print_position: text("print_position") || null,
      print_text: text("print_text") || null,
      design_description: text("design_description") || null,
      design_file_url: fileUrl,
      deadline: text("deadline") || null,
      budget: text("budget") || null,
      ai_idea: text("ai_idea") || null,
      additional_notes: text("additional_notes") || null,
    };
    try {
      const res = await submit({ data });
      if (res.ok) {
        setSubmitted(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setFormError(res.error || "Submission failed. Please try again.");
        toast.error(res.error || "Submission failed");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Please check the form";
      setFormError(message);
      toast.error(message);
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
          Our team will review your design idea and contact you shortly via WhatsApp or email to
          discuss the design, specifications, pricing and production details.
        </p>
        <div className="mt-10 flex flex-wrap gap-3 justify-center">
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-pill inline-flex items-center gap-2 bg-foreground text-primary-foreground px-7 py-4 text-xs font-bold uppercase tracking-[0.25em] hover:bg-accent hover:text-accent-foreground transition"
          >
            <MessageCircle size={16} /> Continue on WhatsApp
          </a>
          <a
            href="/"
            className="btn-pill inline-flex items-center gap-2 border-2 border-foreground px-7 py-4 text-xs font-bold uppercase tracking-[0.25em] hover:bg-foreground hover:text-primary-foreground transition"
          >
            Back home
          </a>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="mx-auto max-w-7xl px-6 pb-7 pt-12 lg:px-10 lg:pt-16">
        <div className="eyebrow">Custom order</div>
        <h1 className="mt-4 max-w-4xl font-display text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">
          Create your <span className="text-accent">custom</span> design.
        </h1>
        <p className="mt-5 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
          Tell us what you have in mind. We’ll review the brief and confirm the specification, quote
          and timeline before you approve anything.
        </p>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-24 lg:px-10">
        <form
          ref={formRef}
          onChange={refreshBriefSummary}
          onSubmit={onSubmit}
          noValidate
          className="border border-border bg-card p-5 sm:p-8 lg:p-10"
        >
          <ol
            aria-label="Custom order progress"
            className="grid grid-cols-4 border-b border-border pb-5"
          >
            {orderSteps.map((label, index) => (
              <li key={label}>
                <button
                  type="button"
                  onClick={() => index < step && goToStage(index)}
                  disabled={index >= step}
                  aria-current={index === step ? "step" : undefined}
                  className={`flex min-h-12 w-full flex-col gap-1 border-b-2 px-1 pb-2 text-left text-[9px] font-bold uppercase tracking-[0.09em] transition sm:px-3 sm:text-[10px] sm:tracking-[0.14em] ${index === step ? "border-accent text-foreground" : index < step ? "border-border text-muted-foreground" : "border-transparent text-muted-foreground/60"}`}
                >
                  <span>0{index + 1}</span>
                  <span>{label}</span>
                </button>
              </li>
            ))}
          </ol>
          <p className="sr-only" aria-live="polite">
            Step {step + 1} of {orderSteps.length}: {orderSteps[step]}
          </p>
          {formError && (
            <p
              className="mt-6 border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive"
              role="alert"
            >
              {formError}
            </p>
          )}

          <Group title="Choose your garment" stage={0} active={step === 0}>
            <div className="grid gap-6 sm:grid-cols-2">
              <Select label="Clothing type" name="clothing_type" required options={clothingTypes} />
              <Field
                label="Preferred colour"
                name="preferred_color"
                placeholder="e.g. Cream, charcoal"
              />
              <Select label="Size" name="size" options={sizes} />
            </div>
          </Group>

          <Group title="Design and references" stage={1} active={step === 1}>
            <Field
              label="What are you imagining?"
              name="ai_idea"
              textarea
              rows={3}
              placeholder="Describe the idea in your own words — shape, colour, fabric, mood or use."
            />
            <div className="grid gap-6 sm:grid-cols-2">
              <Select
                label="Print or embroidery position"
                name="print_position"
                options={positions}
              />
              <Field label="Text or slogan to print" name="print_text" />
            </div>
            <Field
              label="Design details or instructions"
              name="design_description"
              textarea
              rows={4}
              placeholder="Include placement, references, fonts or anything else the studio should know."
            />
            <div>
              <p className="eyebrow">Upload a logo or reference (optional)</p>
              <label
                htmlFor="design-file"
                className="mt-3 flex min-h-14 cursor-pointer items-center gap-3 border border-dashed border-border p-4 transition hover:border-accent focus-within:ring-2 focus-within:ring-accent"
              >
                <Upload size={18} className="shrink-0 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {uploading
                    ? "Uploading…"
                    : fileUrl
                      ? "File uploaded — choose another to replace"
                      : "Choose PNG, JPG or PDF (up to 10 MB)"}
                </span>
                <input
                  id="design-file"
                  type="file"
                  className="sr-only"
                  onChange={handleFile}
                  accept="image/png,image/jpeg,application/pdf"
                  aria-describedby="design-file-help"
                />
              </label>
              <p id="design-file-help" className="mt-2 text-xs text-muted-foreground">
                Your uploaded reference stays attached while you move between steps.
              </p>
            </div>
          </Group>

          <Group title="Quantity, budget and timing" stage={2} active={step === 2}>
            <div className="grid gap-6 sm:grid-cols-2">
              <Field
                label="Quantity"
                name="quantity"
                type="number"
                min="1"
                max="100000"
                placeholder="1"
              />
              <Select label="Budget range" name="budget" options={budgets} />
              <Field label="Preferred deadline" name="deadline" type="date" />
            </div>
            <Field label="Additional notes" name="additional_notes" textarea rows={3} />
          </Group>

          <Group title="Contact details" stage={3} active={step === 3}>
            <div className="border border-border bg-background p-4 sm:p-5">
              <h2 className="font-display text-xl">Review your brief</h2>
              <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                {briefSummary.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-muted-foreground">
                Use Back to make changes before sending.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <Field label="Full name" name="full_name" required autoComplete="name" />
              <Field
                label="Email address"
                name="email"
                type="email"
                required
                autoComplete="email"
              />
              <Field
                label="WhatsApp number"
                name="whatsapp"
                required
                type="tel"
                autoComplete="tel"
                placeholder="+234 800 000 0000"
              />
            </div>
            <p className="mt-5 text-sm leading-6 text-muted-foreground">
              We’ll contact you about this brief. No production begins until you have reviewed and
              approved the quote and deposit terms.
            </p>
          </Group>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
            <button
              type="button"
              onClick={() => goToStage(step - 1)}
              disabled={step === 0 || loading}
              className="inline-flex min-h-12 items-center gap-2 border border-border px-5 text-xs font-bold uppercase tracking-[0.16em] transition hover:border-foreground disabled:opacity-40"
            >
              Back
            </button>
            {step < orderSteps.length - 1 ? (
              <button
                type="button"
                onClick={() => validateStage(step) && goToStage(step + 1)}
                disabled={uploading}
                className="btn-pill inline-flex min-h-12 items-center gap-2 bg-foreground px-6 text-xs font-bold uppercase tracking-[0.16em] text-primary-foreground transition hover:bg-accent hover:text-accent-foreground disabled:opacity-60"
              >
                Continue <ArrowRight size={15} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading || uploading}
                className="btn-pill inline-flex min-h-12 items-center gap-2 bg-foreground px-6 text-xs font-bold uppercase tracking-[0.16em] text-primary-foreground transition hover:bg-accent hover:text-accent-foreground disabled:opacity-60"
              >
                {loading ? "Sending brief…" : "Review and send brief"} <ArrowRight size={15} />
              </button>
            )}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            By sending, you agree to be contacted by our studio via WhatsApp or email.
          </p>
        </form>
      </section>
    </>
  );
}

function Group({
  title,
  stage,
  active,
  children,
}: {
  title: string;
  stage: number;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <fieldset
      data-order-stage={stage}
      hidden={!active}
      className="mt-8 min-w-0 space-y-6 border-t border-border pt-8"
    >
      <legend className="eyebrow">{title}</legend>
      {children}
    </fieldset>
  );
}

type FieldProps = {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  textarea?: boolean;
  rows?: number;
  autoComplete?: string;
  min?: string;
  max?: string;
};

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
  textarea,
  rows,
  autoComplete,
  min,
  max,
}: FieldProps) {
  return (
    <div>
      <label htmlFor={name} className="eyebrow">
        {label}
        {required && <span className="text-accent ml-1">*</span>}
      </label>
      {textarea ? (
        <textarea
          id={name}
          name={name}
          required={required}
          rows={rows || 3}
          placeholder={placeholder}
          className="mt-3 w-full border border-border bg-card px-4 py-3 text-sm transition focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          required={required}
          placeholder={placeholder}
          autoComplete={autoComplete}
          min={min}
          max={max}
          className="mt-3 min-h-12 w-full border border-border bg-card px-4 py-3 text-sm transition focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        />
      )}
    </div>
  );
}

function Select({
  label,
  name,
  required,
  options,
}: {
  label: string;
  name: string;
  required?: boolean;
  options: string[];
}) {
  return (
    <div>
      <label htmlFor={name} className="eyebrow">
        {label}
        {required && <span className="text-accent ml-1">*</span>}
      </label>
      <select
        id={name}
        name={name}
        required={required}
        className="mt-3 min-h-12 w-full border border-border bg-card px-4 py-3 text-sm transition focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <option value="">Select…</option>
        {options.map((o: string) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
