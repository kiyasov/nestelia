import { defineConfig } from "oxlint";

export default defineConfig({
  plugins: ["typescript"],
  categories: {
    correctness: "error",
    suspicious: "warn",
    style: "off",
  },
  rules: {
    "no-unused-vars": "off",
    "typescript/no-unused-vars": ["warn", {
      argsIgnorePattern: "^_",
      varsIgnorePattern: "^_",
    }],
    "typescript/no-explicit-any": "off",
    "typescript/no-non-null-assertion": "warn",
    "no-debugger": "error",
    "eqeqeq": "warn",
    "prefer-const": "warn",
    "typescript/no-extraneous-class": [
      "warn",
      {
        allowStaticOnly: true,
        allowWithDecorator: true,
        allowEmpty: true,
      }
    ]
  },
  ignorePatterns: [
    "dist/**",
    "node_modules/**",
    "docs/**",
    "**/*.spec.ts",
    "**/*.test.ts",
  ],
  env: {
    builtin: true,
  },
});
