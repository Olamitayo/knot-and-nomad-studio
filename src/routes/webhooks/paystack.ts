import { createFileRoute } from "@tanstack/react-router";
import { verifyAndMarkPaid } from "@/lib/payments.functions";

// Paystack sends a POST here on payment events. This is the reliable
// fallback: even if a customer closes the browser right after paying
// (before the client-side callback fires), this still marks the order paid.
// The webhook signature is verified using HMAC-SHA512 of the raw body with
// the secret key, per Paystack's docs — never trust an unsigned payload.
async function hmacSha512Hex(secret: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export const Route = createFileRoute("/webhooks/paystack")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secretKey = process.env.PAYSTACK_SECRET_KEY;
        if (!secretKey) {
          console.error("[paystack webhook] PAYSTACK_SECRET_KEY not set");
          return Response.json({ error: "Not configured" }, { status: 500 });
        }

        const rawBody = await request.text();
        const signature = request.headers.get("x-paystack-signature");
        const expected = await hmacSha512Hex(secretKey, rawBody);

        if (!signature || signature !== expected) {
          console.error("[paystack webhook] Invalid signature");
          return Response.json({ error: "Invalid signature" }, { status: 401 });
        }

        let event: any;
        try {
          event = JSON.parse(rawBody);
        } catch {
          return Response.json({ error: "Invalid payload" }, { status: 400 });
        }

        if (event?.event === "charge.success" && event?.data?.reference) {
          const result = await verifyAndMarkPaid(event.data.reference);
          if (!result.ok) {
            console.error("[paystack webhook] verify failed", event.data.reference, result.error);
          }
        }

        // Always 200 so Paystack doesn't keep retrying events we've already handled or don't care about.
        return Response.json({ received: true });
      },
    },
  },
});
