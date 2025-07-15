import { defineConfig, globalIgnores } from 'eslint/config';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import tsEslint from 'typescript-eslint';
import eslint from '@eslint/js';
import globals from 'globals';

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
    files: ['src/static/**'],
    languageOptions: {
      globals: {
        BASE_PATH: 'readonly',
        ...globals.browser,
      },
    },
  },
]);
