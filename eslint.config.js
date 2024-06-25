import react from "@eslint-react/eslint-plugin";
import { fixupPluginRules, fixupConfigRules } from "@eslint/compat";
import eslint from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks/index.js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  react.configs.recommended,
  {
    plugins: {
      "react-hooks": fixupPluginRules(reactHooks),
    },
    rules: reactHooks.configs.recommended.rules,
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
    },
  },
);
