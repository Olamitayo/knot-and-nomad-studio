import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/InfoPage";
export const Route = createFileRoute("/terms")({
  component: () => (
    <InfoPage
      eyebrow="Store terms"
      title="Terms"
      intro="These terms keep ready-to-wear purchases and custom production clear for both customer and studio."
      sections={[
        {
          title: "Orders",
          body: "An order is confirmed after successful payment or, for custom work, after the agreed deposit is received.",
        },
        {
          title: "Custom approval",
          body: "Customers are responsible for reviewing specifications, spelling, sizing and artwork before approval. Material changes after approval may affect cost and timing.",
        },
        {
          title: "Timelines",
          body: "Delivery and production dates are estimates. We communicate material delays and work to provide a practical revised date.",
        },
      ]}
    />
  ),
});
