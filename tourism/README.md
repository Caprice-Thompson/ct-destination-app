# Tourism Service

Lambda API service for retrieving tourism information by country name from a PostgreSQL database.

## API

**Handler**: `getTourismInformationHandler`

**Query Parameter**: `countryName` (string, required)

**Response**: Returns UNESCO World Heritage Sites for the specified country.

## Architecture

Clean architecture with layers: API → Application (Use Cases) → Domain (Entities) → Infrastructure (Repositories, Database).
