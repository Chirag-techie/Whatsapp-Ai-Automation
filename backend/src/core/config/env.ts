import { config } from "dotenv";
import { z } from "zod";

config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  PORT: z.coerce.number().default(3000),

  DATABASE_URL: z.string().min(1),

  REDIS_URL: z.string().min(1),

  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace"])
    .default("info"),

  API_PREFIX: z.string().default("/api/v1"),

  GOOGLE_API_KEY: z.string().min(1),

  WHATSAPP_VERIFY_TOKEN: z.string().min(1),

  WHATSAPP_APP_SECRET: z.string().min(1),
});

export const env = envSchema.parse(process.env);