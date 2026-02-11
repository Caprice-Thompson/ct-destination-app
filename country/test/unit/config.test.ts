import { makeConfig } from "@infrastructure/config";

describe("makeConfig", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should create config from environment variables", async () => {
    process.env.DATABASE_URL = "postgresql://user:pass@localhost:5432/db";
    process.env.NODE_ENV = "development";

    const config = await makeConfig();

    expect(config.database.connectionString).toBe(
      "postgresql://user:pass@localhost:5432/db",
    );
    expect(config.service.name).toBe("country-service");
    expect(config.isTestEnv).toBe(false);
  });

  it("should use default timeout values", async () => {
    process.env.DATABASE_URL = "postgresql://localhost/db";

    const config = await makeConfig();

    expect(config.database.queryTimeout).toBe(10000);
    expect(config.database.connectionTimeout).toBe(30000);
  });

  it("should use custom timeout values when provided", async () => {
    process.env.DATABASE_URL = "postgresql://localhost/db";
    process.env.DB_QUERY_TIMEOUT = "5000";
    process.env.DB_CONNECTION_TIMEOUT = "15000";

    const config = await makeConfig();

    expect(config.database.queryTimeout).toBe(5000);
    expect(config.database.connectionTimeout).toBe(15000);
  });

  it("should enable SSL in production", async () => {
    process.env.DATABASE_URL = "postgresql://localhost/db";
    process.env.NODE_ENV = "production";

    const config = await makeConfig();

    expect(config.database.useSSL).toBe(true);
  });

  it("should enable SSL when explicitly set", async () => {
    process.env.DATABASE_URL = "postgresql://localhost/db";
    process.env.DB_USE_SSL = "true";

    const config = await makeConfig();

    expect(config.database.useSSL).toBe(true);
  });

  it("should disable SSL in development by default", async () => {
    process.env.DATABASE_URL = "postgresql://localhost/db";
    process.env.NODE_ENV = "development";

    const config = await makeConfig();

    expect(config.database.useSSL).toBe(false);
  });

  it("should identify test environment", async () => {
    process.env.DATABASE_URL = "postgresql://localhost/db";
    process.env.NODE_ENV = "test";

    const config = await makeConfig();

    expect(config.isTestEnv).toBe(true);
  });

  it("should throw error when DATABASE_URL is missing", async () => {
    process.env.DATABASE_URL = undefined;

    await expect(makeConfig()).rejects.toThrow();
  });
});
