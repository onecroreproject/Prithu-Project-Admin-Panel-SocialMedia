import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  plugins: [
    react(),
    svgr(),  // no svgrOptions needed for default export
  ],
  build: {
    chunkSizeWarningLimit: 1000,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    // rollupOptions removed: Aggressive manualChunks often cause "Cannot access 'React' before initialization" in Vite/Rollup by breaking module execution order.
  },
  server: {
    port: 5175,
    host: true, // Allow access from local network IPs
  }
});
