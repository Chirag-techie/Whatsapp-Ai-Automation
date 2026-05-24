import { Queue } from "bullmq";

import { redis } from "./redis.js";

export const whatsappQueue = new Queue("whatsapp-messages", {
  connection: redis,
});

export const aiQueue = new Queue("ai-processing", {
  connection: redis,
});