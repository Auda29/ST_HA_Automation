import { defineConfig } from "vitest/config";
import { resolve } from "path";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "STHass",
      fileName: "st-panel",
      formats: ["es"],
    },
    outDir: "../custom_components/st_hass/frontend",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        chunkFileNames: "[name]-[hash].js",
        manualChunks: (id) => {
          // Split large dependencies into separate chunks
          if (id.includes("node_modules")) {
            // CodeMirror is large, split it
            if (id.includes("@codemirror") || id.includes("codemirror")) {
              return "codemirror";
            }
            // Chevrotain parser is large
            if (id.includes("chevrotain")) {
              return "chevrotain";
            }
            // home-assistant-js-websocket
            if (id.includes("home-assistant-js-websocket")) {
              return "ha-websocket";
            }
            // Lit framework
            if (id.includes("lit")) {
              return "lit";
            }
            // Other node_modules
            return "vendor";
          }
          // Split our modules for lazy loading
          if (id.includes("/entity-browser/")) {
            return "entity-browser";
          }
          if (id.includes("/project/")) {
            return "project";
          }
          if (id.includes("/transpiler/") || id.includes("/deploy/")) {
            return "transpiler-deploy";
          }
          if (id.includes("/analyzer/")) {
            return "analyzer";
          }
        },
      },
    },
    sourcemap: true,
  },
  plugins: [
    visualizer({
      filename: "../bundle-stats.html",
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setupLitWarnings.ts"],
  },
});
