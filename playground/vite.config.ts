import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import path from "path";

export default defineConfig({
  plugins: [solidPlugin()],
  resolve: {
    alias: {
      "@thisbeyond/solid-select": path.resolve(__dirname, "../src/index.tsx"),
      "~": path.resolve(__dirname, "../src")
    },
  },
  server: {
    port: 3000,
  }
});
