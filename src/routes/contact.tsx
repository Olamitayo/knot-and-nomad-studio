import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Mail, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { submitContact } from "@/lib/orders.functions";
import { SITE, whatsappLink } from "@/lib/site";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Knot & Nomad" },
      {
        name: "description",
        content:
          "Get in touch with Knot & Nomad. Email, WhatsApp, and direct contact form for custom apparel enquiries.",
      },
      { property: "og:title", content: "Contact — Knot & Nomad" },
      { property: "og:description", content: "Reach the Knot & Nomad studio." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const submit = useServerFn(submitContact);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await submit({
        data: {
          name: String(fd.get("name") || ""),
          email: String(fd.get("email") || ""),
          phone: String(fd.get("phone") || ""),
          message: String(fd.get("message") || ""),
        },
      });
      if (res.ok) {
        toast.success("Message sent. We'll be in touch.");
        (e.target as HTMLFormElement).reset();
      } else {
        toast.error(res.error || "Failed to send");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Check the form");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <section className="mx-auto max-w-7xl px-6 lg:px-10 pt-24 lg:pt-32 pb-12">
        <div className="eyebrow">Contact</div>
        <h1 className="mt-4 font-display text-5xl lg:text-7xl leading-[1.05]">Let's talk.</h1>
      </section>

      <section className="mx-auto max-w-7xl px-6 lg:px-10 pb-32 grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-5 space-y-8">
          <div>
            <div className="eyebrow">Email</div>
            <a
              href={`mailto:${SITE.email}`}
              className="mt-2 block font-display text-2xl hover:text-accent transition"
            >
              <Mail size={18} className="inline mr-2" />
              {SITE.email}
            </a>
          </div>
          <div>
            <div className="eyebrow">WhatsApp</div>
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-pill mt-2 inline-flex items-center gap-2 bg-foreground text-primary-foreground px-6 py-3 text-xs font-bold uppercase tracking-[0.25em] hover:bg-accent hover:text-accent-foreground transition"
            >
              <MessageCircle size={16} /> Chat on WhatsApp
            </a>
          </div>
          <p className="text-sm text-muted-foreground max-w-sm pt-6 border-t border-border">
            For custom design briefs, please use our{" "}
            <a href="/custom-order" className="underline hover:text-accent">
              custom order form
            </a>{" "}
            for the fastest reply.
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          aria-busy={loading}
          className="lg:col-span-7 space-y-6 bg-card border border-border p-8 lg:p-10"
        >
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="eyebrow">
                Name *
              </label>
              <input
                id="name"
                name="name"
                required
                className="mt-3 min-h-12 w-full border border-border bg-background px-4 py-3 text-sm focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              />
            </div>
            <div>
              <label htmlFor="email" className="eyebrow">
                Email *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-3 min-h-12 w-full border border-border bg-background px-4 py-3 text-sm focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              />
            </div>
          </div>
          <div>
            <label htmlFor="phone" className="eyebrow">
              Phone
            </label>
            <input
              id="phone"
              name="phone"
              className="mt-3 min-h-12 w-full border border-border bg-background px-4 py-3 text-sm focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
          </div>
          <div>
            <label htmlFor="message" className="eyebrow">
              Message *
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={6}
              className="mt-3 w-full border border-border bg-background px-4 py-3 text-sm focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
          </div>
          <button
            disabled={loading}
            className="btn-pill min-h-12 bg-foreground px-8 py-4 text-xs font-bold uppercase tracking-[0.3em] text-primary-foreground transition hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-60"
          >
            {loading ? "Sending…" : "Send message"}
          </button>
        </form>
      </section>
    </>
  );
}
