import { z } from "zod";

export const clothingTypes = [
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
] as const;
export const sizes = ["XS", "S", "M", "L", "XL", "XXL", "Custom"] as const;
export const colors = [
  "Black",
  "White",
  "Cream",
  "Charcoal",
  "Navy",
  "Forest green",
  "Red",
  "Other",
] as const;
export const methods = [
  "DTF",
  "Screen print",
  "Embroidery",
  "Monogram",
  "Puff print",
  "Other",
] as const;
export const positions = ["Front", "Back", "Chest", "Sleeve", "Cap front", "Cap side", "Other"];
export const budgets = [
  "Under ₦100,000",
  "₦100,000–₦300,000",
  "₦300,000–₦700,000",
  "₦700,000–₦1,500,000",
  "₦1,500,000+",
];
export const consultationMethods = ["WhatsApp call", "Phone call", "Video consultation"] as const;
export const productionNotice =
  "Consultation does not confirm production. Production begins only after quotation and deposit approval.";
const text = (max = 2000) => z.string().trim().max(max);
const date = z
  .string()
  .refine(
    (value) =>
      !value ||
      (/^\d{4}-\d{2}-\d{2}$/.test(value) &&
        !Number.isNaN(Date.parse(value)) &&
        new Date(value).toISOString().slice(0, 10) === value),
    "Enter a valid date.",
  );
export function todayInLagos() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
export type ReferenceFile = { name: string; url: string };
export type OrderItem = {
  id: string;
  clothingType: string;
  primaryColor: string;
  preferredColor: string;
  sizes: string[];
  customMeasurements: string;
  designIdea: string;
  decorationMethod: string;
  printPosition: string;
  printText: string;
  designDescription: string;
  referenceFiles: ReferenceFile[];
  quantitiesBySize: Record<string, number>;
  totalQuantity: number;
};
export type OrderBrief = {
  items: OrderItem[];
  budget: string;
  deadline: string;
  additionalNotes: string;
  fullName: string;
  email: string;
  whatsapp: string;
  isFirstCustomOrder: boolean | null;
  consultationRequested: boolean;
  consultationMethod: string;
  consultationDate: string;
  consultationTime: string;
  consultationQuestions: string;
};
export function emptyBrief(): OrderBrief {
  return {
    items: [],
    budget: "",
    deadline: "",
    additionalNotes: "",
    fullName: "",
    email: "",
    whatsapp: "",
    isFirstCustomOrder: null,
    consultationRequested: false,
    consultationMethod: "",
    consultationDate: "",
    consultationTime: "",
    consultationQuestions: "",
  };
}
export function addGarment(items: OrderItem[], clothingType: string): OrderItem[] {
  if (
    items.length >= 5 ||
    items.some((item) => item.clothingType === clothingType) ||
    !clothingTypes.includes(clothingType as (typeof clothingTypes)[number])
  )
    return items;
  return [
    ...items,
    {
      id: crypto.randomUUID(),
      clothingType,
      primaryColor: "",
      preferredColor: "",
      sizes: [],
      customMeasurements: "",
      designIdea: "",
      decorationMethod: "",
      printPosition: "",
      printText: "",
      designDescription: "",
      referenceFiles: [],
      quantitiesBySize: {},
      totalQuantity: 0,
    },
  ];
}
export function garmentTotal(item: Pick<OrderItem, "sizes" | "quantitiesBySize">) {
  return item.sizes.reduce(
    (sum, size) =>
      sum +
      (Number.isSafeInteger(item.quantitiesBySize[size]) && item.quantitiesBySize[size] > 0
        ? item.quantitiesBySize[size]
        : 0),
    0,
  );
}
export function updateGarment(items: OrderItem[], id: string, patch: Partial<OrderItem>) {
  return items.map((item) => {
    if (item.id !== id) return item;
    const next = { ...item, ...patch, id: item.id, clothingType: item.clothingType };
    next.quantitiesBySize = Object.fromEntries(
      next.sizes.map((size) => [size, next.quantitiesBySize[size] ?? 0]),
    );
    return { ...next, totalQuantity: garmentTotal(next) };
  });
}
export const overallTotal = (items: OrderItem[]) =>
  items.reduce((sum, item) => sum + garmentTotal(item), 0);
export function garmentError(item: OrderItem) {
  if (!item.primaryColor || (item.primaryColor === "Other" && !item.preferredColor.trim()))
    return "Choose a primary colour and describe it if you select Other.";
  if (!item.sizes.length) return "Select at least one size.";
  if (item.sizes.includes("Custom") && !item.customMeasurements.trim())
    return "Add measurements for your custom size.";
  return "";
}
export function designError(item: OrderItem) {
  return !item.designIdea.trim() || !item.decorationMethod || !item.printPosition
    ? "Add a design concept, decoration method and position."
    : "";
}
export function quantityError(item: OrderItem) {
  return item.sizes.some(
    (size) =>
      !Number.isSafeInteger(item.quantitiesBySize[size]) ||
      item.quantitiesBySize[size] < 1 ||
      item.quantitiesBySize[size] > 100000,
  )
    ? "Enter a whole-number quantity from 1 to 100,000 for every selected size."
    : "";
}
export function stageError(brief: OrderBrief, stage: number) {
  if (!brief.items.length || brief.items.length > 5) return "Select between one and five garments.";
  if (new Set(brief.items.map((item) => item.clothingType)).size !== brief.items.length)
    return "Select each garment type only once.";
  for (const item of brief.items) {
    const error =
      stage === 0
        ? garmentError(item)
        : stage === 1
          ? designError(item)
          : stage === 2
            ? quantityError(item)
            : "";
    if (error) return `${item.clothingType}: ${error}`;
  }
  return "";
}
const itemSchema = z
  .object({
    id: z.string().uuid(),
    clothingType: z.enum(clothingTypes),
    primaryColor: z.enum(colors),
    preferredColor: text(120),
    sizes: z.array(z.enum(sizes)).min(1).max(7),
    customMeasurements: text(),
    designIdea: text().min(1),
    decorationMethod: z.enum(methods),
    printPosition: text(120).min(1),
    printText: text(500),
    designDescription: text(),
    referenceFiles: z
      .array(
        z.object({
          name: text(255).min(1),
          url: z
            .string()
            .url()
            .max(2000)
            .refine((url) => url.startsWith("https://"), "Reference must use HTTPS."),
        }),
      )
      .max(5),
    quantitiesBySize: z.record(z.number().int().min(1).max(100000)),
    totalQuantity: z.number().optional(),
  })
  .superRefine((item, ctx) => {
    if (new Set(item.sizes).size !== item.sizes.length)
      ctx.addIssue({ code: "custom", message: "Duplicate sizes are not allowed." });
    if (
      item.sizes.some((size) => !item.quantitiesBySize[size]) ||
      Object.keys(item.quantitiesBySize).some(
        (size) => !item.sizes.includes(size as (typeof sizes)[number]),
      )
    )
      ctx.addIssue({ code: "custom", message: "Quantities must match the selected sizes." });
    if (item.primaryColor === "Other" && !item.preferredColor)
      ctx.addIssue({ code: "custom", message: "Describe your preferred colour." });
    if (item.sizes.includes("Custom") && !item.customMeasurements)
      ctx.addIssue({ code: "custom", message: "Add custom measurements." });
  })
  .transform((item) => ({ ...item, totalQuantity: garmentTotal(item) }));
export const briefSchema = z
  .object({
    items: z.array(itemSchema).min(1).max(5),
    budget: text(60),
    deadline: date,
    additionalNotes: text(),
    fullName: text(120).min(1, "Enter your name."),
    email: text(255).email("Enter a valid email address."),
    whatsapp: text(40).regex(/^\+?[\d\s()-]{7,40}$/, "Enter a valid WhatsApp number."),
    isFirstCustomOrder: z.boolean({
      invalid_type_error: "Tell us whether this is your first custom order.",
    }),
    consultationRequested: z.boolean(),
    consultationMethod: text(60),
    consultationDate: text(10),
    consultationTime: text(5),
    consultationQuestions: text(),
  })
  .superRefine((brief, ctx) => {
    if (
      new Set(brief.items.map((item) => item.clothingType)).size !== brief.items.length ||
      new Set(brief.items.map((item) => item.id)).size !== brief.items.length
    )
      ctx.addIssue({
        code: "custom",
        path: ["items"],
        message: "Garments must have unique types and IDs.",
      });
    if (brief.consultationRequested) {
      if (
        !consultationMethods.includes(
          brief.consultationMethod as (typeof consultationMethods)[number],
        )
      )
        ctx.addIssue({
          code: "custom",
          path: ["consultationMethod"],
          message: "Choose a consultation contact method.",
        });
      if (
        !brief.consultationDate ||
        !date.safeParse(brief.consultationDate).success ||
        brief.consultationDate < todayInLagos()
      )
        ctx.addIssue({
          code: "custom",
          path: ["consultationDate"],
          message: "Choose a consultation date today or later (Lagos time).",
        });
      if (
        !/^([01]\d|2[0-3]):[0-5]\d$/.test(brief.consultationTime) ||
        new Date(`${brief.consultationDate}T${brief.consultationTime}:00+01:00`).getTime() <=
          Date.now()
      )
        ctx.addIssue({
          code: "custom",
          path: ["consultationTime"],
          message: "Choose a future consultation time (Lagos time).",
        });
    }
  });
export function consultationSummary(brief: OrderBrief) {
  return [
    "Hello Knot & Nomad, I’m preparing a custom-order brief and would like some guidance before submitting.",
    "",
    "Selected garments:",
    ...brief.items.map(
      (item) =>
        `• ${item.clothingType} — ${[item.primaryColor, item.preferredColor].filter(Boolean).join(" / ")} — ${item.sizes.map((size) => `${size}: ${item.quantitiesBySize[size] || 0}`).join(", ")} — quantity ${garmentTotal(item)}`,
    ),
    "",
    `Preferred deadline: ${brief.deadline || "Not specified"}`,
    `Budget range: ${brief.budget || "Not specified"}`,
    `Questions: ${brief.consultationQuestions || "Please help me refine my brief."}`,
    "",
    "Please connect me with a consultant.",
  ].join("\n");
}
export function garmentReviewFields(item: OrderItem): Array<[string, string | number]> {
  return [
    ["Primary colour", item.primaryColor],
    ["Preferred colour", item.preferredColor],
    [
      "Sizes and quantities",
      item.sizes.map((size) => `${size}: ${item.quantitiesBySize[size]}`).join(", "),
    ],
    ["Custom measurements", item.customMeasurements],
    ["Design concept", item.designIdea],
    ["Decoration method / position", `${item.decorationMethod} / ${item.printPosition}`],
    ["Text or slogan", item.printText],
    ["Design instructions", item.designDescription],
    [
      "Uploaded references",
      item.referenceFiles.map((file) => `${file.name}: ${file.url}`).join("\n"),
    ],
    ["Garment total", garmentTotal(item)],
  ];
}
export function orderNotificationFields(brief: OrderBrief): Array<[string, string | number]> {
  return [
    ["Name", brief.fullName],
    ["Email", brief.email],
    ["WhatsApp", brief.whatsapp],
    ...brief.items.flatMap((item, index) =>
      garmentReviewFields(item).map(([label, value]): [string, string | number] => [
        `Garment ${index + 1} — ${item.clothingType}: ${label}`,
        value,
      ]),
    ),
    ["Overall quantity", overallTotal(brief.items)],
    ["Budget", brief.budget],
    ["Deadline", brief.deadline],
    ["Additional notes", brief.additionalNotes],
    ["First custom order", brief.isFirstCustomOrder ? "Yes" : "No"],
    [
      "Consultation",
      brief.consultationRequested
        ? `Requested — ${brief.consultationMethod}, ${brief.consultationDate} ${brief.consultationTime} (Africa/Lagos)`
        : "Not requested",
    ],
    ["Consultation questions", brief.consultationQuestions],
    ["Production", productionNotice],
  ];
}
export function orderDatabasePayload(brief: z.infer<typeof briefSchema>) {
  const first = brief.items[0];
  return {
    full_name: brief.fullName,
    email: brief.email,
    whatsapp: brief.whatsapp,
    items: brief.items,
    clothing_type: brief.items.map((item) => item.clothingType).join(", "),
    preferred_color: first.preferredColor || first.primaryColor,
    size: first.sizes.join(", "),
    quantity: overallTotal(brief.items),
    print_position: first.printPosition,
    print_text: first.printText,
    design_description: first.designDescription,
    design_file_url: first.referenceFiles[0]?.url ?? null,
    ai_idea: first.designIdea,
    deadline: brief.deadline || null,
    budget: brief.budget || null,
    additional_notes: brief.additionalNotes || null,
    is_first_custom_order: brief.isFirstCustomOrder,
    consultation_requested: brief.consultationRequested,
    consultation_status: brief.consultationRequested ? "Requested" : null,
    consultation_method: brief.consultationRequested ? brief.consultationMethod : null,
    consultation_date: brief.consultationRequested ? brief.consultationDate : null,
    consultation_time: brief.consultationRequested ? brief.consultationTime : null,
    consultation_questions: brief.consultationRequested ? brief.consultationQuestions : null,
  };
}
