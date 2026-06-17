import type { EarthquakeEventsRepository } from "@application/interfaces/repositories";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import type { EarthquakeEvent } from "@domain/entities/earthquake-event";
import type { Dependencies } from "@infrastructure/dependencies";

type EarthquakeDBItem = {
  eventId: string;
  time: number;
  magnitude: number;
  place: string;
  date: string;
  type: string;
};

function mapDbItemToEarthquakeEvent(item: EarthquakeDBItem): EarthquakeEvent {
  return {
    id: item.eventId,
    magnitude: item.magnitude,
    location: item.place,
    occurredAt: new Date(item.date),
  };
}

export function makeEarthquakeEventsRepository({
  config,
}: Pick<Dependencies, "config">): EarthquakeEventsRepository {
  const ddbClient = new DynamoDBClient({});
  const docClient = DynamoDBDocumentClient.from(ddbClient);

  return {
    async findSince(timestamp: Date): Promise<EarthquakeEvent[]> {
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

      return items
        .sort((a, b) => a.time - b.time)
        .map(mapDbItemToEarthquakeEvent);
    },
  };
}
