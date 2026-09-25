export function getDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL is not set',
    );
  }
  return databaseUrl;
}

export function getSslConfig(databaseUrl: string) {
  return databaseUrl.includes('sslmode=require') ? { rejectUnauthorized: false } : false;
}
