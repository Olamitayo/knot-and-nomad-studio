import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { submitCustomOrder } from "@/lib/orders.functions";
import { supabase } from "@/integrations/supabase/client";
import { whatsappLink } from "@/lib/site";
import {
  addGarment,
  briefSchema,
  budgets,
  clothingTypes,
  colors,
  consultationMethods,
  consultationSummary,
  designError,
  emptyBrief,
  garmentTotal,
  methods,
  garmentReviewFields,
  overallTotal,
  positions,
  productionNotice,
  sizes,
  stageError,
  todayInLagos,
  updateGarment,
} from "@/lib/custom-order";
import type { OrderBrief, OrderItem } from "@/lib/custom-order";

const steps = ["Garments", "Design & references", "Quantity & timing", "Review & contact"];
const control =
  "mt-2 min-h-12 w-full min-w-0 border border-border bg-card px-3 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent";
const button =
  "min-h-12 border border-border px-4 py-3 text-sm font-semibold focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-40";
const primary = `${button} btn-pill bg-foreground text-primary-foreground hover:bg-accent`;

export function CustomOrderForm() {
  const serverSubmit = useServerFn(submitCustomOrder);
  const [brief, setBrief] = useState<OrderBrief>(emptyBrief);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [failure, setFailure] = useState("");
  const [validation, setValidation] = useState("");
  const [uploads, setUploads] = useState<Record<string, boolean>>({});
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});
  const [help, setHelp] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const submitting = useRef(false);
  const busyUploads = Object.values(uploads).some(Boolean);
  function change(patch: Partial<OrderBrief>) {
    setBrief((current) => ({ ...current, ...patch }));
    setFailure("");
    setValidation("");
  }
  function itemChange(id: string, patch: Partial<OrderItem>) {
    setBrief((current) => ({ ...current, items: updateGarment(current.items, id, patch) }));
    setFailure("");
    setValidation("");
  }
  function navigate(next: number) {
    setStep(next);
    setValidation("");
    requestAnimationFrame(() => heading.current?.focus());
  }
  async function upload(id: string, files: FileList | null) {
    if (!files?.length || uploads[id]) return;
    const selected = Array.from(files);
    const item = brief.items.find((item) => item.id === id);
    if (!item) return;
    if (
      selected.length + item.referenceFiles.length > 5 ||
      selected.some(
        (file) =>
          file.size > 10 * 1024 * 1024 ||
          !["image/png", "image/jpeg", "application/pdf"].includes(file.type),
      )
    ) {
      setUploadErrors((current) => ({
        ...current,
        [id]: "Choose up to five PNG, JPG or PDF references, each no larger than 10 MB.",
      }));
      return;
    }
    setUploads((current) => ({ ...current, [id]: true }));
    setUploadErrors((current) => ({ ...current, [id]: "" }));
    try {
      for (const file of selected) {
        const path = `${id}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
        const { error } = await supabase.storage.from("design-uploads").upload(path, file);
        if (error) throw error;
        const { data } = supabase.storage.from("design-uploads").getPublicUrl(path);
        setBrief((current) => ({
          ...current,
          items: current.items.map((item) =>
            item.id === id
              ? {
                  ...item,
                  referenceFiles: [
                    ...item.referenceFiles,
                    { name: file.name, url: data.publicUrl },
                  ],
                }
              : item,
          ),
        }));
      }
      setFailure("");
    } catch {
      setUploadErrors((current) => ({
        ...current,
        [id]: "Upload failed. Successful files remain listed below; retry the missing files.",
      }));
    } finally {
      setUploads((current) => ({ ...current, [id]: false }));
    }
  }
  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Enter and the final Continue click must never submit a newly mounted submit button.
    if (
      step !== 3 ||
      !(event.nativeEvent as SubmitEvent).submitter?.hasAttribute("data-send-brief") ||
      submitting.current ||
      busyUploads
    )
      return;
    setFailure("");
    for (let stage = 0; stage < 3; stage++) {
      const error = stageError(brief, stage);
      if (error) {
        setStep(stage);
        setValidation(error);
        return;
      }
    }
    const parsed = briefSchema.safeParse(brief);
    if (!parsed.success) {
      setValidation(parsed.error.issues[0].message);
      requestAnimationFrame(() => errorRef.current?.focus());
      return;
    }
    setValidation("");
    submitting.current = true;
    setLoading(true);
    try {
      const result = await serverSubmit({ data: parsed.data });
      if (!result.ok) throw new Error(result.error || "Please try again.");
      setFailure("");
      setSubmitted(true);
      requestAnimationFrame(() => heading.current?.focus());
    } catch {
      setFailure("Your brief could not be saved. Please try again. Your entries are still here.");
      requestAnimationFrame(() => errorRef.current?.focus());
    } finally {
      submitting.current = false;
      setLoading(false);
    }
  }
  if (submitted)
    return (
      <section className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 ref={heading} tabIndex={-1} className="font-display text-5xl">
          Thank you.
        </h1>
        <p className="mt-6">
          Our studio will review your brief and contact you via WhatsApp or email.
        </p>
        {brief.consultationRequested && (
          <p className="mt-4">Consultation requested. We’ll confirm availability with you.</p>
        )}
        <p className="mt-4 text-sm text-muted-foreground">{productionNotice}</p>
        <a href="/" className={`${primary} mt-8 inline-block`}>
          Back home
        </a>
      </section>
    );
  const currentError = stageError(brief, step);
  const showConsultation = brief.isFirstCustomOrder === true || help;
  return (
    <>
      <section className="mx-auto max-w-7xl px-6 pb-7 pt-12 lg:px-10 lg:pt-16">
        <div className="eyebrow">Custom order</div>
        <h1 className="mt-4 font-display text-4xl sm:text-5xl lg:text-6xl">
          Create your <span className="text-accent">custom</span> design.
        </h1>
        <p className="mt-5 max-w-2xl text-muted-foreground">
          Build one brief for up to five garment types. We’ll confirm the specification, quote and
          timeline with you.
        </p>
      </section>
      <section className="mx-auto max-w-5xl px-4 pb-24 sm:px-6 lg:px-10">
        <form
          onSubmit={onSubmit}
          noValidate
          className="border border-border bg-card p-4 sm:p-8 lg:p-10"
        >
          <fieldset disabled={loading} className="min-w-0">
            <p role="status" className="mb-4 text-sm">
              Step {step + 1} of 4
            </p>
            <ol
              aria-label="Custom order progress"
              className="grid grid-cols-2 gap-2 border-b border-border pb-5 sm:grid-cols-4"
            >
              {steps.map((label, index) => (
                <li key={label} aria-current={step === index ? "step" : undefined}>
                  <button
                    type="button"
                    disabled={index > step}
                    onClick={() => navigate(index)}
                    className={`min-h-12 w-full border-b-2 px-2 py-2 text-left text-xs font-bold focus-visible:ring-2 focus-visible:ring-accent ${step === index ? "border-accent" : "border-transparent"}`}
                  >
                    {index + 1}. {label}
                  </button>
                </li>
              ))}
            </ol>
            <h2 ref={heading} tabIndex={-1} className="my-6 font-display text-2xl">
              {steps[step]}
            </h2>
            {(failure || validation) && (
              <div
                ref={errorRef}
                tabIndex={-1}
                role="alert"
                aria-live="assertive"
                className="mb-6 border border-destructive p-4 text-sm text-destructive"
              >
                {failure && <h3>We couldn’t send your brief.</h3>}
                <p>{failure || validation}</p>
              </div>
            )}
            {step === 0 && (
              <div className="space-y-6">
                <fieldset>
                  <legend className="eyebrow">Select one to five clothing types</legend>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {clothingTypes.map((type) => {
                      const selected = brief.items.some((item) => item.clothingType === type);
                      return (
                        <label
                          key={type}
                          className={`${button} flex items-center gap-3 ${selected ? "border-accent bg-accent/5" : ""}`}
                        >
                          <input
                            type="checkbox"
                            checked={selected}
                            disabled={(!selected && brief.items.length === 5) || busyUploads}
                            onChange={() =>
                              change({
                                items: selected
                                  ? brief.items.filter((item) => item.clothingType !== type)
                                  : addGarment(brief.items, type),
                              })
                            }
                          />
                          {type}
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
                <p role="status">{brief.items.length} of 5 garments selected.</p>
                {brief.items.map((item) => (
                  <section
                    key={item.id}
                    aria-label={`${item.clothingType} configuration`}
                    className="space-y-5 border border-border p-4 sm:p-6"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-xl">{item.clothingType}</h3>
                      <button
                        type="button"
                        className={button}
                        disabled={busyUploads}
                        onClick={() =>
                          change({ items: brief.items.filter((other) => other.id !== item.id) })
                        }
                        aria-label={`Remove ${item.clothingType}`}
                      >
                        Remove garment
                      </button>
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Input
                        label="Primary colour"
                        id={`${item.id}-color`}
                        value={item.primaryColor}
                        options={colors}
                        required
                        onChange={(value) => itemChange(item.id, { primaryColor: value })}
                      />
                      <Input
                        label="Preferred / custom colour"
                        id={`${item.id}-preferred`}
                        value={item.preferredColor}
                        required={item.primaryColor === "Other"}
                        maxLength={120}
                        onChange={(value) => itemChange(item.id, { preferredColor: value })}
                      />
                    </div>
                    <fieldset>
                      <legend className="eyebrow">Sizes (select all that apply)</legend>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {sizes.map((size) => (
                          <label key={size} className={`${button} flex items-center gap-2`}>
                            <input
                              type="checkbox"
                              checked={item.sizes.includes(size)}
                              onChange={() =>
                                itemChange(item.id, {
                                  sizes: item.sizes.includes(size)
                                    ? item.sizes.filter((value) => value !== size)
                                    : [...item.sizes, size],
                                })
                              }
                            />
                            {size}
                          </label>
                        ))}
                      </div>
                    </fieldset>
                    {item.sizes.includes("Custom") && (
                      <Input
                        label="Custom size / measurements"
                        id={`${item.id}-measurements`}
                        value={item.customMeasurements}
                        textarea
                        required
                        onChange={(value) => itemChange(item.id, { customMeasurements: value })}
                      />
                    )}
                  </section>
                ))}
              </div>
            )}
            {step === 1 && (
              <div className="space-y-5">
                <p role="status">
                  {brief.items.filter((item) => !designError(item)).length} of {brief.items.length}{" "}
                  designs completed.
                </p>
                {brief.items.map((item) => (
                  <details key={item.id} open className="border border-border p-4 sm:p-6">
                    <summary className="cursor-pointer py-2 font-display text-xl focus-visible:ring-2 focus-visible:ring-accent">
                      {item.clothingType} — {designError(item) ? "Needs details" : "Complete"}
                    </summary>
                    <p className="my-4 text-sm text-muted-foreground">
                      {item.primaryColor}
                      {item.preferredColor && ` / ${item.preferredColor}`} · {item.sizes.join(", ")}
                      {item.customMeasurements && ` · ${item.customMeasurements}`}
                    </p>
                    <div className="space-y-5">
                      <Input
                        label="Design concept or description"
                        id={`${item.id}-idea`}
                        value={item.designIdea}
                        textarea
                        required
                        onChange={(value) => itemChange(item.id, { designIdea: value })}
                      />
                      <div className="grid gap-5 sm:grid-cols-2">
                        <Input
                          label="Decoration method"
                          id={`${item.id}-method`}
                          value={item.decorationMethod}
                          options={methods}
                          required
                          onChange={(value) => itemChange(item.id, { decorationMethod: value })}
                        />
                        <Input
                          label="Print / embroidery position"
                          id={`${item.id}-position`}
                          value={item.printPosition}
                          options={positions}
                          required
                          onChange={(value) => itemChange(item.id, { printPosition: value })}
                        />
                      </div>
                      <Input
                        label="Text or slogan"
                        id={`${item.id}-text`}
                        value={item.printText}
                        maxLength={500}
                        onChange={(value) => itemChange(item.id, { printText: value })}
                      />
                      <Input
                        label="Additional design instructions"
                        id={`${item.id}-instructions`}
                        value={item.designDescription}
                        textarea
                        onChange={(value) => itemChange(item.id, { designDescription: value })}
                      />
                      <label className="block text-sm" htmlFor={`${item.id}-files`}>
                        Reference files for {item.clothingType} (optional)
                        <input
                          id={`${item.id}-files`}
                          type="file"
                          multiple
                          disabled={uploads[item.id]}
                          accept="image/png,image/jpeg,application/pdf"
                          className={`${control} text-xs`}
                          aria-describedby={`${item.id}-file-help`}
                          onChange={(event) => {
                            void upload(item.id, event.target.files);
                            event.target.value = "";
                          }}
                        />
                      </label>
                      <p id={`${item.id}-file-help`} className="text-xs text-muted-foreground">
                        Up to five PNG, JPG or PDF files, 10 MB each. References are uploaded to
                        publicly accessible storage; avoid sensitive personal information.
                      </p>
                      {uploads[item.id] && <p role="status">Uploading references…</p>}
                      {uploadErrors[item.id] && (
                        <p role="alert" className="text-sm text-destructive">
                          {uploadErrors[item.id]}
                        </p>
                      )}
                      <ul className="space-y-2">
                        {item.referenceFiles.map((file) => (
                          <li key={file.url} className="flex flex-wrap items-center gap-3">
                            <a
                              className="break-all underline"
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {file.name}
                            </a>
                            <button
                              type="button"
                              className={button}
                              disabled={uploads[item.id]}
                              onClick={() =>
                                itemChange(item.id, {
                                  referenceFiles: item.referenceFiles.filter(
                                    (other) => other.url !== file.url,
                                  ),
                                })
                              }
                              aria-label={`Remove reference ${file.name}`}
                            >
                              Remove
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </details>
                ))}
              </div>
            )}
            {step === 2 && (
              <div className="space-y-6">
                {brief.items.map((item) => (
                  <section key={item.id} className="border border-border p-4 sm:p-6">
                    <h3 className="text-xl">{item.clothingType}</h3>
                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      {item.sizes.map((size) => (
                        <Input
                          key={size}
                          id={`${item.id}-${size}-quantity`}
                          label={`${item.clothingType} — ${size} quantity`}
                          type="number"
                          min="1"
                          max="100000"
                          step="1"
                          required
                          value={item.quantitiesBySize[size] || ""}
                          onChange={(value) =>
                            itemChange(item.id, {
                              quantitiesBySize: {
                                ...item.quantitiesBySize,
                                [size]: value ? Number(value) : 0,
                              },
                            })
                          }
                        />
                      ))}
                    </div>
                    <p role="status" className="mt-4 font-semibold">
                      Garment total: {garmentTotal(item)}
                    </p>
                  </section>
                ))}
                <p role="status" className="text-xl font-bold">
                  Overall order quantity: {overallTotal(brief.items)}
                </p>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Input
                    label="Budget range"
                    id="budget"
                    options={budgets}
                    value={brief.budget}
                    onChange={(value) => change({ budget: value })}
                  />
                  <Input
                    label="Preferred deadline"
                    id="deadline"
                    type="date"
                    value={brief.deadline}
                    onChange={(value) => change({ deadline: value })}
                  />
                </div>
                <Input
                  label="Additional notes"
                  id="additionalNotes"
                  value={brief.additionalNotes}
                  textarea
                  onChange={(value) => change({ additionalNotes: value })}
                />
              </div>
            )}
            {step === 3 && (
              <div className="space-y-6">
                <section aria-label="Review your brief" className="space-y-4">
                  <h3 className="text-xl">Review your brief</h3>
                  {brief.items.map((item) => (
                    <article
                      key={item.id}
                      className="space-y-3 border border-border bg-background p-4 sm:p-6"
                    >
                      <h4 className="text-lg">{item.clothingType}</h4>
                      <dl className="space-y-2 text-sm">
                        {garmentReviewFields(item).map(([label, value]) => (
                          <div key={label}>
                            <dt className="font-semibold">{label}</dt>
                            <dd className="whitespace-pre-wrap break-words">
                              {label === "Uploaded references" && item.referenceFiles.length ? (
                                <ul className="space-y-2">
                                  {item.referenceFiles.map((file) => (
                                    <li key={file.url}>
                                      <a
                                        href={file.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="underline break-all"
                                      >
                                        {file.name}
                                      </a>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                value || "Not specified"
                              )}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </article>
                  ))}
                  <p className="font-bold">Overall quantity: {overallTotal(brief.items)}</p>
                  <p>Budget: {brief.budget || "Not specified"}</p>
                  <p>Deadline: {brief.deadline || "Not specified"}</p>
                  <p className="whitespace-pre-wrap break-words">
                    Additional notes: {brief.additionalNotes || "None"}
                  </p>
                </section>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Input
                    label="Customer name"
                    id="fullName"
                    required
                    maxLength={120}
                    autoComplete="name"
                    value={brief.fullName}
                    onChange={(value) => change({ fullName: value })}
                  />
                  <Input
                    label="Email"
                    id="email"
                    type="email"
                    required
                    maxLength={255}
                    autoComplete="email"
                    value={brief.email}
                    onChange={(value) => change({ email: value })}
                  />
                  <Input
                    label="WhatsApp number"
                    id="whatsapp"
                    type="tel"
                    required
                    maxLength={40}
                    autoComplete="tel"
                    value={brief.whatsapp}
                    onChange={(value) => change({ whatsapp: value })}
                  />
                </div>
                <fieldset>
                  <legend className="font-semibold">
                    Is this your first custom order with Knot & Nomad?
                  </legend>
                  <div className="mt-3 flex gap-4">
                    {[true, false].map((value) => (
                      <label key={String(value)} className={`${button} flex items-center gap-2`}>
                        <input
                          type="radio"
                          name="first-order"
                          checked={brief.isFirstCustomOrder === value}
                          onChange={() => change({ isFirstCustomOrder: value })}
                        />
                        {value ? "Yes" : "No"}
                      </label>
                    ))}
                  </div>
                </fieldset>
                {brief.isFirstCustomOrder === false && (
                  <button
                    type="button"
                    className="min-h-12 text-sm underline"
                    onClick={() => setHelp((value) => !value)}
                  >
                    Need help? Talk to a consultant
                  </button>
                )}
                {(showConsultation || brief.consultationRequested) && (
                  <section className="space-y-4 border border-accent bg-accent/5 p-4 sm:p-6">
                    <h3 className="text-xl">A little guidance, if you need it.</h3>
                    <p className="text-sm">
                      Consultation is optional. Submit your brief whenever you’re ready.
                    </p>
                    <Input
                      label="Questions or assistance required"
                      id="consultationQuestions"
                      textarea
                      value={brief.consultationQuestions}
                      onChange={(value) => change({ consultationQuestions: value })}
                    />
                    <div className="flex flex-wrap gap-3">
                      <a
                        href={whatsappLink(consultationSummary(brief))}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={primary}
                      >
                        Chat with a consultant now
                      </a>
                      <button
                        type="button"
                        className={button}
                        aria-pressed={brief.consultationRequested}
                        onClick={() => change({ consultationRequested: true })}
                      >
                        Schedule a consultation
                      </button>
                      <button
                        type="button"
                        className={button}
                        aria-pressed={!brief.consultationRequested}
                        onClick={() => change({ consultationRequested: false })}
                      >
                        Continue without consultation
                      </button>
                    </div>
                    {brief.consultationRequested && (
                      <div className="space-y-4">
                        <p className="text-sm">
                          We’ll use your customer name, email and WhatsApp number above. Times are
                          in Lagos (WAT, UTC+1); your requested slot is subject to confirmation.
                        </p>
                        <div className="grid gap-5 sm:grid-cols-2">
                          <Input
                            label="Preferred consultation date"
                            id="consultationDate"
                            type="date"
                            min={todayInLagos()}
                            required
                            value={brief.consultationDate}
                            onChange={(value) => change({ consultationDate: value })}
                          />
                          <Input
                            label="Preferred consultation time (Lagos)"
                            id="consultationTime"
                            type="time"
                            required
                            value={brief.consultationTime}
                            onChange={(value) => change({ consultationTime: value })}
                          />
                          <Input
                            label="Contact method"
                            id="consultationMethod"
                            options={consultationMethods}
                            required
                            value={brief.consultationMethod}
                            onChange={(value) => change({ consultationMethod: value })}
                          />
                        </div>
                      </div>
                    )}
                    <p className="text-sm">{productionNotice}</p>
                  </section>
                )}
                <p className="text-sm text-muted-foreground">
                  {productionNotice} By sending, you agree to be contacted by our studio via
                  WhatsApp or email.
                </p>
              </div>
            )}
            {step < 3 && currentError && (
              <p className="mt-5 text-sm text-muted-foreground">{currentError}</p>
            )}
            <div className="mt-8 flex flex-wrap justify-between gap-3 border-t border-border pt-6">
              <button
                type="button"
                className={button}
                disabled={step === 0}
                onClick={() => navigate(step - 1)}
              >
                Back
              </button>
              {step < 3 ? (
                <button
                  key="continue"
                  type="button"
                  className={primary}
                  disabled={!!currentError || busyUploads}
                  onClick={() => navigate(step + 1)}
                >
                  Continue
                </button>
              ) : (
                <button
                  key="send"
                  data-send-brief
                  type="submit"
                  className={primary}
                  disabled={busyUploads || loading}
                >
                  {loading ? "Sending brief…" : "Review and send brief"}
                </button>
              )}
            </div>
          </fieldset>
        </form>
      </section>
    </>
  );
}
function Input({
  label,
  id,
  value,
  onChange,
  options,
  textarea,
  required,
  ...props
}: {
  label: string;
  id: string;
  value: string | number;
  onChange: (value: string) => void;
  options?: readonly string[];
  textarea?: boolean;
  required?: boolean;
  type?: string;
  min?: string;
  max?: string;
  step?: string;
  maxLength?: number;
  autoComplete?: string;
}) {
  const common = {
    id,
    name: id,
    value,
    required,
    className: control,
    onChange: (
      event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    ) => onChange(event.target.value),
  };
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}{" "}
        <span className="font-normal text-muted-foreground">
          ({required ? "required" : "optional"})
        </span>
      </label>
      {options ? (
        <select {...common}>
          <option value="">Select…</option>
          {options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      ) : textarea ? (
        <textarea {...common} rows={3} maxLength={props.maxLength ?? 2000} />
      ) : (
        <input {...common} maxLength={props.maxLength ?? 2000} {...props} />
      )}
    </div>
  );
}
