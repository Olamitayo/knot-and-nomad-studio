import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { sendCustomerEmail, sendNotificationEmail } from "@/lib/notify";

const itemSchema = z.object({
  name: z.string().trim().min(1).max(80),
  quantity: z.coerce.number().int().min(1).max(500),
});

const orderSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(7).max(40),
  service: z.string().trim().min(1).max(80),
  pickupDate: z.string().date(),
  pickupWindow: z.string().trim().min(1).max(80),
  turnaround: z.string().trim().min(1).max(80),
  address: z.string().trim().min(5).max(500),
  notes: z.string().trim().max(2000).optional().default(""),
  items: z.array(itemSchema).min(1).max(20),
  website: z.string().max(0).optional().default(""),
});

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character] || character,
  );
}

export const Route = createFileRoute("/api/laundry-order")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let payload: unknown;
        try {
          payload = await request.json();
        } catch {
          return Response.json({ error: "Invalid request." }, { status: 400 });
        }

        const parsed = orderSchema.safeParse(payload);
        if (!parsed.success) {
          return Response.json(
            { error: "Please check your details and add at least one garment." },
            { status: 400 },
          );
        }

        const order = parsed.data;
        if (order.website) return Response.json({ ok: true });

        const total = order.items.reduce((sum, item) => sum + item.quantity, 0);
        const itemSummary = order.items.map((item) => `${item.name}: ${item.quantity}`).join("\n");
        const reference = `NL-${Date.now().toString(36).toUpperCase()}`;

        await sendNotificationEmail(`Garment care request ${reference} — ${order.name}`, [
          ["Reference", reference],
          ["Customer", order.name],
          ["Email", order.email],
          ["Phone / WhatsApp", order.phone],
          ["Service", order.service],
          ["Garments", itemSummary],
          ["Total pieces", total],
          ["Pickup date", order.pickupDate],
          ["Pickup window", order.pickupWindow],
          ["Turnaround", order.turnaround],
          ["Pickup address", order.address],
          ["Special instructions", order.notes],
        ]);

        const rows = order.items
          .map(
            (item) =>
              `<tr><td style="padding:8px 0;border-bottom:1px solid #e8e2d8">${escapeHtml(item.name)}</td><td style="padding:8px 0;border-bottom:1px solid #e8e2d8;text-align:right">${item.quantity}</td></tr>`,
          )
          .join("");
        await sendCustomerEmail(
          order.email,
          `We received your Knot & Nomad Garment Care request — ${reference}`,
          `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#25221d;line-height:1.6">
            <h1 style="font-size:26px">Your garment care request is in.</h1>
            <p>Hi ${escapeHtml(order.name)},</p>
            <p>We received your pickup and quote request. Our team will review the garments and email your official quote for approval.</p>
            <p><strong>Reference:</strong> ${reference}</p>
            <table style="width:100%;border-collapse:collapse"><tbody>${rows}<tr><td style="padding:10px 0"><strong>Total pieces</strong></td><td style="padding:10px 0;text-align:right"><strong>${total}</strong></td></tr></tbody></table>
            <p><strong>Pickup:</strong> ${escapeHtml(order.pickupDate)} · ${escapeHtml(order.pickupWindow)}<br><strong>Service:</strong> ${escapeHtml(order.service)}<br><strong>Turnaround:</strong> ${escapeHtml(order.turnaround)}</p>
            <p>This is a request confirmation, not a final price. Reply to this email if anything needs changing.</p>
            <p>Knot &amp; Nomad Garment Care<br>Professional fabric care by Knot &amp; Nomad</p>
          </div>`,
        );

        return Response.json({ ok: true, reference });
      },
    },
  },
});
