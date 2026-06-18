/** @type {import('ts-jest').JestConfigWithTsJest} */
const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig.json');

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' }),
  setupFiles: ['<rootDir>/src/tests/setup.ts'],
  setupFilesAfterEnv: ['<rootDir>/src/shared/database/__mocks__/prisma.ts'],
  testMatch: ['**/?(*.)+(spec|test).ts'],
  clearMocks: true,
};
