import type { Config } from 'jest';

const config: Config = {
  clearMocks: true,
  coverageProvider: 'v8',
  transform: {
    '^.+\\.(t|j)sx?$': ['@swc/jest', { jsc: { target: 'es2022' } }],
  },
  setupFiles: [
    '<rootDir>/scripts/setup-tests-envs.ts',
    '<rootDir>/scripts/setup-tests.ts',
  ],
};

export default config;
