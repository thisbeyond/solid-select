import { defineConfig } from 'vitest/config';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solidPlugin()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    server: {
      deps: {
        inline: [/solid-js/],
      },
    },
    exclude: ["tests/e2e/**", "**/node_modules/**"],
  },
  resolve: {
    conditions: ["development", "browser"],
  },
});
