import { app } from "./app.js";

import { env } from "./core/config/env.js";

import { logger } from "./core/logger/logger.js";

import { connectDatabase }
from "./core/database/db.js";

import "./core/redis/redis.js";

const startServer = async () => {
  await connectDatabase();

  app.listen(env.PORT, () => {
    logger.info(
      `HTTP server running on port ${env.PORT}`,
    );
  });
};

startServer().catch((error) => {
  logger.error(
    {
      error,
    },
    "Failed to start server",
  );

  process.exit(1);
});