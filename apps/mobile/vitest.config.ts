import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
  },
  resolve: {
    alias: {
      "expo-secure-store": new URL("./src/test/mocks/expo-secure-store.ts", import.meta.url).pathname,
    },
  },
});
