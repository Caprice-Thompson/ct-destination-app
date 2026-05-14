import { makeDependencies } from "@infrastructure/dependencies";

export const handler = async () => {
  const dependencies = await makeDependencies();
  const { earthquakeRepository, logger } =
    dependencies;

  try {
    logger.info("Starting scheduled earthquake ingestion");

    const now = new Date();
    const endDate = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );
    const startDate = new Date(endDate);
    startDate.setUTCMonth(startDate.getUTCMonth() - 1);
    const endTime = endDate.toISOString().split("T")[0];
    const startTime = startDate.toISOString().split("T")[0];

    logger.info("Fetching earthquake data", { startTime, endTime });

    const earthquakes = await earthquakeRepository.getEarthquakesByCountry("Greece"
    );

    logger.info("Earthquake data fetched", { count: earthquakes.length });

    if (earthquakes.length === 0) {
      logger.info("No earthquakes to ingest");
      return { statusCode: 200, body: { message: "No earthquakes to ingest" } };
    }

    const successCount =
      await earthquakeRepository.batchSaveEarthquakes(earthquakes);

    logger.info("Scheduled ingestion completed", {
      totalFetched: earthquakes.length,
      successfullyWritten: successCount,
    });

    return {
      statusCode: 200,
      body: {
        message: "Ingestion completed successfully",
        totalFetched: earthquakes.length,
        successfullyWritten: successCount,
      },
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    logger.error("Scheduled ingestion failed", {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });

    return {
      statusCode: 500,
      body: {
        message: "Ingestion failed",
        error: errorMessage,
      },
    };
  }
};
