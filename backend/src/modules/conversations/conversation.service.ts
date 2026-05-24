import {
  and,
  eq,
  inArray,
} from "drizzle-orm";

import { db } from "../../core/database/db.js";

import {
  conversations,
} from "../../core/database/schema/index.js";

export const conversationService = {
  async resolveActiveConversation(
    customerId: string,
  ) {
    const existingConversation =
      await db.query.conversations.findFirst({
        where: and(
          eq(
            conversations.customerId,
            customerId,
          ),
          inArray(
            conversations.state,
            [
              "BOT_ACTIVE",
              "HUMAN_ACTIVE",
            ],
          ),
        ),
      });

    if (existingConversation) {
      return existingConversation;
    }

    const createdConversation =
      await db
        .insert(conversations)
        .values({
          customerId,
          state: "BOT_ACTIVE",
          summary: null,
        })
        .returning();

    return createdConversation[0];
  }
}