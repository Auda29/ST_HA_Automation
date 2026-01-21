import { defineConfig } from "vitest/config";
import { resolve } from "path";

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
      },
    },
    sourcemap: true,
  },
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
