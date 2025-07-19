import { defineConfig, globalIgnores } from 'eslint/config';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import tsEslint from 'typescript-eslint';
import eslint from '@eslint/js';
import globals from 'globals';
import html from '@html-eslint/eslint-plugin';
import css from '@eslint/css';

export default defineConfig([
  eslint.configs.recommended,
  tsEslint.configs.strict,
  tsEslint.configs.stylistic,
  eslintPluginPrettierRecommended,
  globalIgnores(['dist']),
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
  {
    files: ['src/static/**/*.js'],
    languageOptions: {
      globals: {
        BASE_PATH: 'readonly',
        ...globals.browser,
      },
    },
  },
  {
    ...html.configs['flat/recommended'],
    files: ['**/*.html'],
    rules: {
      ...html.configs['flat/recommended'].rules,
      '@html-eslint/indent': ['error', 2],
      'prettier/prettier': 'off',
    },
  },
  {
    files: ['**/*.css'],
    language: 'css/css',
    plugins: { css },
    extends: ['css/recommended'],
  },
]);
