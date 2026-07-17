import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/InfoPage";
export const Route = createFileRoute("/delivery")({
  component: () => (
    <InfoPage
      eyebrow="Nationwide service"
      title="Delivery"
      intro="We deliver ready-to-wear and completed custom orders across Nigeria."
      sections={[
        {
          title: "Ready-to-wear",
          body: "Each product page shows its current delivery estimate. Timing begins after payment confirmation.",
        },
        {
          title: "Custom orders",
          body: "Production usually takes 5–14 working days depending on complexity, before delivery time is added.",
        },
        {
          title: "Tracking",
          body: "We confirm dispatch and tracking details through WhatsApp or email when your order leaves the studio.",
        },
      ]}
    />
  ),
});
