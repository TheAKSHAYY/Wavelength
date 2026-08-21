import "dotenv/config";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

const backendPort = Number(process.env.PORT || 4180);
const frontendPort = Number(process.env.VITE_PORT || 5173);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    host: true,
    port: frontendPort,
    strictPort: false,
    proxy: {
      // Forward API calls to the local Express backend, which holds the OpenAI key.
      "/api": {
        target: `http://127.0.0.1:${backendPort}`,
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          router: ["react-router-dom"],
          charts: ["recharts"],
        },
      },
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "server/**/*.test.ts"],
  },
});
