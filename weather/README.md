# Weather Service

Lambda service for retrieving monthly weather summaries by country.

## API

**Endpoint:** `GET /weather`

**Query Parameters:**

- `countryName` (required): Country name
- `month` (required): Month number (1-12)

**Example:**

```bash
GET /weather?countryName=Spain&month=3
```

**Response:**

```json
{
  "countryName": "Spain",
  "month": "3",
  "totalWeatherRecords": 31,
  "averageMinTemperature": 11.5,
  "averageMaxTemperature": 22.3
}
```

## Architecture

The service follows Clean Architecture with four layers:

- **API Layer**: Lambda handlers
- **Application Layer**: Use cases and validation
- **Domain Layer**: Business entities
- **Infrastructure Layer**: Database repositories (DynamoDB) and external weather API integrations

## Development

```bash
npm install
npm run build
npm test
```
