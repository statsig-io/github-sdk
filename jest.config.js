/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transformIgnorePatterns: ['node_modules'],
  testMatch: ['**/__tests__/**/*test.(j|t)s', '**/?(*.)+test.(j|t)s'],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
  ],
};
// import type {Config} from 'jest';

// const config: Config = {
//   preset: 'ts-jest',
//   testEnvironment: 'node',
//   transformIgnorePatterns: ['node_modules'],
// };

// export default config;