import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Mail, MessageCircle, Instagram, Facebook } from "lucide-react";
import { toast } from "sonner";
import { submitContact } from "@/lib/orders.functions";
import { SITE, whatsappLink } from "@/lib/site";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Knot & Nomad" },
      { name: "description", content: "Get in touch with Knot & Nomad. Email, WhatsApp, and direct contact form for custom apparel enquiries." },
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
      const res = await submit({ data: {
        name: String(fd.get("name") || ""),
        email: String(fd.get("email") || ""),
        phone: String(fd.get("phone") || ""),
        message: String(fd.get("message") || ""),
      } as any });
      if (res.ok) {
        toast.success("Message sent. We'll be in touch.");
        (e.target as HTMLFormElement).reset();
      } else {
        toast.error(res.error || "Failed to send");
      }
    } catch (err: any) {
      toast.error(err?.message || "Check the form");
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
            <a href={`mailto:${SITE.email}`} className="mt-2 block font-display text-2xl hover:text-accent transition">
              <Mail size={18} className="inline mr-2"/>{SITE.email}
            </a>
          </div>
          <div>
            <div className="eyebrow">WhatsApp</div>
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer"
               className="mt-2 inline-flex items-center gap-2 bg-foreground text-primary-foreground px-6 py-3 text-xs uppercase tracking-[0.25em] hover:bg-accent hover:text-accent-foreground transition">
              <MessageCircle size={16}/> Chat on WhatsApp
            </a>
          </div>
          <div>
            <div className="eyebrow">Follow</div>
            <div className="mt-3 flex gap-4">
              <a href={SITE.socials.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-accent"><Instagram size={22}/></a>
              <a href={SITE.socials.tiktok} target="_blank" rel="noopener noreferrer" className="hover:text-accent">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12.5 2h2.7a5.5 5.5 0 0 0 5 5.2v2.7a8 8 0 0 1-5-1.7v6.6a5.8 5.8 0 1 1-5.8-5.8c.3 0 .6 0 .9.1v2.8a3 3 0 1 0 2.2 2.9V2z"/></svg>
              </a>
              <a href={SITE.socials.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-accent"><Facebook size={22}/></a>
            </div>
          </div>
          <p className="text-sm text-muted-foreground max-w-sm pt-6 border-t border-border">
            For custom design briefs, please use our <a href="/custom-order" className="underline hover:text-accent">custom order form</a> for the fastest reply.
          </p>
        </div>

        <form onSubmit={onSubmit} className="lg:col-span-7 space-y-6 bg-card border border-border p-8 lg:p-10">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="eyebrow">Name *</label>
              <input id="name" name="name" required
                     className="mt-3 w-full bg-background border border-border px-4 py-3 text-sm focus:outline-none focus:border-accent"/>
            </div>
            <div>
              <label htmlFor="email" className="eyebrow">Email *</label>
              <input id="email" name="email" type="email" required
                     className="mt-3 w-full bg-background border border-border px-4 py-3 text-sm focus:outline-none focus:border-accent"/>
            </div>
          </div>
          <div>
            <label htmlFor="phone" className="eyebrow">Phone</label>
            <input id="phone" name="phone"
                   className="mt-3 w-full bg-background border border-border px-4 py-3 text-sm focus:outline-none focus:border-accent"/>
          </div>
          <div>
            <label htmlFor="message" className="eyebrow">Message *</label>
            <textarea id="message" name="message" required rows={6}
                      className="mt-3 w-full bg-background border border-border px-4 py-3 text-sm focus:outline-none focus:border-accent"/>
          </div>
          <button disabled={loading}
                  className="bg-foreground text-primary-foreground px-8 py-4 text-xs uppercase tracking-[0.3em] hover:bg-accent hover:text-accent-foreground transition disabled:opacity-60">
            {loading ? "Sending…" : "Send message"}
          </button>
        </form>
      </section>
    </>
  );
}
