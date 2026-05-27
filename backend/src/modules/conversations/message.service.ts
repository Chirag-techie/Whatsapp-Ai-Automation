import {
  desc,
  eq,
} from "drizzle-orm";

import { db } from "../../core/database/db.js";

import { messages }
from "../../core/database/schema/index.js";

import { logger }
from "../../core/logger/logger.js";

import type {
  MessageContent,
  MessageRole,
} from "../../shared/types/message.types.js";

interface SaveMessageInput {
  customerId: string;

  conversationId: string;

  role: MessageRole;

  content: MessageContent;

  whatsappMessageId?: string;
}

export const messageService = {
  async saveMessage(
    data: SaveMessageInput,
    executor: typeof db = db,
  ) {
    const result = await executor
      .insert(messages)
      .values({
        customerId: data.customerId,
        conversationId: data.conversationId,
        whatsappMessageId:
          data.whatsappMessageId ?? null,
        role: data.role,
        content: data.content,
      })
      .onConflictDoNothing({
        target:
          messages.whatsappMessageId,
      })
      .returning({
        id: messages.id,
      });

    if (
      data.whatsappMessageId &&
      result.length === 0
    ) {
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

  async getConversationHistory(
    conversationId: string,
    limit: number = 10,
  ) {
    const history = await db
      .select()
      .from(messages)
      .where(
        eq(
          messages.conversationId,
          conversationId,
        ),
      )
      .orderBy(
        desc(messages.createdAt),
      )
      .limit(limit);

    return history
      .reverse()
      .map((message) => ({
        ...message,
        content:
          message.content as MessageContent,
      }));
  },
};