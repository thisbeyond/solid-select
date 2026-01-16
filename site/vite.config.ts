import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import WindiCSS from "vite-plugin-windicss";
import path from "path";

export default defineConfig({
  plugins: [solidPlugin(), WindiCSS()],
  resolve: {
    alias: {
      "@thisbeyond/solid-select/style.css": path.resolve(
        __dirname,
        "../public/style.css",
      ),
      "@thisbeyond/solid-select": path.resolve(__dirname, "../src/index.tsx"),
    },
  },
  build: {
    target: "esnext",
  },
  server: {
    port: 3000,
  },
});
