import fs from "node:fs";
import path from "node:path";
import { pathsToModuleNameMapper } from "ts-jest";

const tsconfigPath = path.resolve("./", "tsconfig.json");
const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, "utf-8"));

export default {
  clearMocks: true,
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  extensionsToTreatAsEsm: [".ts"],
  projects: [
    {
      displayName: "unit-tests",
      testMatch: ["<rootDir>/test/unit/**/*.test.ts"],
      moduleNameMapper: pathsToModuleNameMapper(
        tsconfig.compilerOptions.paths,
        { prefix: "<rootDir>/src" },
      ),
      transform: {
        "^.+\\.ts?$": ["ts-jest"],
      },
    },
    {
      displayName: "integration-tests",
      testMatch: ["<rootDir>/test/integration/**/*.test.ts"],
      moduleNameMapper: pathsToModuleNameMapper(
        tsconfig.compilerOptions.paths,
        { prefix: "<rootDir>/src" },
      ),
      transform: {
        "^.+\\.ts?$": ["ts-jest"],
      },
    },
  ],
};
