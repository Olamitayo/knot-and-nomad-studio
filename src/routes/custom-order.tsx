import { createFileRoute } from "@tanstack/react-router";
import { CustomOrderForm } from "@/components/CustomOrderForm";

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
  component: CustomOrderForm,
});
