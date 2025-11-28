# Country Information Service

A Clean Architecture implementation of a country information service that combines data from the REST Countries API with local database information about city populations and national dishes.

## Architecture

This project follows Clean Architecture principles with clear separation of concerns:

### Domain Layer (`src/domain/`)

Contains the core business entities and value objects:

- **Entities**: `CountryDetail`, `CityPopulation`, `NationalDish`
- **Value Objects**: `Currency`, `Coordinates`, `MapDetails`

### Application Layer (`src/application/`)

Contains use cases and business logic:

- **Use Cases**: `ListCountryInformationUseCase` - orchestrates data retrieval from multiple sources
- **Interfaces**: Repository interfaces that define contracts for data access
- **Validators**: Input validation using Zod schema validation

### Infrastructure Layer (`src/infrastructure/`)

Contains implementations of external dependencies:

- **Repositories**:
  - `RestCountriesApiRepository` - fetches data from REST Countries API
  - `PostgresCountryDataRepository` - queries PostgreSQL database for population and dish data
- **Database**: PostgreSQL client wrapper with connection pooling

### API Layer (`src/api/`)

Contains the API handlers (e.g., AWS Lambda handlers):

- Request/response handling
- Dependency injection
- Error handling and HTTP status codes

## Data Structure

The service returns comprehensive country information:

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

## Data Sources

1. **REST Countries API** (`https://restcountries.com/v3.1`):
   - Country name and code
   - Capital city
   - Languages
   - Currency (name and symbol)
   - Coordinates (latitude/longitude)
   - Map links (Google Maps, OpenStreetMap)
   - Flag URL

2. **PostgreSQL Database**:
   - City population data
   - National dish information

## Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 14+

### Installation

```bash
npm install
```

### Database Setup

1. Create a PostgreSQL database
2. Set the `DATABASE_URL` environment variable:

```bash
export DATABASE_URL="postgresql://username:password@localhost:5432/country_db"
```

3. Run the migration script:

```bash
psql $DATABASE_URL -f src/infrastructure/repositories/db/migrations/001_create_tables.sql
```

### Environment Variables

```bash
# Required
DATABASE_URL=postgresql://username:password@host:port/database

# Optional
NODE_ENV=development  # or production
```

## Usage

### API Handler

```typescript
import { listCountryInformationHandler } from './src/api/list-country-information';

// Example Lambda event
const event = {
  queryStringParameters: {
    countryName: 'Spain',
  },
};

const response = await listCountryInformationHandler(event);
```

### Direct Use Case Usage

```typescript
import { ListCountryInformationUseCase } from './src/application/list-country-information';
import { RestCountriesApiRepository } from './src/infrastructure/repositories/rest-countries-api-repository';
import { PostgresCountryDataRepository } from './src/infrastructure/repositories/country-repository';
import { rdsClient } from './src/infrastructure/repositories/db/rds_client';

// Initialize dependencies
const countryApiRepository = new RestCountriesApiRepository();
const dbClient = await rdsClient({
  applicationName: 'country-service',
  connectionString: process.env.DATABASE_URL,
});
const countryDataRepository = new PostgresCountryDataRepository(dbClient);

// Create use case
const useCase = new ListCountryInformationUseCase(countryApiRepository, countryDataRepository);

// Execute
const result = await useCase.execute('Spain');
```

## Development

### Linting

```bash
npm run lint        # Fix linting issues
npm run lint:check  # Check for linting issues
```

### Formatting

```bash
npm run format        # Format code
npm run format:check  # Check formatting
```

### Type Checking

```bash
npm run type-check
```

## Database Schema

### `city_populations` Table

| Column       | Type         | Description                     |
| ------------ | ------------ | ------------------------------- |
| id           | SERIAL       | Primary key                     |
| city_name    | VARCHAR(255) | Name of the city                |
| country_code | VARCHAR(2)   | ISO 3166-1 alpha-2 country code |
| population   | INTEGER      | City population                 |
| created_at   | TIMESTAMP    | Record creation timestamp       |
| updated_at   | TIMESTAMP    | Record update timestamp         |

### `national_dishes` Table

| Column       | Type         | Description                     |
| ------------ | ------------ | ------------------------------- |
| id           | SERIAL       | Primary key                     |
| country_code | VARCHAR(2)   | ISO 3166-1 alpha-2 country code |
| dish_name    | VARCHAR(255) | Name of the national dish       |
| description  | TEXT         | Description of the dish         |
| created_at   | TIMESTAMP    | Record creation timestamp       |
| updated_at   | TIMESTAMP    | Record update timestamp         |

## Clean Architecture Benefits

1. **Independence**: Business logic is independent of frameworks, UI, and databases
2. **Testability**: Business rules can be tested without external dependencies
3. **Flexibility**: Easy to swap implementations (e.g., change database or API)
4. **Maintainability**: Clear separation of concerns makes code easier to understand and modify

## Error Handling

The service provides appropriate HTTP status codes:

- `200`: Success
- `400`: Validation error (invalid country name)
- `404`: Country not found
- `500`: Internal server error

## Future Enhancements

- [ ] Add caching layer (Redis) for API responses
- [ ] Implement comprehensive unit and integration tests
- [ ] Add API documentation (OpenAPI/Swagger)
- [ ] Set up CI/CD pipeline
- [ ] Add monitoring and logging (CloudWatch, DataDog, etc.)
- [ ] Implement rate limiting
- [ ] Add more data sources (weather, tourism, etc.)
