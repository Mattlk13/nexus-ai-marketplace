import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";

// Node.js globals for server-side code
const nodeGlobals = {
  process: "readonly",
  Buffer: "readonly",
  __dirname: "readonly",
  __filename: "readonly",
  console: "readonly",
  setTimeout: "readonly",
  clearTimeout: "readonly",
  setInterval: "readonly",
  clearInterval: "readonly",
  fetch: "readonly",
  URL: "readonly",
  URLSearchParams: "readonly",
  FormData: "readonly",
  global: "readonly",
  require: "readonly",
  module: "readonly",
  exports: "readonly",
};

// Browser globals for client-side code
const browserGlobals = {
  window: "readonly",
  document: "readonly",
  navigator: "readonly",
  fetch: "readonly",
  console: "readonly",
  setTimeout: "readonly",
  clearTimeout: "readonly",
  setInterval: "readonly",
  clearInterval: "readonly",
  URL: "readonly",
  URLSearchParams: "readonly",
  FormData: "readonly",
  File: "readonly",
  FileReader: "readonly",
  Blob: "readonly",
  HTMLElement: "readonly",
  HTMLInputElement: "readonly",
  HTMLDivElement: "readonly",
  Event: "readonly",
  DragEvent: "readonly",
  MouseEvent: "readonly",
  KeyboardEvent: "readonly",
  React: "readonly",
  localStorage: "readonly",
  sessionStorage: "readonly",
  location: "readonly",
  history: "readonly",
  alert: "readonly",
  confirm: "readonly",
  performance: "readonly",
  requestAnimationFrame: "readonly",
  cancelAnimationFrame: "readonly",
  MutationObserver: "readonly",
  ResizeObserver: "readonly",
  IntersectionObserver: "readonly",
  CustomEvent: "readonly",
  EventTarget: "readonly",
  AbortController: "readonly",
  AbortSignal: "readonly",
};

export default [
  // ── TypeScript server files (NOT _core — that's framework plumbing) ──────
  {
    files: ["server/*.ts", "server/routers/**/*.ts", "shared/**/*.ts"],
    ignores: ["server/_core/**"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: nodeGlobals,
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      // TypeScript safety rules
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],

      // Security rules
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",

      // Code quality
      "no-console": ["warn", { allow: ["warn", "error", "info"] }],
      "prefer-const": "error",
      "no-var": "error",
      eqeqeq: ["error", "always"],
    },
  },

  // ── React/TSX client files ────────────────────────────────────────────────
  {
    files: ["client/src/**/*.tsx", "client/src/**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
      globals: browserGlobals,
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
    },
    settings: {
      react: { version: "detect" },
    },
    rules: {
      // React rules
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react/no-unescaped-entities": "warn",
      "react/jsx-no-duplicate-props": "error",
      "react/jsx-key": ["error", { checkFragmentShorthand: true }],
      "react/no-array-index-key": "warn",

      // React Hooks rules
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // TypeScript
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },

  // ── Test files — relax rules ──────────────────────────────────────────────
  {
    files: ["**/*.test.ts", "**/*.spec.ts"],
    languageOptions: {
      globals: nodeGlobals,
    },
    rules: {
      "no-console": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },

  // ── Root-level config files (eslint.config.ts, vitest.config.ts, etc.) ────
  {
    files: ["*.config.ts", "*.config.js", "commitlint.config.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: nodeGlobals,
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "prefer-const": "error",
      "no-var": "error",
    },
  },

  // ── Global ignores ────────────────────────────────────────────────────────
  {
    ignores: [
      "server/_core/**", // Framework plumbing — not our code
      "drizzle/**", // Auto-generated by drizzle-kit — not our code
      "dist/**",
      "node_modules/**",
      "*.min.js",
      "coverage/**",
      ".manus-logs/**",
      "client/public/**",
    ],
  },
];
