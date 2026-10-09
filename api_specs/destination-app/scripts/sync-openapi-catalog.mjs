#!/usr/bin/env node
/**
 * Regenerates destination-api-inline.yaml from destination-app.openapi.yaml
 * so Backstage catalog ingestion does not depend on $text file resolution.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const examplesDir = path.join(__dirname, "..", "examples");
const openapiPath = path.join(examplesDir, "destination-app.openapi.yaml");
const outPath = path.join(examplesDir, "destination-api-inline.yaml");

const openapi = fs.readFileSync(openapiPath, "utf8");
const indented = openapi
  .split("\n")
  .map((line) => `    ${line}`)
  .join("\n");

const catalog = `apiVersion: backstage.io/v1alpha1
kind: API
metadata:
  name: destination-rest-api
  description: OpenAPI specification for the local destination API
  tags:
    - rest
spec:
  type: openapi
  lifecycle: production
  owner: guests
  system: destination-app
  definition: |
${indented}
`;

fs.writeFileSync(outPath, catalog);
console.log(`Wrote ${outPath}`);
