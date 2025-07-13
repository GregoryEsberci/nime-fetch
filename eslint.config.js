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
    files: ['src/static/**'],
    languageOptions: { globals: globals.browser },
  },
]);
