import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';
import { logger } from '@infrastructure/logger';
import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

const ssmClient = new SSMClient({ region: process.env.AWS_REGION || 'eu-west-2' });

interface MigrationResult {
  success: boolean;
  migrationsApplied: number;
  errors?: string[];
  message: string;
}

const getSSMParameter = async (name: string, decrypt = false): Promise<string> => {
  const command = new GetParameterCommand({
    Name: name,
    WithDecryption: decrypt,
  });
  const response = await ssmClient.send(command);
  return response.Parameter?.Value || '';
};

export const handler = async (): Promise<MigrationResult> => {
  logger.info('Starting tourism database migrations...');

  try {
    const dbUsername = await getSSMParameter(process.env.DB_USERNAME_PARAM!, false);
    const dbPassword = await getSSMParameter(process.env.DB_PASSWORD_PARAM!, true);
    const dbHost = process.env.DB_HOST!;
    const dbPort = process.env.DB_PORT || '5432';
    const dbName = process.env.DB_NAME || 'tourism';

    const postgresClient = new Client({
      host: dbHost,
      port: parseInt(dbPort),
      database: 'postgres',
      user: dbUsername,
      password: dbPassword,
      ssl: {
        rejectUnauthorized: false,
      },
    });

    await postgresClient.connect();
    logger.info('Connected to postgres database');

    const dbCheckResult = await postgresClient.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]);

    if (dbCheckResult.rows.length === 0) {
      logger.info(`Database ${dbName} does not exist, creating...`);
      await postgresClient.query(`CREATE DATABASE ${dbName}`);
      logger.info(`Database ${dbName} created successfully`);
    }

    await postgresClient.end();

    const client = new Client({
      host: dbHost,
      port: parseInt(dbPort),
      database: dbName,
      user: dbUsername,
      password: dbPassword,
      ssl: {
        rejectUnauthorized: false,
      },
    });

    await client.connect();
    logger.info(`Connected to ${dbName} database`);

    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        version VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const appliedResult = await client.query('SELECT version FROM schema_migrations ORDER BY version');
    const appliedMigrations = new Set(appliedResult.rows.map((row) => row.version));

    logger.info(`Found ${appliedMigrations.size} applied migrations`);

    const migrationsPath = path.join(__dirname, 'migrations');

    if (!fs.existsSync(migrationsPath)) {
      logger.info('No migrations directory found');
      await client.end();
      return {
        success: true,
        migrationsApplied: 0,
        message: 'No migrations directory found',
      };
    }

    const files = fs
      .readdirSync(migrationsPath)
      .filter((f: string) => f.endsWith('.sql'))
      .sort();

    logger.info(`Found ${files.length} migration files`);

    let migrationsApplied = 0;
    const errors: string[] = [];

    for (const file of files) {
      const filename = path.basename(file, '.sql');

      if (appliedMigrations.has(filename)) {
        logger.info(`Skipping already applied migration: ${filename}`);
        continue;
      }

      try {
        logger.info(`Applying migration: ${filename}`);

        const sql = fs.readFileSync(path.join(migrationsPath, file), 'utf8');

        await client.query('BEGIN');
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (version, name) VALUES ($1, $2)', [filename, filename]);
        await client.query('COMMIT');

        logger.info(`Successfully applied migration: ${filename}`);
        migrationsApplied++;
      } catch (error) {
        await client.query('ROLLBACK');
        const errorMessage = `Failed to apply migration ${filename}: ${error}`;
        logger.error(errorMessage);
        errors.push(errorMessage);
      }
    }

    await client.end();

    if (errors.length > 0) {
      return {
        success: false,
        migrationsApplied,
        errors,
        message: `Applied ${migrationsApplied} migrations, ${errors.length} failed`,
      };
    }

    return {
      success: true,
      migrationsApplied,
      message:
        migrationsApplied > 0 ? `Successfully applied ${migrationsApplied} migrations` : 'No new migrations to apply',
    };
  } catch (error) {
    logger.error('Migration error:', error);
    return {
      success: false,
      migrationsApplied: 0,
      errors: [String(error)],
      message: 'Migration failed',
    };
  }
};
