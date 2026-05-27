import crypto from "crypto";

import type {
  Request,
  Response,
} from "express";

import { env } from "../../core/config/env.js";

import { logger } from "../../core/logger/logger.js";

import { whatsappService } from "./whatsapp.service.js";

export async function verifyWebhook(
  req: Request,
  res: Response,
) {
  const mode = req.query["hub.mode"];

  const token =
    req.query["hub.verify_token"];

  const challenge =
    req.query["hub.challenge"];

  if (
    mode === "subscribe" &&
    token === env.WHATSAPP_VERIFY_TOKEN
  ) {
    logger.info(
      "WhatsApp webhook verified",
    );

    return res.status(200).send(
      challenge,
    );
  }

  return res.sendStatus(403);
}

export async function handleWebhook(
  req: Request,
  res: Response,
) {
  try {
    if (!req.rawBody) {
      logger.warn(
        "Missing raw request body",
      );

      return res.status(400).json({
        success: false,
        message: "Missing raw body",
      });
    }

    const signatureHeader =
      req.header(
        "x-hub-signature-256",
      );

    if (!signatureHeader) {
      return res.status(401).json({
        success: false,
        message:
          "Missing signature header",
      });
    }

    const receivedSignature =
      signatureHeader.replace(
        "sha256=",
        "",
      );

    const expectedSignature = crypto
      .createHmac(
        "sha256",
        env.WHATSAPP_APP_SECRET,
      )
      .update(req.rawBody)
      .digest("hex");

    const receivedBuffer =
      Buffer.from(
        receivedSignature,
        "hex",
      );

    const expectedBuffer =
      Buffer.from(
        expectedSignature,
        "hex",
      );

    if (
      receivedBuffer.length !==
        expectedBuffer.length ||
      !crypto.timingSafeEqual(
        receivedBuffer,
        expectedBuffer,
      )
    ) {
      logger.warn(
        "Invalid webhook signature",
      );

      return res.status(401).json({
        success: false,
        message: "Invalid signature",
      });
    }

    let whatsappMessageId:
      | string
      | undefined;

    try {
      const body = req.body;

      whatsappMessageId =
        body?.entry?.[0]?.changes?.[0]
          ?.value?.messages?.[0]?.id;
    } catch (error) {
      logger.warn(
        {
          error,
        },
        "Failed to extract WhatsApp message ID",
      );
    }

    await whatsappService.enqueueWebhook(
      whatsappMessageId,
      req.body,
    );

    return res.sendStatus(200);
  } catch (error) {
    logger.error(
      {
        error,
      },
      "Webhook processing failed",
    );

    return res.status(500).json({
      success: false,
      message:
        "Internal server error",
    });
  }
}