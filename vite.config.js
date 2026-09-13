import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      // Lets the Stocks section call Yahoo Finance directly during
      // `npm run dev` without hitting a browser CORS error, and without
      // depending on the public allorigins.win proxy used in production
      // builds. See src/lib/yahooFinance.js.
      "/yahoo-api": {
        target: "https://query1.finance.yahoo.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/yahoo-api/, ""),
      },
    },
  },
});
