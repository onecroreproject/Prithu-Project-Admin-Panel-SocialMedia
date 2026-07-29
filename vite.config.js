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
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            const path = id.replace(/\\/g, '/');
            // Core React & Router
            if (
              path.includes('node_modules/react/') ||
              path.includes('node_modules/react-dom/') ||
              path.includes('node_modules/react-router/') ||
              path.includes('node_modules/react-router-dom/') ||
              path.includes('node_modules/scheduler/')
            ) {
              return 'vendor-react';
            }
            // Major libraries
            if (path.includes('node_modules/framer-motion/')) {
              return 'vendor-framer-motion';
            }
            if (path.includes('node_modules/@tanstack/react-query/')) {
              return 'vendor-react-query';
            }
            if (
              path.includes('node_modules/chart.js/') ||
              path.includes('node_modules/react-chartjs-2/') ||
              path.includes('node_modules/recharts/') ||
              path.includes('node_modules/apexcharts/') ||
              path.includes('node_modules/react-apexcharts/')
            ) {
              return 'vendor-charts';
            }
            if (
              path.includes('node_modules/lucide-react/') ||
              path.includes('node_modules/react-icons/')
            ) {
              return 'vendor-icons';
            }
            if (
              path.includes('node_modules/@mui/') ||
              path.includes('node_modules/@emotion/')
            ) {
              return 'vendor-mui';
            }
            return 'vendor-others';
          }
        },
      },
    },
  },
  server: {
    host: true, // Allow access from local network IPs
  }
});
