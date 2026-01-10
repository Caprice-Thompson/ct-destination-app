import { Dependencies } from "@infrastructure/dependencies";


export type GetMostRecentEarthquakesQuery = Readonly<{
    from: string;
    to: string;
}>;

export async function getMostRecentEarthquakesQuery(query: GetMostRecentEarthquakesQuery, dependencies: Dependencies) {
    const { earthquakeRepository, logger } = dependencies;

    logger.info("Starting get most recent earthquakes query", { query });

    const { from, to } = await validate(query);


    const earthquakes = await earthquakeRepository.getMostRecentEarthquakes(generateDateRange(from, to));


    logger.info("Get most recent earthquakes query completed successfully", {
        earthquakesCount: earthquakes.length,
    });


    return {
        earthquakes: earthquakes,
    };
}

export type EarthquakesResponse = Awaited<ReturnType<typeof getMostRecentEarthquakesQuery>>;
