import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/garment-care")({
  beforeLoad: () => {
    throw redirect({ href: "/garment-care/index.html" });
  },
});
