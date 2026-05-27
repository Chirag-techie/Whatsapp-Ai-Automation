import {
  asc,
  eq,
} from "drizzle-orm";

import { db }
from "../../core/database/db.js";

import { messages }
from "../../core/database/schema/index.js";

import type {DbExecutor,} from "../../core/database/types.js";

import { logger }
from "../../core/logger/logger.js";

interface SaveMessageInput {
  customerId: string;

  conversationId: string;

  role: "user" | "assistant";

  content: unknown;

  whatsappMessageId?: string;
}

export const messageService = {
  async saveMessage(
    data: SaveMessageInput,
    executor: DbExecutor = db,
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
        "Duplicate inbound message ignored",
      );

      return null;
    }

    return result[0];
  },

  async getConversationHistory(
    conversationId: string,
    limit = 10,
  ) {
    return db
      .select()
      .from(messages)
      .where(
        eq(
          messages.conversationId,
          conversationId,
        ),
      )
      .orderBy(
        asc(messages.createdAt),
      )
      .limit(limit);
  },
};