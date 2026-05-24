import { Queue } from "bullmq";

import { redis } from "../redis/redis.js";
import type { WhatsAppWebhookJob } from "./queue.types.js";

export const WHATSAPP_QUEUE_NAME = "whatsapp-messages";

export const whatsappQueue = new Queue<WhatsAppWebhookJob>(
  WHATSAPP_QUEUE_NAME,
  {
    connection: redis,
    defaultJobOptions: {
      attempts: 3,
      removeOnComplete: 100,
      removeOnFail: 500,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
    },
  }
);