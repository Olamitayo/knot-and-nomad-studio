import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";
const path = (value: string) => fileURLToPath(new URL(value, import.meta.url));
export default defineConfig({
  plugins: [react(), tailwindcss()],
  cacheDir: path("../node_modules/.vite-showroom-tests"),
  define: {
    "import.meta.env.VITE_ENABLE_3D": JSON.stringify(process.env.VITE_ENABLE_3D ?? "true"),
  },
  resolve: {
    alias: [
      { find: "@tanstack/react-start", replacement: path("./fixtures/mocks.ts") },
      { find: "@/lib/orders.functions", replacement: path("./fixtures/mocks.ts") },
      { find: "@/integrations/supabase/client", replacement: path("./fixtures/mocks.ts") },
      { find: "@", replacement: path("../src") },
    ],
  },
  server: { host: "127.0.0.1", port: 4195, strictPort: true },
});
