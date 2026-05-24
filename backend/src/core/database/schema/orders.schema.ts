import {
  integer,
  numeric,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { customers } from "./customers.schema.js";

export const orderStatusEnum = pgEnum(
  "order_status",
  [
    "PENDING",
    "CONFIRMED",
    "PAID",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
  ]
);

export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),

  customerId: uuid("customer_id")
    .notNull()
    .references(() => customers.id, {
      onDelete: "cascade",
    }),

  totalAmount: numeric("total_amount", {
    precision: 12,
    scale: 2,
  }).notNull(),

  status: orderStatusEnum("status")
    .default("PENDING")
    .notNull(),

  cartVersion: integer("cart_version")
    .default(1)
    .notNull(),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});