import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const src = (path: string) => fileURLToPath(new URL(`./src/${path}`, import.meta.url));

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["tests/**/*.test.{ts,tsx}"],
    restoreMocks: true,
  },
  esbuild: { jsx: "automatic" },
  resolve: {
    // Light entries import these by package name (the app's bundler resolves them); tests resolve them to the sources.
    alias: {
      "@ptht365/shared-ui/platform": src("platform/index.ts"),
      "@ptht365/shared-ui/module-contract": src("module-contract/index.ts"),
      "@ptht365/shared-ui/shared-users": src("shared-users/index.ts"),
    },
  },
});
