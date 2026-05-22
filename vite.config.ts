import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: {
          charts: ["recharts"],
          icons: ["lucide-react"],
          dates: ["date-fns"],
        },
      },
    },
  },
});
