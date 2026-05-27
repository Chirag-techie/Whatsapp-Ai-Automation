import type {
  PostgresJsDatabase,
} from "drizzle-orm/postgres-js";

import type {
  PgTransaction,
} from "drizzle-orm/pg-core";

import type {
  ExtractTablesWithRelations,
} from "drizzle-orm";

export type DbSchema =
  Record<string, never>;

export type DbClient =
  PostgresJsDatabase<DbSchema>;

export type DbTransaction =
  PgTransaction<
    any,
    DbSchema,
    ExtractTablesWithRelations<DbSchema>
  >;

export type DbExecutor =
  | DbClient
  | DbTransaction;