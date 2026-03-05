import type { UserConfig } from "@commitlint/types";

const config: UserConfig = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // Enforce conventional commit types
    "type-enum": [
      2,
      "always",
      [
        "feat", // New feature
        "fix", // Bug fix
        "docs", // Documentation changes
        "style", // Formatting, missing semicolons, etc.
        "refactor", // Code refactoring
        "perf", // Performance improvements
        "test", // Adding or updating tests
        "chore", // Maintenance tasks
        "ci", // CI/CD changes
        "build", // Build system changes
        "revert", // Reverting a commit
        "wip", // Work in progress (allowed locally, squash before PR)
      ],
    ],
    // Subject line max length
    "subject-max-length": [2, "always", 100],
    // Subject must not end with a period
    "subject-full-stop": [2, "never", "."],
    // Subject must be in lowercase
    "subject-case": [2, "always", "lower-case"],
    // Body max line length
    "body-max-line-length": [1, "always", 200],
    // Scope is optional but must be lowercase if provided
    "scope-case": [2, "always", "lower-case"],
  },
  // Skip commitlint for automated checkpoint commits
  ignores: [commit => commit.startsWith("Checkpoint:")],
};

export default config;
