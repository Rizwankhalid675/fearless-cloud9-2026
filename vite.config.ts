import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base: the GitHub Pages path. The demo link is a submission requirement, and
// Pages serves the site under /<repo>/, so assets must be requested from there.
export default defineConfig({
  base: process.env.VITE_BASE ?? "/",
  plugins: [react()],
  test: {
    environment: "jsdom",
    // worker_threads rather than the default forks pool: forks talk over a unix
    // socket, which a sandboxed CI or dev box may refuse to let us bind.
    pool: "threads",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.{ts,tsx}"],
  },
});
