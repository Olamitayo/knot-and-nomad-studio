import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { sendNotificationEmail } from "@/lib/notify";
import { formatNaira } from "@/lib/format";

interface PaystackVerifyResponse {
  status: boolean;
  data?: {
    status: string;
    amount: number;
    currency: string;
    reference: string;
  };
}

interface OrderForNotify {
  reference: string;
  full_name: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  city: string;
  state: string;
  total_ngn: number;
  payment_method: string;
}

const ORDER_SELECT = "reference, full_name, email, phone, whatsapp, address, city, state, total_ngn, payment_method";

async function notifyOrder(order: OrderForNotify, subject: string) {
  await sendNotificationEmail(subject, [
    ["Reference", order.reference],
    ["Name", order.full_name],
    ["Email", order.email],
    ["Phone", order.phone],
    ["WhatsApp", order.whatsapp],
    ["Address", `${order.address}, ${order.city}, ${order.state}`],
    ["Total", formatNaira(order.total_ngn)],
    ["Payment method", order.payment_method === "card" ? "Card" : "Bank transfer"],
  ]);
}

// Verifies a Paystack transaction server-side (never trust the client-side
// success callback alone) and, if the amount/currency/status all check out,
// marks the matching order paid using the service role — the only path
// that's allowed to set payment_status to 'paid' (see RLS policy).
async function verifyAndMarkPaid(reference: string): Promise<{ ok: boolean; error?: string }> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    console.error("[payments] PAYSTACK_SECRET_KEY not set");
    return { ok: false, error: "Payment verification is not configured." };
  }

  const { data: order, error: orderErr } = await supabaseAdmin
    .from("orders")
    .select(`id, payment_status, ${ORDER_SELECT}`)
    .eq("reference", reference)
    .maybeSingle();

  if (orderErr || !order) {
    return { ok: false, error: "Order not found." };
  }

  if (order.payment_status === "paid") {
    return { ok: true };
  }

  const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
  });

  if (!res.ok) {
    console.error("[payments] Paystack verify request failed", res.status, await res.text());
    return { ok: false, error: "Could not verify payment with Paystack." };
  }

  const body = (await res.json()) as PaystackVerifyResponse;
  const tx = body.data;

  if (!body.status || !tx || tx.status !== "success") {
    return { ok: false, error: "Payment was not successful." };
  }

  if (tx.currency !== "NGN" || tx.amount !== order.total_ngn * 100) {
    console.error("[payments] Amount/currency mismatch", { expected: order.total_ngn * 100, got: tx.amount, currency: tx.currency });
    return { ok: false, error: "Payment amount did not match the order total." };
  }

  const { error: updateErr } = await supabaseAdmin
    .from("orders")
    .update({ payment_status: "paid" })
    .eq("id", order.id);

  if (updateErr) {
    console.error("[payments] Failed to mark order paid", updateErr);
    return { ok: false, error: "Payment verified but we couldn't update the order. Contact support." };
  }

  await notifyOrder(order, `Payment confirmed — order ${order.reference}`);

  return { ok: true };
}

const verifySchema = z.object({ reference: z.string().trim().min(1).max(120) });

export const verifyPaystackPayment = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => verifySchema.parse(d))
  .handler(async ({ data }) => verifyAndMarkPaid(data.reference));

const referenceSchema = z.object({ reference: z.string().trim().min(1).max(120) });

// Called right after a checkout order is created (both payment methods) so
// nothing gets missed — this fires before payment is confirmed, so it's a
// "heads up, someone's ordering" notification rather than a "go fulfill this" one.
export const notifyNewOrder = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => referenceSchema.parse(d))
  .handler(async ({ data }) => {
    const { data: order } = await supabaseAdmin
      .from("orders")
      .select(ORDER_SELECT)
      .eq("reference", data.reference)
      .maybeSingle();
    if (order) await notifyOrder(order, `New order placed — ${order.reference}`);
    return { ok: true };
  });

// Called after a customer uploads a bank transfer receipt — this is the
// "go check and fulfill this" signal for manual transfer orders, since card
// orders already get that via the payment-confirmed notification above.
export const notifyReceiptSubmitted = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => referenceSchema.parse(d))
  .handler(async ({ data }) => {
    const { data: order } = await supabaseAdmin
      .from("orders")
      .select(ORDER_SELECT)
      .eq("reference", data.reference)
      .maybeSingle();
    if (order) await notifyOrder(order, `Receipt submitted — order ${order.reference}`);
    return { ok: true };
  });

export { verifyAndMarkPaid };
