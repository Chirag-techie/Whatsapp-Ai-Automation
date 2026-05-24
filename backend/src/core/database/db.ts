import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

import { env } from "../config/env.js";
import { logger } from "../logger/logger.js";

export const queryClient = postgres(env.DATABASE_URL, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(queryClient);

export const connectDatabase = async () => {
  try {
    await queryClient`SELECT 1`;

    logger.info("PostgreSQL connected");
  } catch (error) {
    logger.error(
      { error },
      "Failed to connect PostgreSQL"
    );

    process.exit(1);
  }
};