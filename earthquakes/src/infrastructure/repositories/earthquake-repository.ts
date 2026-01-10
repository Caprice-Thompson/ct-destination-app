import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import type { Dependencies } from "@infrastructure/dependencies";

export function makeEarthquakeRepository({ config }: Pick<Dependencies, "config">): EarthquakeRepository {
  const dynamoDBClient = new DynamoDBClient();

  return {
    async getMostRecentEarthquakes(dateRange: { from: string; to: string }) {
      const allResults: DynamoDBEarthquakeItem[] = [];

      // Query earthquakes within the date range
      if (dateRange.from && dateRange.to) {
        const command = new QueryCommand({
          TableName: config.tables.earthquakes,
          KeyConditionExpression: "#timestamp BETWEEN :from AND :to",
          ExpressionAttributeNames: {
            "#timestamp": "timestamp",
          },
          ExpressionAttributeValues: {
            ":from": dateRange.from,
            ":to": dateRange.to,
          },
        });

        const response = await dynamoDBClient.send(command);

        if (response.Items) {
          allResults.push(...(response.Items as DynamoDBEarthquakeItem[]));
        }
      }

      return allResults.map(
        (item) => ({
          id: item.id,
          magnitude: item.magnitude,
          location: item.location,
          timestamp: item.timestamp,
          url: item.url,
          depth: item.depth,
          latitude: item.latitude,
          longitude: item.longitude,
          type: item.type,
          intensity: item.intensity,
          impact: item.impact,
          impactType: item.impact_type,
        }),
      );
    },
  };
}

interface DynamoDBEarthquakeItem {
  id: string;
  magnitude: number;
  location: {
    name: string;
    country: string;
    region: string;
    city: string;
    latitude: number;
    longitude: number;
  };
  timestamp: string;
  url: string;
  depth: number;
  latitude: number;
  longitude: number;
  type: string;
  intensity: string;
  impact: string;
  impact_type: string;
}
