import { db }
from "../../core/database/db.js";

import { logger }
from "../../core/logger/logger.js";

import { webhookParserService }
from "../../modules/whatsapp/services/webhook-parser.service.js";

import { customerService }
from "../../modules/customers/customer.service.js";

import { conversationService }
from "../../modules/conversations/conversation.service.js";

import { messageService }
from "../../modules/conversations/message.service.js";

import { aiService }
from "../../modules/ai/ai.service.js";

import { promptBuilderService }
from "../../modules/ai/prompt-builder.service.js";

import type {
  MessageContent,
} from "../../shared/types/message.types.js";

const MAX_HISTORY_MESSAGES = 10;

export const messageOrchestrator = {
  async processIncomingWebhook(
    payload: unknown,
  ) {
    // STEP 1: Parse webhook payload
    const parsedMessage =
      webhookParserService.parse(payload);

    // STEP 2: Ignore unsupported events
    if (!parsedMessage) {
      logger.warn(
        "Webhook payload skipped",
      );

      return;
    }

    let customerRef:
      | Awaited<
          ReturnType<
            typeof customerService.upsertCustomer
          >
        >
      | undefined;

    let conversationRef:
      | Awaited<
          ReturnType<
            typeof conversationService.resolveActiveConversation
          >
        >
      | undefined;

    // STEP 3: Transaction boundary
    const isNewMessage =
      await db.transaction(
        async (tx) => {
          // STEP 4: Upsert customer
          const customer =
            await customerService.upsertCustomer(
              parsedMessage.senderPhone,
              parsedMessage.senderProfileName,
              tx,
            );

          customerRef = customer;

          // STEP 5: Resolve conversation
          const conversation =
            await conversationService.resolveActiveConversation(
              customer.id,
              tx,
            );

          conversationRef =
            conversation;

          // STEP 6: Persist inbound message
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
                  type: "text",

                  text:
                    parsedMessage.textBody,

                  timestamp:
                    parsedMessage.timestamp,

                  raw: parsedMessage.raw,
                } satisfies MessageContent,
              },
              tx,
            );

          // STEP 7: Stop duplicates
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

              customerId:
                customer.id,

              conversationId:
                conversation.id,

              whatsappMessageId:
                parsedMessage.whatsappMessageId,
            },
            "Inbound message processed successfully",
          );

          return true;
        },
      );

    // STEP 8: Stop AI for duplicates
    if (!isNewMessage) {
      return;
    }

    if (
      !customerRef ||
      !conversationRef
    ) {
      logger.error(
        "Transaction references missing",
      );

      return;
    }

    try {
      // STEP 9: Fetch memory
      const history =
        await messageService.getConversationHistory(
          conversationRef.id,
          MAX_HISTORY_MESSAGES,
        );

      // STEP 10: Build prompt
      const prompt =
        promptBuilderService.buildConversationPrompt(
          history,
        );

      // STEP 11: Generate AI response
      const aiReply =
        await aiService.generateReply(
          prompt,
        );

      logger.info(
        {
          customerId:
            customerRef.id,

          conversationId:
            conversationRef.id,
        },
        "AI response generated successfully",
      );

      // STEP 12: Persist assistant reply
      await messageService.saveMessage({
        customerId:
          customerRef.id,

        conversationId:
          conversationRef.id,

        role: "assistant",

        content: {
          type: "text",

          text: aiReply,
        },
      });
    } catch (error) {
      logger.error(
        {
          customerId:
            customerRef.id,

          conversationId:
            conversationRef.id,

          error,
        },
        "AI response generation failed",
      );
    }
  },
};