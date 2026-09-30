import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Preview A build config. Emits a static SPA into dist/ for Amplify hosting.
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    sourcemap: false,
  },
  server: {
    host: "127.0.0.1",
    port: 5173,
  },
});
