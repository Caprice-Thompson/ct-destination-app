# Unit Tests

This directory contains comprehensive unit tests for the Country Information Service, organized by architectural layer.

## Test Structure

```
tests/
├── api/                          # API layer tests
│   └── list-country-information.test.ts
├── application/                  # Application layer tests
│   ├── list-country-information.test.ts
│   └── validator.test.ts
├── domain/                       # Domain layer tests
│   └── entities/
│       ├── city-population.test.ts
│       ├── country-detail.test.ts
│       └── national-dish.test.ts
├── infrastructure/               # Infrastructure layer tests
│   └── repositories/
│       ├── country-repository.test.ts
│       └── rest-countries-api-repository.test.ts
├── helpers/                      # Test utilities
│   └── test-data.ts
└── README.md                     # This file
```

## Running Tests

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

### Run Specific Test File

```bash
npm test -- country-detail.test.ts
```

### Run Tests for Specific Layer

```bash
npm test -- tests/domain/
npm test -- tests/application/
npm test -- tests/infrastructure/
npm test -- tests/api/
```

## Test Coverage

The test suite aims for 80%+ coverage across all metrics:

- **Branches**: 80%+
- **Functions**: 80%+
- **Lines**: 80%+
- **Statements**: 80%+

View coverage report:

```bash
npm run test:coverage
open coverage/index.html
```

## Test Organization by Layer

### Domain Layer Tests

Tests for business entities and value objects. These tests have no external dependencies.

**Files:**

- `domain/entities/country-detail.test.ts` - CountryDetail entity, Currency, Coordinates, MapDetails
- `domain/entities/city-population.test.ts` - CityPopulation entity
- `domain/entities/national-dish.test.ts` - NationalDish entity

**What's Tested:**

- Entity creation and validation
- Getter methods
- Value object immutability
- toJSON() serialization
- Edge cases (empty values, special characters)

### Application Layer Tests

Tests for use cases, validators, and business logic orchestration.

**Files:**

- `application/list-country-information.test.ts` - Use case orchestration
- `application/validator.test.ts` - Input validation

**What's Tested:**

- Use case execution with mocked repositories
- Parallel data fetching
- Error handling and propagation
- Validation rules (country name format, length, characters)
- Edge cases (missing data, invalid inputs)

### Infrastructure Layer Tests

Tests for repository implementations and external integrations.

**Files:**

- `infrastructure/repositories/rest-countries-api-repository.test.ts` - REST Countries API integration
- `infrastructure/repositories/country-repository.test.ts` - PostgreSQL repository

**What's Tested:**

- API request/response handling
- Data mapping from external formats to domain entities
- Database query execution
- Error handling (network errors, database errors)
- Edge cases (missing fields, special characters)

### API Layer Tests

Tests for HTTP handlers and request/response handling.

**Files:**

- `api/list-country-information.test.ts` - Lambda handler

**What's Tested:**

- HTTP status codes (200, 400, 404, 500)
- Request validation
- Response formatting
- Error handling
- Dependency injection
- Environment-specific behavior (dev vs prod)

## Test Patterns

### Mocking External Dependencies

#### Mocking Repositories

```typescript
const mockApiRepository: jest.Mocked<CountryApiRepository> = {
  getCountryDetailsByName: jest.fn(),
};

mockApiRepository.getCountryDetailsByName.mockResolvedValue(mockCountry);
```

#### Mocking Database Client

```typescript
const mockDbClient: jest.Mocked<DbClient> = {
  querySingleRowOptional: jest.fn(),
  // ... other methods
};

mockDbClient.querySingleRowOptional.mockResolvedValue(mockRow);
```

#### Mocking Fetch API

```typescript
global.fetch = jest.fn();

(global.fetch as jest.Mock).mockResolvedValue({
  ok: true,
  json: async () => mockApiResponse,
});
```

### Using Test Data Helpers

```typescript
import { createTestCountry, createTestCityPopulation } from '../helpers/test-data';

const country = createTestCountry();
const population = createTestCityPopulation('Paris', 'FR', 2161000);
```

### Testing Error Cases

```typescript
it('should throw error for negative population', () => {
  expect(() => {
    new CityPopulation('City', 'XX', -1000);
  }).toThrow('Population cannot be negative');
});
```

### Testing Async Operations

```typescript
it('should fetch country details', async () => {
  const result = await repository.getCountryDetailsByName('Spain');
  expect(result).not.toBeNull();
});
```

## Writing New Tests

### 1. Follow the AAA Pattern

- **Arrange**: Set up test data and mocks
- **Act**: Execute the code under test
- **Assert**: Verify the results

```typescript
it('should return country details', async () => {
  // Arrange
  const mockCountry = createTestCountry();
  mockRepository.getCountryDetailsByName.mockResolvedValue(mockCountry);

  // Act
  const result = await useCase.execute('Spain');

  // Assert
  expect(result.countryDetails).toBe(mockCountry);
});
```

### 2. Test Both Happy Path and Error Cases

```typescript
describe('getCountryDetailsByName', () => {
  it('should return country when found', async () => {
    // Happy path
  });

  it('should return null when not found', async () => {
    // Error case
  });

  it('should throw error on API failure', async () => {
    // Error case
  });
});
```

### 3. Use Descriptive Test Names

Good:

```typescript
it('should return 400 for missing country name', async () => {
```

Bad:

```typescript
it('test validation', async () => {
```

### 4. Keep Tests Independent

Each test should be able to run independently without relying on other tests.

```typescript
beforeEach(() => {
  // Reset mocks and state before each test
  jest.clearAllMocks();
});
```

### 5. Test Edge Cases

- Empty strings
- Null/undefined values
- Special characters
- Very large/small numbers
- Missing optional fields

## Common Test Scenarios

### Testing Domain Entities

```typescript
describe('CountryDetail Entity', () => {
  it('should create entity with valid data', () => {
    const country = new CountryDetail({...});
    expect(country.code).toBe('ES');
  });

  it('should serialize to JSON correctly', () => {
    const country = new CountryDetail({...});
    const json = country.toJSON();
    expect(json).toEqual({...});
  });
});
```

### Testing Use Cases

```typescript
describe('ListCountryInformationUseCase', () => {
  let mockApiRepo: jest.Mocked<CountryApiRepository>;
  let mockDataRepo: jest.Mocked<CountryDataRepository>;
  let useCase: ListCountryInformationUseCase;

  beforeEach(() => {
    mockApiRepo = { getCountryDetailsByName: jest.fn() };
    mockDataRepo = {
      getCityPopulation: jest.fn(),
      getNationalDish: jest.fn(),
    };
    useCase = new ListCountryInformationUseCase(mockApiRepo, mockDataRepo);
  });

  it('should orchestrate data fetching', async () => {
    // Setup mocks
    mockApiRepo.getCountryDetailsByName.mockResolvedValue(mockCountry);
    mockDataRepo.getCityPopulation.mockResolvedValue(mockPopulation);

    // Execute
    const result = await useCase.execute('Spain');

    // Verify
    expect(result.countryDetails).toBeDefined();
    expect(mockApiRepo.getCountryDetailsByName).toHaveBeenCalledWith('Spain');
  });
});
```

### Testing API Handlers

```typescript
describe('listCountryInformationHandler', () => {
  it('should return 200 with valid data', async () => {
    const event: APIGatewayEvent = {
      queryStringParameters: { countryName: 'Spain' },
    };

    const response = await listCountryInformationHandler(event);

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toHaveProperty('countryDetails');
  });
});
```

## Debugging Tests

### Run Single Test

```bash
npm test -- -t "should return country details"
```

### Enable Verbose Output

```bash
npm test -- --verbose
```

### Debug in VS Code

Add to `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand", "--no-cache"],
  "console": "integratedTerminal"
}
```

## Best Practices

1. **Keep tests simple and focused** - One test should verify one behavior
2. **Use descriptive names** - Test names should explain what's being tested
3. **Mock external dependencies** - Don't make real API calls or database queries
4. **Test behavior, not implementation** - Focus on what the code does, not how
5. **Keep tests fast** - Unit tests should run in milliseconds
6. **Maintain test independence** - Each test should be able to run alone
7. **Update tests with code changes** - Keep tests in sync with implementation

## Continuous Integration

Tests are automatically run on:

- Every commit (pre-commit hook)
- Pull requests
- Merge to main branch

Minimum coverage thresholds must be met for CI to pass.

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Best Practices](https://testingjavascript.com/)
- [Clean Architecture Testing](https://blog.cleancoder.com/uncle-bob/2017/10/03/TestContravariance.html)
