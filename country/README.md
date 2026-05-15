# Country Service

Lambda service for retrieving comprehensive country information from REST Countries API and local database.

## API

**Endpoint:** `GET /country`

**Query Parameters:**

- `countryName` (required): Country name

**Example:**

```bash
GET /country?countryName=Spain
```

**Response:**

```json
{
  "countryDetails": {
    "countryCode": "ES",
    "countryName": "Spain",
    "capitalCityName": "Madrid",
    "flagUrl": "https://flagcdn.com/es.svg",
    "languages": ["Spanish", "Catalan", "Basque", "Galician"],
    "currency": {
      "name": "Euro",
      "symbol": "€"
    },
    "coordinates": {
      "latitude": 40.0,
      "longitude": -4.0
    },
    "maps": {
      "googleMaps": "https://goo.gl/maps/138JaXW8EZzRVitY9",
      "openStreetMaps": "https://www.openstreetmap.org/relation/1311341"
    }
  },
  "capitalPopulation": {
    "cityName": "Madrid",
    "countryCode": "ES",
    "population": 3223334
  },
  "nationalDish": {
    "countryCode": "ES",
    "dishName": "Paella",
    "description": "A traditional Spanish rice dish from Valencia..."
  }
}
```

## Architecture

The service follows Clean Architecture with four layers:

- **API Layer**: Lambda handlers
- **Application Layer**: Use cases and validation
- **Domain Layer**: Business entities
- **Infrastructure Layer**: External API integrations (REST Countries API) and database repositories (PostgreSQL)

## Development

```bash
npm install
npm run build
npm test
```
