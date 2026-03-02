import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

import vitePluginInjectDataLocator from "./plugins/vite-plugin-inject-data-locator";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), vitePluginInjectDataLocator()],
  server: {
    allowedHosts: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/@heroui/styles')) return 'vendor-heroui-styles';
          // HeroUI barrel + React Aria Components (component layer)
          if (
            id.includes('node_modules/@heroui/react') ||
            id.includes('node_modules/react-aria-components')
          ) return 'vendor-heroui-core';
          // React Aria primitive hooks & utilities (foundation layer)
          if (
            id.includes('node_modules/@react-aria/') ||
            id.includes('node_modules/@react-stately/') ||
            id.includes('node_modules/@react-types/') ||
            id.includes('node_modules/@internationalized/')
          ) return 'vendor-react-aria';
          if (id.includes('node_modules/@tanstack/')) return 'vendor-tanstack';
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) return 'vendor-react';
          if (id.includes('node_modules/@dnd-kit/')) return 'vendor-dnd';
        },
      },
    },
  },
});
