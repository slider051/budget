import { defineConfig } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-properties": [
        "error",
        {
          object: "localStorage",
          property: "getItem",
          message:
            "localStorage is restricted to theme/UI preference files only.",
        },
        {
          object: "localStorage",
          property: "setItem",
          message:
            "localStorage is restricted to theme/UI preference files only.",
        },
        {
          object: "localStorage",
          property: "removeItem",
          message:
            "localStorage is restricted to theme/UI preference files only.",
        },
        {
          object: "localStorage",
          property: "clear",
          message:
            "localStorage is restricted to theme/UI preference files only.",
        },
        {
          object: "window",
          property: "localStorage",
          message:
            "localStorage is restricted to theme/UI preference files only.",
        },
      ],
    },
  },
  {
    files: [
      "src/app/layout.tsx",
      "src/hooks/useTheme.ts",
      "src/components/dashboard/PresetBanner.tsx",
      "src/lib/presets/applyDashboardPreset.ts",
    ],
    rules: {
      "no-restricted-properties": "off",
    },
  },
  {
    ignores: [".next/**", "out/**", "build/**", "next-env.d.ts"],
  },
]);
