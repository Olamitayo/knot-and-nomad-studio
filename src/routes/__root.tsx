import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Toaster } from "sonner";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-8xl">404</h1>
        <p className="mt-4 text-muted-foreground">This page got lost on its journey.</p>
        <a
          href="/"
          className="btn-pill mt-8 inline-block bg-foreground text-primary-foreground px-7 py-3.5 text-xs font-bold uppercase tracking-[0.2em] hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          Back home
        </a>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-4xl">Something went wrong</h1>
        <p className="mt-3 text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="btn-pill mt-6 bg-foreground text-primary-foreground px-7 py-3.5 text-xs font-bold uppercase tracking-[0.2em] hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Knot & Nomad — Custom Premium Apparel | Rooted in Motion" },
      {
        name: "description",
        content:
          "Premium custom apparel studio. Design your own t-shirts, caps, hoodies and streetwear — crafted around your identity.",
      },
      { name: "author", content: "Knot & Nomad" },
      { name: "theme-color", content: "#1a1a1a" },
      { property: "og:site_name", content: "Knot & Nomad" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "Knot & Nomad — Custom Premium Apparel | Rooted in Motion" },
      {
        property: "og:description",
        content:
          "Premium custom apparel studio. Design your own t-shirts, caps, hoodies and streetwear — crafted around your identity.",
      },
      {
        property: "og:image",
        content:
          "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/704179cd-bdfa-425e-8832-92d4240adb49",
      },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "Knot & Nomad — Custom Premium Apparel | Rooted in Motion",
      },
      {
        name: "twitter:description",
        content:
          "Premium custom apparel studio. Design your own t-shirts, caps, hoodies and streetwear — crafted around your identity.",
      },
      {
        name: "twitter:image",
        content:
          "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/704179cd-bdfa-425e-8832-92d4240adb49",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", sizes: "48x48" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
      { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16x16.png" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/site.webmanifest" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Archivo:ital,wght@0,600;0,700;0,800;0,900;1,700&family=Inter:wght@300;400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
      <WhatsAppFloat />
      <Toaster position="top-center" theme="light" richColors closeButton />
    </QueryClientProvider>
  );
}
