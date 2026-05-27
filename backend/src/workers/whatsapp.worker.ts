import { Worker, Job } from "bullmq";

import { redis }
from "../core/redis/redis.js";

import { logger }
from "../core/logger/logger.js";

import {
  WHATSAPP_QUEUE_NAME,
} from "../core/queue/queues.js";

import type {
  WhatsAppWebhookJob,
} from "../core/queue/queue.types.js";

import { messageOrchestrator }
from "../application/orchestrators/message.orchestrator.js";

export const whatsappWorker =
  new Worker<WhatsAppWebhookJob>(
    WHATSAPP_QUEUE_NAME,

    async (
      job: Job<WhatsAppWebhookJob>,
    ) => {
      logger.info(
        {
          jobId: job.id,
        },
        "Processing WhatsApp webhook job",
      );

      await messageOrchestrator.processIncomingWebhook(
        job.data.payload,
      );
    },

    {
      connection: redis,
    },
  );

whatsappWorker.on(
  "completed",
  (job) => {
    logger.info(
      {
        jobId: job.id,
      },
      "WhatsApp worker job completed",
    );
  },
);

whatsappWorker.on(
  "failed",
  (job, error) => {
    logger.error(
      {
        jobId: job?.id,
        error,
      },
      "WhatsApp worker job failed",
    );
  },
);