import { Redis } from "ioredis";

import { env } from "../config/env.js";

import { logger } from "../logger/logger.js";

export const redis = new Redis(
  env.REDIS_URL,
  {
    maxRetriesPerRequest: null,
  },
);

redis.on("connect", () => {
  logger.info("Redis connected");
});

redis.on("error", (error) => {
  logger.error(
    {
      error,
    },
    "Redis connection error",
  );
});