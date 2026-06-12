import { createApiHandler } from "@api/wrappers";
import { ingestEarthquakes } from "@application/historical-ingest/ingest-earthquakes";
import type { Dependencies } from "@infrastructure/dependencies";

export function ingestEarthquakesHandler(dependencies: Dependencies) {
  return ingestEarthquakes(dependencies, {
    startTime: new Date().toISOString().split("T")[0],
    endTime: new Date().toISOString().split("T")[0],
  });
}

export const handler = createApiHandler(ingestEarthquakesHandler);
