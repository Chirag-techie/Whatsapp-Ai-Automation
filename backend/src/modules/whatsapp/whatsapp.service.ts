import { logger } from "../../core/logger/logger.js";
import { whatsappQueue } from "../../core/queue/queues.js";

class WhatsAppService {
  async enqueueWebhook(
    whatsappMessageId: string | undefined,
    payload: unknown
  ) {
    await whatsappQueue.add(
      "incoming-message",
      {
        whatsappMessageId,
        payload,
      },
      {
        jobId: whatsappMessageId,
      }
    );

    logger.info(
      {
        whatsappMessageId,
      },
      "Webhook payload added to queue"
    );
  }

  async processMessage(jobData: unknown) {
    logger.info(
      {
        jobData,
      },
      "Processing WhatsApp message"
    );
  }
}

export const whatsappService = new WhatsAppService();