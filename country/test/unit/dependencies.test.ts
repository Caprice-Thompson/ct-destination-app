import { makeDependencies } from '@infrastructure/dependencies';
import { ListCountryInformation } from '@application/list-country-information';
import { RestCountriesApiRepository } from '@infrastructure/repositories/rest-countries-api-repository';
import { CountryDatabaseBRepository } from '@infrastructure/repositories/country-database-repository';

jest.mock('@infrastructure/repositories/db/rds_client', () => ({
  rdsClient: jest.fn().mockResolvedValue({
    querySingleRow: jest.fn(),
    querySingleRowOptional: jest.fn(),
    queryMultipleRows: jest.fn(),
    update: jest.fn(),
    closeConnection: jest.fn(),
    beginTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
  }),
}));

describe('makeDependencies', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should create all dependencies', async () => {
    const dependencies = await makeDependencies();

    expect(dependencies.config).toBeDefined();
    expect(dependencies.rdsClient).toBeDefined();
    expect(dependencies.countryApiRepository).toBeDefined();
    expect(dependencies.countryDataRepository).toBeDefined();
    expect(dependencies.listCountryInformationUseCase).toBeDefined();
  });

  it('should create config with correct values', async () => {
    const dependencies = await makeDependencies();

    expect(dependencies.config.database.connectionString).toBe('postgresql://test:test@localhost:5432/test_db');
    expect(dependencies.config.service.name).toBe('country-service');
  });

  it('should create RestCountriesApiRepository', async () => {
    const dependencies = await makeDependencies();

    expect(dependencies.countryApiRepository).toBeInstanceOf(RestCountriesApiRepository);
  });

  it('should create PostgresCountryDataRepository', async () => {
    const dependencies = await makeDependencies();

    expect(dependencies.countryDataRepository).toBeInstanceOf(CountryDatabaseBRepository);
  });

  it('should create ListCountryInformationUseCase', async () => {
    const dependencies = await makeDependencies();

    expect(dependencies.listCountryInformationUseCase).toBeInstanceOf(ListCountryInformation);
  });

  it('should wire dependencies correctly', async () => {
    const dependencies = await makeDependencies();

    expect(dependencies.listCountryInformationUseCase).toBeDefined();
    expect(dependencies.listCountryInformationUseCase.listCountryInfo).toBeDefined();
  });

  it('should create new instances on each call', async () => {
    const deps1 = await makeDependencies();
    const deps2 = await makeDependencies();

    expect(deps1.listCountryInformationUseCase).not.toBe(deps2.listCountryInformationUseCase);
  });

  it('should throw error when DATABASE_URL is missing', async () => {
    delete process.env.DATABASE_URL;

    await expect(makeDependencies()).rejects.toThrow();
  });
});
