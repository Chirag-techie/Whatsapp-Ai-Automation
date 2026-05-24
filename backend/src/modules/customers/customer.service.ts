import { db } from "../../core/database/db.js";
import { customers } from "../../core/database/schema/index.js";

export const customerService = {
  async upsertCustomer(
    whatsappId: string,
    name: string,
  ) {
    const result = await db
      .insert(customers)
      .values({
        whatsappId,
        name,
        phone: whatsappId,
      })
      .onConflictDoUpdate({
        target: customers.whatsappId,
        set: {
          name,
        },
      })
      .returning();

    return result[0];
  },
};