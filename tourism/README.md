# Tourism Service

Lambda service for retrieving UNESCO World Heritage Sites information by country name.

## API

**Endpoint:** `GET /tourism`

**Query Parameters:**

- `countryName` (required): Country name

**Example:**

```bash
GET /tourism?countryName=Spain
```

**Response:**

```json
{
  "unescoSites": [
    {
      "countryCode": "ES",
      "countryName": "Spain",
      "areaName": "Andalusia",
      "site": "Alhambra, Generalife and Albayzín, Granada",
      "description": "Rising above the modern lower town, the Alhambra and the Albayzín..."
    }
  ]
}
```

## Architecture

The service follows Clean Architecture with four layers:

- **API Layer**: Lambda handlers
- **Application Layer**: Use cases and validation
- **Domain Layer**: Business entities
- **Infrastructure Layer**: Database repositories (PostgreSQL)

## Development

```bash
npm install
npm run build
npm test
```
