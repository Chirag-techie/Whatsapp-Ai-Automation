// src/core/database/schema/messages.schema.ts

import {
  pgTable,
  uuid,
  text,
  timestamp,
  pgEnum,
  jsonb,
} from "drizzle-orm/pg-core";

import { customers } from "./customers.schema.js";
import { conversations } from "./conversations.schema.js";

export const messageRoleEnum = pgEnum("message_role", [
  "user",
  "assistant",
  "system",
]);

export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),

  customerId: uuid("customer_id")
    .notNull()
    .references(() => customers.id, {
      onDelete: "cascade",
    }),

  conversationId: uuid("conversation_id")
    .notNull()
    .references(() => conversations.id, {
      onDelete: "cascade",
    }),

  whatsappMessageId: text("whatsapp_message_id").unique(),

  role: messageRoleEnum("role").notNull(),

  // Flexible payload storage for:
  // text, buttons, images, AI structured responses, metadata, etc.
  content: jsonb("content").notNull(),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});