import { db } from "../../core/database/db.js";

import { logger } from "../../core/logger/logger.js";

import { webhookParserService } from "../../modules/whatsapp/services/webhook-parser.service.js";

import { customerService } from "../../modules/customers/customer.service.js";

import { conversationService } from "../../modules/conversations/conversation.service.js";

import { messageService } from "../../modules/conversations/message.service.js";

import { aiService } from "../../modules/ai/ai.service.js";

export const messageOrchestrator = {
  async processIncomingWebhook(
    payload: unknown,
  ) {
    // STEP 1: Parse payload
    const parsedMessage =
      webhookParserService.parse(
        payload,
      );

    // STEP 2: Ignore unsupported events
    if (!parsedMessage) {
      logger.warn(
        "Webhook payload skipped",
      );

      return;
    }

    let customerId!: string;

    let conversationId!: string;

    // IMPORTANT:
    // Return transaction result
    // to avoid duplicate AI replies.
    const isNewMessage =
      await db.transaction(
        async (tx) => {
          // STEP 3: Upsert customer
          const customer =
            await customerService.upsertCustomer(
              parsedMessage.senderPhone,
              parsedMessage.senderProfileName,
              tx,
            );

          customerId = customer.id;

          // STEP 4: Resolve conversation
          const conversation =
            await conversationService.resolveActiveConversation(
              customer.id,
              tx,
            );

          conversationId =
            conversation.id;

          // STEP 5: Save inbound
          const savedMessage =
            await messageService.saveMessage(
              {
                customerId:
                  customer.id,
                conversationId:
                  conversation.id,
                whatsappMessageId:
                  parsedMessage.whatsappMessageId,
                role: "user",
                content: {
                  type:
                    parsedMessage.messageType,
                  text:
                    parsedMessage.textBody,
                  timestamp:
                    parsedMessage.timestamp,
                  raw:
                    parsedMessage.raw,
                },
              },
              tx,
            );

          // IMPORTANT:
          // Explicit transaction result.
          if (!savedMessage) {
            logger.warn(
              {
                whatsappMessageId:
                  parsedMessage.whatsappMessageId,
              },
              "Duplicate message detected",
            );

            return false;
          }

          logger.info(
            {
              messageId:
                savedMessage.id,
              customerId,
              conversationId,
              whatsappMessageId:
                parsedMessage.whatsappMessageId,
            },
            "Inbound message processed successfully",
          );

          return true;
        },
      );

    // IMPORTANT:
    // Prevent duplicate AI generation.
    if (!isNewMessage) {
      return;
    }

    // STEP 6:
    // AI generation OUTSIDE transaction.
    try {
      const aiReply =
        await aiService.generateReply(
          parsedMessage.textBody,
        );

      // STEP 7:
      // Save assistant response.
      await messageService.saveMessage({
        customerId,
        conversationId,
        role: "assistant",
        content: {
          type: "text",
          text: aiReply,
          generatedAt:
            new Date().toISOString(),
        },
      });

      logger.info(
        {
          customerId,
          conversationId,
        },
        "AI response generated successfully",
      );
    } catch (error) {
      // IMPORTANT:
      // AI failure must NOT rollback
      // inbound message persistence.
      logger.error(
        {
          error,
          customerId,
          conversationId,
        },
        "AI response generation failed",
      );
    }
  },
};