import type { QueryResultRow } from "pg";

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
