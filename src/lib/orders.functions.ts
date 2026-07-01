import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const customOrderSchema = z.object({
  full_name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255),
  whatsapp: z.string().trim().min(4).max(40),
  clothing_type: z.string().trim().min(1).max(50),
  preferred_color: z.string().trim().max(60).optional().nullable(),
  size: z.string().trim().max(40).optional().nullable(),
  quantity: z.coerce.number().int().min(1).max(100000).optional().nullable(),
  print_position: z.string().trim().max(60).optional().nullable(),
  print_text: z.string().trim().max(500).optional().nullable(),
  design_description: z.string().trim().max(2000).optional().nullable(),
  design_file_url: z.string().trim().max(1000).optional().nullable(),
  deadline: z.string().trim().max(40).optional().nullable(),
  budget: z.string().trim().max(60).optional().nullable(),
  ai_idea: z.string().trim().max(2000).optional().nullable(),
  additional_notes: z.string().trim().max(2000).optional().nullable(),
});

export const submitCustomOrder = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => customOrderSchema.parse(d))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.from("custom_orders").insert(data);
    if (error) {
      console.error("custom order insert failed", error);
      return { ok: false, error: "We couldn't save your request. Please try again." };
    }
    return { ok: true };
  });

const contactSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(40).optional().nullable(),
  message: z.string().trim().min(1).max(2000),
});

export const submitContact = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => contactSchema.parse(d))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.from("contact_messages").insert(data);
    if (error) {
      console.error("contact insert failed", error);
      return { ok: false, error: "We couldn't send your message. Please try again." };
    }
    return { ok: true };
  });

const subscribeSchema = z.object({
  email: z.string().trim().email().max(255),
});

export const subscribeNewsletter = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => subscribeSchema.parse(d))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin
      .from("newsletter_subscribers")
      .insert(data);
    if (error && !String(error.message).toLowerCase().includes("duplicate")) {
      console.error("newsletter insert failed", error);
      return { ok: false, error: "Subscription failed. Try again." };
    }
    return { ok: true };
  });
