import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/InfoPage";
export const Route = createFileRoute("/payment")({
  component: () => (
    <InfoPage
      eyebrow="Secure checkout"
      title="Payment"
      intro="Ready-to-wear orders and approved custom work use clear, confirmed payment steps."
      sections={[
        {
          title: "Ready-to-wear",
          body: "Pay securely at checkout through the available payment methods. Your order is confirmed after successful payment.",
        },
        {
          title: "Custom orders",
          body: "We confirm the specification, price and timeline first. A deposit is required before production, with the balance schedule stated in your quote.",
        },
        {
          title: "Payment support",
          body: "Never send payment to an account that was not confirmed through our official website, email or WhatsApp contact.",
        },
      ]}
    />
  ),
});
