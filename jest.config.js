/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\.ts?$": ["ts-jest",{}],
  },
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec|e2e))\\.ts?$", // Allow .test.ts, .spec.ts, and .e2e.ts files
};