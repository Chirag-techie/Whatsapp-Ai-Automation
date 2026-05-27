import { db } from "../../core/database/db.js";

import { messages } from "../../core/database/schema/index.js";

import { logger } from "../../core/logger/logger.js";

type MessageRole =
  | "user"
  | "assistant"
  | "system";

interface SaveMessageInput {
  customerId: string;

  conversationId: string;

  role: MessageRole;

  content: unknown;

  whatsappMessageId?: string;
}

export const messageService = {
  async saveMessage(
    data: SaveMessageInput,
    executor = db,
  ) {
    const result = await executor
      .insert(messages)
      .values({
        customerId: data.customerId,
        conversationId:
          data.conversationId,
        whatsappMessageId:
          data.whatsappMessageId,
        role: data.role,
        content: data.content,
      })
      // IMPORTANT:
      // Drizzle query builders are immutable.
      // Chain directly.
      //
      // Safe because PostgreSQL UNIQUE
      // allows multiple NULL values.
      .onConflictDoNothing({
        target:
          messages.whatsappMessageId,
      })
      .returning({
        id: messages.id,
      });

    // Duplicate webhook delivery
    if (result.length === 0) {
      logger.warn(
        {
          whatsappMessageId:
            data.whatsappMessageId,
        },
        "Duplicate message ignored",
      );

      return null;
    }

    return result[0];
  },
};