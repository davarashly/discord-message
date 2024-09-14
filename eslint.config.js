const js = require("@eslint/js")
const typescriptEslintPlugin = require("@typescript-eslint/eslint-plugin")
const typescriptEslintParser = require("@typescript-eslint/parser")
const { FlatCompat } = require("@eslint/eslintrc")

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
})

module.exports = [
  ...compat.extends("plugin:@typescript-eslint/recommended", "plugin:prettier/recommended"),
  { plugins: { "@typescript-eslint/eslint-plugin": typescriptEslintPlugin } },
  {
    languageOptions: {
      parser: typescriptEslintParser,
      parserOptions: {
        project: "tsconfig.json",
        tsconfigRootDir: ".",
        sourceType: "module",
      },
    },
  },
  {
    rules: {
      "@typescript-eslint/interface-name-prefix": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "no-console": "off",
      "no-undef": "off",
    },
  },
  {
    ignores: ["eslint.config.js", "ecosystem.config.js", "vite.config.ts"],
  },
]
