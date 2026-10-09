import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import fallbackHero from "@/assets/hero-editorial.jpg";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Ready-to-wear — Knot & Nomad" },
      {
        name: "description",
        content:
          "Ready-to-wear releases are being prepared. Join Nomad Circle for release notes and early access, or start a custom order.",
      },
      { property: "og:title", content: "Ready-to-wear — Knot & Nomad" },
      {
        property: "og:description",
        content:
          "Ready-to-wear releases are being prepared. Join Nomad Circle for updates or start a custom order.",
      },
    ],
  }),
  component: ShopRoute,
});

function ShopRoute() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  if (pathname.replace(/\/$/, "") !== "/shop") {
    return <Outlet />;
  }

  return (
    <section className="relative isolate overflow-hidden border-b border-border bg-foreground text-primary-foreground">
      <div className="absolute inset-y-0 right-0 hidden w-1/2 lg:block">
        <img
          src={fallbackHero}
          alt=""
          className="h-full w-full object-cover opacity-80"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground via-foreground/35 to-transparent" />
      </div>
      <div className="relative mx-auto grid max-w-7xl items-center px-6 py-16 sm:py-24 lg:min-h-[34rem] lg:grid-cols-12 lg:px-10 lg:py-20">
        <div className="lg:col-span-7">
          <p className="eyebrow mb-5 text-primary-foreground/70">Ready-to-wear</p>
          <h1 className="font-display text-4xl leading-[0.98] sm:text-6xl lg:text-7xl">
            The next edit is being prepared.
          </h1>
          <p className="mt-6 max-w-xl text-sm leading-7 text-primary-foreground/80 sm:text-base">
            Our ready-to-wear pieces are currently being reviewed. Join Nomad Circle for release
            notes and early access, or start a custom brief with the studio.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              to="/custom-order"
              className="btn-pill inline-flex min-h-12 items-center justify-center gap-2 bg-primary-foreground px-6 text-xs font-bold uppercase tracking-[0.18em] text-foreground transition hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Start a custom order <ArrowRight size={15} />
            </Link>
            <a
              href="/shop#nomad-circle"
              className="btn-pill inline-flex min-h-12 items-center justify-center border-2 border-primary-foreground/50 px-6 text-xs font-bold uppercase tracking-[0.18em] text-primary-foreground transition hover:border-primary-foreground hover:bg-primary-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Join for drop updates
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
