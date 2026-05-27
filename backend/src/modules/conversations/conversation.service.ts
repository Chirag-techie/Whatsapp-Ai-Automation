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
    executor = db,
  ) {
    const existingConversation =
      await executor
        .select()
        .from(conversations)
        .where(
          and(
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
        )
        .limit(1);

    // IMPORTANT:
    // select().from() returns array
    if (
      existingConversation.length > 0
    ) {
      return existingConversation[0];
    }

    const createdConversation =
      await executor
        .insert(conversations)
        .values({
          customerId,
          state: "BOT_ACTIVE",
          summary: null,
        })
        .returning();

    return createdConversation[0];
  },
};