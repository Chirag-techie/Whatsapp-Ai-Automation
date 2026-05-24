import {
  integer,
  numeric,
  pgTable,
  text,
  uuid,
} from "drizzle-orm/pg-core";

import { orders } from "./orders.schema.js";

export const orderItems = pgTable("order_items", {
  id: uuid("id").defaultRandom().primaryKey(),

  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, {
      onDelete: "cascade",
    }),

  sku: text("sku").notNull(),

  name: text("name").notNull(),

  quantity: integer("quantity")
    .notNull(),

  unitPrice: numeric("unit_price", {
    precision: 12,
    scale: 2,
  }).notNull(),
});