import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  base: "/",
  build: { outDir: "dist/client", sourcemap: true },
  optimizeDeps: { include: ["react", "react-dom/client", "react-router-dom"] },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: ["terminal.local"],
    proxy: { "/internal": "http://127.0.0.1:3000" },
    warmup: { clientFiles: ["./src/main.tsx"] },
    port: 4173
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    css: true,
    exclude: ["tests/e2e/**", "tests/sites-worker.test.mjs", "node_modules/**", "dist/**"],
  },
});
