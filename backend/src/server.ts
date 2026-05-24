import { createServer } from "http";

import app from "./app.js";

import { env } from "./core/config/env.js";

import {
  connectDatabase,
  queryClient,
} from "./core/database/db.js";

import { logger } from "./core/logger/logger.js";

import { redis } from "./core/redis/redis.js";

const server = createServer(app);

const startServer = async () => {
  try {
    await connectDatabase();

    server.listen(env.PORT, () => {
      logger.info(
        `Server running on port ${env.PORT}`
      );
    });
  } catch (error) {
    logger.error(
      { error },
      "Failed to start server"
    );

    process.exit(1);
  }
};

const shutdown = async (signal: string) => {
  logger.info(
    `${signal} received. Shutting down gracefully...`
  );

  try {
    server.close(async () => {
      await queryClient.end();

      await redis.quit();

      logger.info("All connections closed");

      process.exit(0);
    });
  } catch (error) {
    logger.error(
      { error },
      "Error during shutdown"
    );

    process.exit(1);
  }
};

process.on("SIGINT", () => shutdown("SIGINT"));

process.on("SIGTERM", () => shutdown("SIGTERM"));

startServer();