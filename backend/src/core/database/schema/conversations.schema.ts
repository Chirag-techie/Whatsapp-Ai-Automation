import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { customers } from "./customers.schema.js";

export const conversationStateEnum = pgEnum(
  "conversation_state",
  [
    "BOT_ACTIVE",
    "HUMAN_ACTIVE",
    "SYSTEM_LOCKED",
  ],
);

export const conversations = pgTable("conversations", {
  id: uuid("id").defaultRandom().primaryKey(),

  customerId: uuid("customer_id")
    .notNull()
    .references(() => customers.id, {
      onDelete: "cascade",
    }),

  summary: text("summary"),

  state: conversationStateEnum("state")
    .default("BOT_ACTIVE")
    .notNull(),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});