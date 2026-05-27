import { z } from "zod";

import { logger } from "../../../core/logger/logger.js";

import type { ParsedWhatsAppMessage } from "../../../shared/types/whatsapp.types.js";

const parsedMessageSchema = z.object({
  whatsappMessageId: z.string(),
  senderPhone: z.string(),
  senderProfileName: z.string().default("Unknown"),
  messageType: z.string(),
  textBody: z.string().default(""),
  timestamp: z.string(),
  raw: z.unknown(),
});

export const webhookParserService = {
  parse(payload: unknown): ParsedWhatsAppMessage | null {
    try {
      const body = payload as any;

      const value = body?.entry?.[0]?.changes?.[0]?.value;

      const message = value?.messages?.[0];

      // Ignore status updates, delivery receipts, etc.
      if (!message) {
        return null;
      }

      const contact = value?.contacts?.[0];

      const parsed = parsedMessageSchema.parse({
        whatsappMessageId: message?.id,
        senderPhone: message?.from,
        senderProfileName:
          contact?.profile?.name ??
          contact?.wa_id ??
          "Unknown",
        messageType: message?.type ?? "unknown",
        textBody: message?.text?.body ?? "",
        timestamp: message?.timestamp ?? new Date().toISOString(),
        raw: payload,
      });

      return parsed;
    } catch (error) {
      logger.warn(
        {
          error,
          payload,
        },
        "Failed to parse WhatsApp webhook payload",
      );

      return null;
    }
  },
};