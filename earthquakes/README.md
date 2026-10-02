# Earthquakes Service

Lambda service for retrieving earthquake data by country name.

## API

**Endpoint:** `GET /earthquakes`

**Query Parameters:**

- `countryName` (required): Country name
- `startTime` (required): Start date (YYYY-MM-DD)
- `endTime` (required): End date (YYYY-MM-DD)
- `maxRadiusKm` (optional): Search radius in kilometers (default: 300)
- `minMagnitude` (optional): Minimum magnitude filter
- `limit` (optional): Maximum number of results

**Example:**

```bash
GET /earthquakes?countryName=Spain&startTime=2020-01-01&endTime=2023-01-01&limit=10
```

**Response:**

```json
{
  "earthquakes": [
    {
      "name": "2 km NW of Santafé, Spain",
      "magnitude": 4.3,
      "date": "2021-01-28",
      "type": "earthquake",
      "tsunami": 0
    }
  ],
  "countryName": "Spain",
  "coordinates": {
    "latitude": 40,
    "longitude": -3
  }
}
```

## Architecture

The service follows Clean Architecture with four layers:

- **API Layer**: Lambda handlers
- **Application Layer**: Use cases and validation
- **Domain Layer**: Business entities
- **Infrastructure Layer**: External API integrations (USGS, REST Countries)

## Environment Variables

```
SERVICE_NAME=earthquakes-service
AWS_REGION=us-east-1
```

## Development

```bash
npm install
npm run build
npm test
```

## Local Ingestion

Start DynamoDB Local from the repository root, then run the ingestion from this directory:

```bash
docker compose up -d dynamodb-local dynamodb-setup
export REST_COUNTRIES_AUTHORIZATION="<your REST Countries API token>"
npm run ingest:local
```

The local runner supplies the API URLs, service name, AWS test credentials, region, and `historical_earthquakes` table name. The API token is intentionally not stored in the repository.
