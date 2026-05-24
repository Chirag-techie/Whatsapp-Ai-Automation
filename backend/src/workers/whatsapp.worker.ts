import { Worker, Job } from "bullmq";

import { redis } from "../core/redis/redis.js";

import { logger } from "../core/logger/logger.js";

import { WHATSAPP_QUEUE_NAME } from "../core/queue/queues.js";

import type { WhatsAppWebhookJob } from "../core/queue/queue.types.js";

import { webhookParserService } from "../modules/whatsapp/services/webhook-parser.service.js";

import { customerService } from "../modules/customers/customer.service.js";

import { conversationService } from "../modules/conversations/conversation.service.js";

import { messageService } from "../modules/conversations/message.service.js";

export const whatsappWorker = new Worker<WhatsAppWebhookJob>(
  WHATSAPP_QUEUE_NAME,
  async (job: Job<WhatsAppWebhookJob>) => {
    logger.info(
      {
        jobId: job.id,
      },
      "Processing WhatsApp webhook job",
    );

    // STEP 1: Parse webhook payload
    const parsedMessage = webhookParserService.parse(
      job.data.payload,
    );

    // STEP 2: Ignore unsupported webhook events
    if (!parsedMessage) {
      logger.warn(
        {
          jobId: job.id,
        },
        "Webhook payload skipped",
      );

      return;
    }

    // STEP 3: Upsert customer
    const customer = await customerService.upsertCustomer(
      parsedMessage.senderPhone,
      parsedMessage.senderProfileName,
    );

    // STEP 4: Resolve active conversation
    const conversation =
      await conversationService.resolveActiveConversation(
        customer.id,
      );

    // STEP 5: Persist inbound message
    const savedMessage =
      await messageService.saveInboundMessage({
        customerId: customer.id,
        conversationId: conversation.id,
        whatsappMessageId:
          parsedMessage.whatsappMessageId,
        role: "user",
        content: {
          type: parsedMessage.messageType,
          text: parsedMessage.textBody,
          timestamp: parsedMessage.timestamp,
          raw: parsedMessage.raw,
        },
      });

    // STEP 6: Stop duplicate processing
    if (!savedMessage) {
      logger.warn(
        {
          whatsappMessageId:
            parsedMessage.whatsappMessageId,
        },
        "Duplicate message detected, skipping further processing",
      );

      return;
    }

    logger.info(
      {
        messageId: savedMessage.id,
        whatsappMessageId:
          parsedMessage.whatsappMessageId,
        customerId: customer.id,
        conversationId: conversation.id,
      },
      "Inbound WhatsApp message saved successfully",
    );
  },
  {
    connection: redis,
  },
);

whatsappWorker.on("completed", (job) => {
  logger.info(
    {
      jobId: job.id,
    },
    "WhatsApp worker job completed",
  );
});

whatsappWorker.on("failed", (job, error) => {
  logger.error(
    {
      jobId: job?.id,
      error,
    },
    "WhatsApp worker job failed",
  );
});