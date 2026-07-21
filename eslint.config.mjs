import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.{js,jsx,ts,tsx}"],
    rules: {
      "max-lines": [
        "warn",
        { max: 200, skipBlankLines: true, skipComments: true },
      ],
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    files: [
      "src/types/**/*",
      "src/constants/**/*",
      "src/engine/skills/impl/**/*",
      "src/engine/statuses/impl/**/*",
      "**/*.config.{js,ts,mjs}",
      "**/*.d.ts",
    ],
    rules: {
      "max-lines": "off",
    },
  },
  {
    ignores: ["dist/**", "node_modules/**", "dev-dist/**"],
  }
);
