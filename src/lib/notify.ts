// Sends internal notification emails (new contact messages, custom orders) via Resend.
// Silently no-ops if RESEND_API_KEY isn't configured, so form submissions never fail
// just because email notifications aren't set up yet.
const NOTIFY_TO = "hello@knotandnomad.com";

function escapeHtml(value: string): string {
  const map: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  return value.replace(/[&<>"']/g, (c) => map[c]);
}

export async function sendNotificationEmail(
  subject: string,
  fields: Array<[label: string, value: string | number | null | undefined]>
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[notify] RESEND_API_KEY not set, skipping email notification");
    return;
  }

  const from = process.env.RESEND_FROM_EMAIL || "Knot & Nomad <notifications@knotnomad.com>";
  const html = `<div style="font-family:sans-serif;font-size:14px;line-height:1.6;color:#1a1a1a">
    ${fields
      .filter(([, value]) => value !== null && value !== undefined && value !== "")
      .map(([label, value]) => `<p style="margin:0 0 8px"><strong>${escapeHtml(label)}:</strong> ${escapeHtml(String(value))}</p>`)
      .join("")}
  </div>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: NOTIFY_TO, subject, html }),
    });
    if (!res.ok) {
      console.error("[notify] Resend send failed", res.status, await res.text());
    }
  } catch (err) {
    console.error("[notify] Resend request threw", err);
  }
}
