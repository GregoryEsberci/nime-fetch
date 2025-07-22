import type { Config } from 'jest';

const config: Config = {
  coverageProvider: 'v8',
  transform: {
    '^.+\\.(t|j)sx?$': ['@swc/jest', { jsc: { target: 'es2022' } }],
  },
  setupFilesAfterEnv: [
    '<rootDir>/tests/scripts/setup-tests-envs.ts',
    '<rootDir>/tests/scripts/setup-tests.ts',
  ],
  transformIgnorePatterns: ['/node_modules/(?!chalk|ansi-styles)/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1',
  },
};

export default config;
