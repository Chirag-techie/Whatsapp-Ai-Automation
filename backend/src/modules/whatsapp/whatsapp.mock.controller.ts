import crypto from "crypto";

import type { Request, Response } from "express";

import { logger } from "../../core/logger/logger.js";

import { whatsappService } from "./whatsapp.service.js";

export async function simulateInbound(
  req: Request,
  res: Response,
) {
  try {
    const {
      phone,
      name,
      text,
    } = req.body;

    // Basic validation
    if (!phone || !text) {
      return res.status(400).json({
        success: false,
        message:
          "phone and text are required",
      });
    }

    // Generate unique WhatsApp-style message ID
    const whatsappMessageId =
      "duplicate-t123";

    // Construct realistic Meta webhook payload
    const payload = {
      object: "whatsapp_business_account",

      entry: [
        {
          id: "mock-waba-id",

          changes: [
            {
              field: "messages",

              value: {
                messaging_product:
                  "whatsapp",

                metadata: {
                  display_phone_number:
                    "15551234567",

                  phone_number_id:
                    "mock-phone-number-id",
                },

                contacts: [
                  {
                    profile: {
                      name:
                        name ??
                        "Mock User",
                    },

                    wa_id: phone,
                  },
                ],

                messages: [
                  {
                    from: phone,

                    id: whatsappMessageId,

                    timestamp: Math.floor(
                      Date.now() / 1000,
                    ).toString(),

                    type: "text",

                    text: {
                      body: text,
                    },
                  },
                ],
              },
            },
          ],
        },
      ],
    };

    // Push payload into canonical queue flow
    await whatsappService.enqueueWebhook(
      whatsappMessageId,
      payload,
    );

    logger.info(
      {
        whatsappMessageId,
        phone,
      },
      "Mock WhatsApp webhook queued",
    );

    return res.status(200).json({
      success: true,

      message:
        "Mock webhook queued successfully",

      whatsappMessageId,
    });
  } catch (error) {
    logger.error(
      {
        error,
      },
      "Mock webhook simulation failed",
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to simulate webhook",
    });
  }
}