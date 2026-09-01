const js = require("@eslint/js");
const globals = require("globals");
const eslintConfigPrettier = require("eslint-config-prettier");

module.exports = [
  {
    ignores: ["node_modules/**", "coverage/**"],
  },
  js.configs.recommended,
  eslintConfigPrettier,
  {
    files: ["src/**/*.js", "config/**/*.js", "__tests__/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
    },
    rules: {
      "no-unused-vars": [
        "error",
        {
          vars: "all",
          args: "after-used",
          caughtErrors: "none",
          argsIgnorePattern: "^next$",
        },
      ],
    },
  },
  {
    files: ["src/database/migrations/**/*.js", "src/database/seeders/**/*.js"],
    rules: {
      "no-unused-vars": [
        "error",
        {
          vars: "all",
          args: "after-used",
          caughtErrors: "none",
          argsIgnorePattern: "^(next|Sequelize)$",
        },
      ],
    },
  },
  {
    files: ["src/**/*.js", "config/**/*.js"],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ["__tests__/**/*.js"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
  },
];
