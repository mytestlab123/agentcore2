/// <reference types="vitest/config" />
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Preview A is a mock-only Cloudscape dashboard. It never talks to AWS; the
// entire data plane comes from @agentcore2/contracts' MockBackendAdapter.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    css: false,
  },
});
