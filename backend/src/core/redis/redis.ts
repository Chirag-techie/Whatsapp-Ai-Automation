import Redis from "ioredis";
import { env } from "../config/env.js";
import { logger } from "../logger/logger.js";

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,

  retryStrategy: (times: number) => {
    return Math.min(times * 100, 3000);
  },
});

redis.on("connect", () => {
  logger.info("Redis connected");
});

redis.on("error", (error: Error) => {
  logger.error({ error }, "Redis connection error");
});