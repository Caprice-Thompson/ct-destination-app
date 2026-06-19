import { findCountryInString } from "@application/common/country-extractor";
import type { EarthquakeRepository } from "@application/interfaces/repositories";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  BatchWriteCommand,
  DynamoDBDocumentClient,
  QueryCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { Earthquake } from "@domain/entities/earthquake";
import type { Dependencies } from "@infrastructure/dependencies";

type EarthquakeDBItem = {
  eventId: string;
  time: number;
  name: string;
  magnitude: number;
  date: string;
  type: string;
  tsunami: number;
  place: string;
  country: string;
};

function mapDbItemToEarthquake(item: EarthquakeDBItem): Earthquake {
  return new Earthquake({
    eventId: item.eventId,
    name: item.name,
    magnitude: item.magnitude,
    date: item.date,
    type: item.type,
    tsunami: item.tsunami,
    place: item.place,
    country: item.country,
  });
}

export function makeEarthquakeRepository({
  config,
  logger,
}: Pick<Dependencies, "config" | "logger">): EarthquakeRepository {
  const ddbClient = new DynamoDBClient({
    region: config.aws.region,
    credentials: {
      accessKeyId: config.aws.accessKeyId,
      secretAccessKey: config.aws.secretAccessKey,
    },
    ...(process.env.AWS_ENDPOINT_URL && { endpoint: process.env.AWS_ENDPOINT_URL }),
  });
  const docClient = DynamoDBDocumentClient.from(ddbClient);

  const getEarthquakesByCountry = async (
    countryName: string,
  ): Promise<Earthquake[]> => {
    const tableName = config.tables.earthquakes;

    const command = new QueryCommand({
      TableName: tableName,
      KeyConditionExpression: "countryName = :countryName",
      ExpressionAttributeValues: {
        ":countryName": countryName,
      },
    });

    const response = await docClient.send(command);

    if (!response.Items) {
      return [];
    }

    return (response.Items as EarthquakeDBItem[]).map(mapDbItemToEarthquake);
  };

  const findSince = async (timestamp: Date): Promise<Earthquake[]> => {
    const tableName = config.tables.earthquakes;
    const since = timestamp.getTime();
    const items: EarthquakeDBItem[] = [];
    let exclusiveStartKey: Record<string, unknown> | undefined;

    do {
      const command = new ScanCommand({
        TableName: tableName,
        FilterExpression: "#time > :since AND #type = :earthquake",
        ExpressionAttributeNames: {
          "#time": "time",
          "#type": "type",
        },
        ExpressionAttributeValues: {
          ":since": since,
          ":earthquake": "earthquake",
        },
        ExclusiveStartKey: exclusiveStartKey,
      });

      const response = await docClient.send(command);
      items.push(...((response.Items ?? []) as EarthquakeDBItem[]));
      exclusiveStartKey = response.LastEvaluatedKey;
    } while (exclusiveStartKey);

    logger.debug("Found earthquakes since timestamp", {
      since: timestamp.toISOString(),
      count: items.length,
    });

    return items.sort((a, b) => a.time - b.time).map(mapDbItemToEarthquake);
  };

  const batchSaveEarthquakes = async (
    earthquakes: Earthquake[],
  ): Promise<number> => {
    const BATCH_SIZE = 25;
    const BATCH_DELAY_MS = 1000;
    const MAX_ATTEMPTS = 5;
    const tableName = config.tables.earthquakes;
    let successCount = 0;

    for (let i = 0; i < earthquakes.length; i += BATCH_SIZE) {
      const batch = earthquakes.slice(i, i + BATCH_SIZE);
      const putRequests: EarthquakeDBItem[] = batch.map((eq) => ({
        eventId: eq.eventId,
        time: new Date(eq.date).getTime(),
        name: eq.name,
        magnitude: eq.magnitude,
        date: eq.date,
        type: eq.type,
        tsunami: eq.tsunami,
        place: eq.place,
        country: findCountryInString(eq.place),
      }));

      let requestItems: Record<string, EarthquakeDBItem[]> = {
        [tableName]: putRequests,
      };

      let attempts = 0;

      while (Object.keys(requestItems).length > 0 && attempts < MAX_ATTEMPTS) {
        const batchWriteCommand = new BatchWriteCommand({
          RequestItems: requestItems,
        });

        const response = await docClient.send(batchWriteCommand);

        const unprocessedItems = response.UnprocessedItems?.[tableName] ?? [];
        const currentBatchSize = requestItems[tableName]?.length ?? 0;
        const processedCount = currentBatchSize - unprocessedItems.length;

        successCount += processedCount;

        if (unprocessedItems.length > 0) {
          logger.warn("Partial batch write success", {
            batchNumber: Math.floor(i / BATCH_SIZE) + 1,
            processed: processedCount,
            unprocessed: unprocessedItems.length,
            attempt: attempts + 1,
          });

          requestItems = {
            [tableName]: unprocessedItems as EarthquakeDBItem[],
          };
          attempts++;
          await new Promise((resolve) =>
            setTimeout(resolve, Math.min(100 * 2 ** attempts, 1000)),
          );
        } else {
          logger.info("Batch write successful", {
            batchNumber: Math.floor(i / BATCH_SIZE) + 1,
            itemsWritten: processedCount,
            totalProcessed: successCount,
          });
          break;
        }
      }

      if (i + BATCH_SIZE < earthquakes.length) {
        await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS));
      }
    }

    return successCount;
  };

  return {
    getEarthquakesByCountry,
    findSince,
    batchSaveEarthquakes,
  } as EarthquakeRepository;
}
