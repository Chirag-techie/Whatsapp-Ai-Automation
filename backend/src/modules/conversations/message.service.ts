import { db } from "../../core/database/db.js";

import { messages } from "../../core/database/schema/index.js";

import { logger } from "../../core/logger/logger.js";

interface SaveInboundMessageInput {
  customerId: string;
  conversationId: string;
  whatsappMessageId: string;
  role: "user";
  content: unknown;
}

export const messageService = {
  async saveInboundMessage(data: SaveInboundMessageInput) {
    const result = await db
      .insert(messages)
      .values({
        customerId: data.customerId,
        conversationId: data.conversationId,
        whatsappMessageId: data.whatsappMessageId,
        role: data.role,
        content: data.content,
      })
      .onConflictDoNothing({
        target: messages.whatsappMessageId,
      })
      .returning({
        id: messages.id,
      });

    if (result.length === 0) {
      logger.warn(
        {
          whatsappMessageId: data.whatsappMessageId,
        },
        "Duplicate inbound message ignored",
      );

      return null;
    }

    return result[0];
  },
};