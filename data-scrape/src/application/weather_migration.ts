import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  BatchWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { parse } from "csv-parse";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { config } from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: resolve(__dirname, "..", ".env.local") });
config({ path: resolve(__dirname, ".env.local") });

const TABLE_NAME = process.env.DYNAMODB_WEATHER_TABLE ?? "weather_data";

const AWS_REGION = process.env.AWS_REGION ?? "eu-west-1";

interface WeatherCSVRow {
  country_name: string;
  iso_alpha_2: string;
  capital_city: string;
  date: string;
  daily_avg_temp_c: string;
  daily_min_temp_c: string;
  daily_max_temp_c: string;
  daily_avg_temp_f: string;
  daily_min_temp_f: string;
  daily_max_temp_f: string;
  data_status: string;
}

function extractMonth(date: string): string {
  // date format: YYYY-MM-DD -> extract MM
  return date.split("-")[1];
}

function parseCSV(filePath: string): Promise<WeatherCSVRow[]> {
  return new Promise((resolve, reject) => {
    const rows: WeatherCSVRow[] = [];
    const stream = fs.createReadStream(filePath).pipe(
      parse({
        columns: true,
        skip_empty_lines: true,
        trim: true,
      }),
    );
    stream.on("data", (row: WeatherCSVRow) => rows.push(row));
    stream.on("end", () => resolve(rows));
    stream.on("error", reject);
  });
}

async function batchWrite(
  docClient: DynamoDBDocumentClient,
  tableName: string,
  items: Record<string, unknown>[],
): Promise<void> {
  const BATCH_SIZE = 25;
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE);
    const requestItems = {
      [tableName]: batch.map((item) => ({
        PutRequest: { Item: item },
      })),
    };

    const command = new BatchWriteCommand({ RequestItems: requestItems });
    await docClient.send(command);

    const processed = Math.min(i + BATCH_SIZE, items.length);
    console.log(`Inserted ${processed} / ${items.length} records`);
  }
}

async function run(): Promise<void> {
  const csvPath = resolve(
    __dirname,
    "..",
    "data",
    "european_daily_weather_2025_v2.csv",
  );

  console.log(`Reading CSV from: ${csvPath}`);
  const rows = await parseCSV(csvPath);
  console.log(`Parsed ${rows.length} rows`);

  const ddbClient = new DynamoDBClient({
    region: AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || "dummy",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "dummy",
      ...(process.env.AWS_SESSION_TOKEN && {
        sessionToken: process.env.AWS_SESSION_TOKEN,
      }),
    },
    endpoint: process.env.AWS_ENDPOINT_URL || "http://localhost:8000",
  });
  const docClient = DynamoDBDocumentClient.from(ddbClient);

  const groupedItems = new Map<string, any>();
  const items = rows.reduce(
    (acc, row) => {
      const month = extractMonth(row.date);
      const key = `${row.country_name}-${month}`;

      if (!groupedItems.has(key)) {
        const item = {
          countryName: row.country_name,
          countryCode: row.iso_alpha_2,
          capitalCity: row.capital_city,
          date: row.date,
          month: month,
          averageTemperature: parseFloat(row.daily_avg_temp_c),
          minTemperature: parseFloat(row.daily_min_temp_c),
          maxTemperature: parseFloat(row.daily_max_temp_c),
        };
        groupedItems.set(key, item);
        acc.push(item);
      }
      return acc;
    },
    [] as Record<string, unknown>[],
  );

  console.log(
    `Inserting ${items.length} items into DynamoDB table: ${TABLE_NAME}`,
  );
  await batchWrite(docClient, TABLE_NAME, items);
  console.log("Weather data migration complete");
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
