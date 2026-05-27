import type {
  PgTransaction,
} from "drizzle-orm/pg-core";

import type {
  PostgresJsDatabase,
} from "drizzle-orm/postgres-js";

import type {
  PostgresJsQueryResultHKT,
} from "drizzle-orm/postgres-js";

import type { db }
from "../../core/database/db.js";

export type DbClient =
  typeof db;

export type DbTransaction =
  PgTransaction<
    PostgresJsQueryResultHKT,
    Record<string, never>,
    Record<string, never>
  >;

export type DbExecutor =
  | DbClient
  | DbTransaction;