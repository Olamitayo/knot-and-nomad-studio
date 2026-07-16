import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/InfoPage";
export const Route = createFileRoute("/faqs")({
  component: () => (
    <InfoPage
      eyebrow="Common questions"
      title="FAQs"
      intro="Quick answers about ready-to-wear, custom production and delivery."
      sections={[
        {
          title: "Can I customise a shop item?",
          body: "Items marked Customisable can be used as a starting point. Submit a custom request so the studio can confirm method, price and timing.",
        },
        {
          title: "How long does custom production take?",
          body: "Most custom work takes 5–14 working days depending on complexity and quantity. We confirm timing before your deposit.",
        },
        {
          title: "Do you deliver nationwide?",
          body: "Yes. Ready-to-wear and completed custom orders can be delivered across Nigeria.",
        },
        {
          title: "How quickly will you reply?",
          body: "Custom briefs and support enquiries are normally answered within 24 hours.",
        },
      ]}
    />
  ),
});
