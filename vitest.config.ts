import { defineConfig } from "vitest/config";
import path from "path";

const templateRoot = path.resolve(import.meta.dirname);

export default defineConfig({
  root: templateRoot,
  resolve: {
    alias: {
      "@": path.resolve(templateRoot, "client", "src"),
      "@shared": path.resolve(templateRoot, "shared"),
      "@assets": path.resolve(templateRoot, "attached_assets"),
    },
  },
  test: {
    environment: "node",
    globals: true,
    include: ["server/**/*.test.ts", "server/**/*.spec.ts"],
    exclude: ["node_modules/**", "dist/**", "client/**"],
    testTimeout: 10_000,
    hookTimeout: 10_000,

    // Coverage configuration
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "json-summary", "html", "lcov"],
      reportsDirectory: "./coverage",
      include: ["server/**/*.ts", "shared/**/*.ts"],
      exclude: [
        "server/_core/**",
        "server/**/*.test.ts",
        "server/**/*.spec.ts",
        "node_modules/**",
        "dist/**",
      ],
      // CI will fail if coverage drops below these thresholds
      thresholds: {
        lines: 40,
        functions: 40,
        branches: 30,
        statements: 40,
      },
    },

    // JUnit reporter for GitHub Actions test summaries
    reporters: process.env.CI ? ["verbose", "junit"] : ["verbose"],
    outputFile: process.env.CI ? { junit: "./test-results.xml" } : undefined,
  },
});
