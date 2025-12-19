import * as pg from 'pg';
import type { QueryResultRow } from 'pg';

export { DatabaseError, type QueryResultRow } from 'pg';

export type RowMapper<T> = (row: QueryResultRow) => T;

export interface QueryHandler<T, U = Array<string | string[] | number | boolean | null>> {
  query: string;
  bindVariables?: U;
  rowMapper?: RowMapper<T>;
}

export interface UpdateHandler {
  query: string;
  bindVariables?: unknown[];
}
export interface DatabaseCredentials {
  username: string;
  password: string;
}

interface RdsConfig {
  applicationName: string;
  connectionString: string;
  queryTimeout?: number;
  connectionTimeout?: number;
  useSSl?: boolean;
}

const { Client } = pg;

export const rdsClient = async ({
  applicationName,
  connectionString,
  queryTimeout = 10000,
  connectionTimeout = 30000,
  useSSl = true,
}: RdsConfig) => {
  const client = new Client({
    connectionString,
    application_name: applicationName,
    query_timeout: queryTimeout,
    connectionTimeoutMillis: connectionTimeout,
    ssl: useSSl
      ? {
          rejectUnauthorized: false,
        }
      : false,
  });

  await client.connect();

  const query = async (query: string, bindVariables?: unknown[]) => {
    return await client.query(query, bindVariables);
  };

  const querySingleRow = async <T>(handler: QueryHandler<T>): Promise<T> => {
    const result = await query(handler.query, handler.bindVariables);

    if (result.rows.length === 0) {
      throw new Error('No results found');
    }

    if (result.rows.length > 1) {
      throw new Error('More than expected number of results');
    }

    return handler.rowMapper ? result.rows.map(handler.rowMapper)[0] : result.rows[0];
  };

  const querySingleRowOptional = async <T>(handler: QueryHandler<T>): Promise<T | null> => {
    const result = await query(handler.query, handler.bindVariables);

    if (result.rows.length === 0) {
      return null;
    }

    if (result.rows.length > 1) {
      throw new Error('More than expected number of results');
    }

    return handler.rowMapper ? result.rows.map(handler.rowMapper)[0] : result.rows[0];
  };

  const queryMultipleRows = async <T>(handler: QueryHandler<T>): Promise<T[]> => {
    const result = await query(handler.query, handler.bindVariables);

    return handler.rowMapper ? result.rows.map(handler.rowMapper) : result.rows;
  };

  const update = async (handler: UpdateHandler): Promise<number> => {
    const result = await client.query(handler.query, handler.bindVariables);

    return result.rowCount ?? 0;
  };

  const beginTransaction = async (): Promise<void> => {
    await query('BEGIN');
  };

  const commitTransaction = async (): Promise<void> => {
    await query('COMMIT');
  };

  const rollbackTransaction = async (): Promise<void> => {
    await query('ROLLBACK');
  };

  const closeConnection = async (): Promise<void> => {
    await client.end();
  };

  return {
    querySingleRow,
    querySingleRowOptional,
    queryMultipleRows,
    update,
    closeConnection,
    beginTransaction,
    commitTransaction,
    rollbackTransaction,
  };
};

export type DbClient = Awaited<ReturnType<typeof rdsClient>>;
