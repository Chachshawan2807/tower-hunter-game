import js from "@eslint/js";
import { rules as reactThreeEslintRules } from "@react-three/eslint-plugin";
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
    files: ["src/components/render3d/**/*.{ts,tsx}"],
    plugins: {
      "@react-three": {
        rules: reactThreeEslintRules,
      },
    },
    rules: {
      "@react-three/no-clone-in-loop": "error",
      "@react-three/no-new-in-loop": "error",
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
