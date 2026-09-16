import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const STYLING_RULE_MESSAGE =
  "This project styles components exclusively with CSS Modules (*.module.css).";

const forbiddenStylingPaths = [
  { name: "tailwindcss", message: STYLING_RULE_MESSAGE },
  { name: "bootstrap", message: STYLING_RULE_MESSAGE },
  { name: "styled-components", message: STYLING_RULE_MESSAGE },
  { name: "radix-ui", message: "Import primitives from @radix-ui/react-[component]." },
];

const forbiddenStylingPatterns = [
  { group: ["@tailwindcss/*", "bootstrap/*", "@emotion/*"], message: STYLING_RULE_MESSAGE },
  { group: ["@radix-ui/themes", "@radix-ui/themes/*"], message: "Use unstyled Radix Primitives only." },
];

const globalCssPattern = {
  group: ["*.css", "!*.module.css"],
  message: "Global CSS is imported only in src/app/layout.tsx. Use a *.module.css file.",
};

const noInlineStyle = {
  propName: "style",
  message: "Inline styles are not allowed. Use a CSS Module class.",
};

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "react/forbid-dom-props": ["error", { forbid: [noInlineStyle] }],
      "react/forbid-component-props": ["error", { forbid: [noInlineStyle] }],
      "no-restricted-imports": [
        "error",
        {
          paths: forbiddenStylingPaths,
          patterns: [...forbiddenStylingPatterns, globalCssPattern],
        },
      ],
    },
  },
  {
    // The root layout is the single entry point for global styles.
    files: ["src/app/layout.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        { paths: forbiddenStylingPaths, patterns: forbiddenStylingPatterns },
      ],
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);
