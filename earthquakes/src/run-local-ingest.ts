import { makeDependencies } from "./infrastructure/dependencies";
import { ingestEarthquakes } from "./application/historical-ingest/ingest-earthquakes";

// Helper to easily change the date parameters
const START_TIME = "2012-01-01";
const END_TIME = "2014-12-31";

async function run() {
  console.log(
    `Starting earthquake local ingestion from ${START_TIME} to ${END_TIME}...`,
  );

  // Ensure local DynamoDB endpoints are used if AWS_ENDPOINT_URL is not set
  if (!process.env.AWS_ENDPOINT_URL) {
    process.env.AWS_ENDPOINT_URL = "http://localhost:8000";
  }
  if (!process.env.AWS_REGION) {
    process.env.AWS_REGION = "eu-west-1";
  }
  if (!process.env.AWS_ACCESS_KEY_ID) {
    process.env.AWS_ACCESS_KEY_ID = "dummy";
  }
  if (!process.env.AWS_SECRET_ACCESS_KEY) {
    process.env.AWS_SECRET_ACCESS_KEY = "dummy";
  }
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

  try {
    const dependencies = await makeDependencies();

    const result = await ingestEarthquakes(dependencies, {
      startTime: START_TIME,
      endTime: END_TIME,
    });

    console.log("Ingestion completed successfully!");
    console.log(`Total fetched: ${result.totalFetched}`);
    console.log(`Successfully written: ${result.successfullyWritten}`);
  } catch (error) {
    console.error("Failed processing earthquake ingestion:", error);
    process.exit(1);
  }
}

run();
