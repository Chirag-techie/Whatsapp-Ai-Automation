import { GoogleGenAI } from "@google/genai";

import { env } from "../../core/config/env.js";

import { logger } from "../../core/logger/logger.js";

const ai = new GoogleGenAI({
  apiKey: env.GOOGLE_API_KEY,
});

export const aiService = {
  async generateReply(
    text: string,
  ): Promise<string> {
    try {
      const response =
        await ai.models.generateContent({
          model: "models/gemini-2.5-flash",
          contents: `
You are Sakhi Bazaar's AI assistant.

Rules:
- Be helpful
- Be concise
- Be professional
- Keep replies suitable for WhatsApp chat
- Avoid markdown formatting

Customer message:
${text}
`,
        });

      return (
        response.text ??
        "I'm sorry, I could not process your request right now."
      );
    } catch (error: any) {
      logger.error(
        {
          message: error?.message,
          status: error?.status,
          stack: error?.stack,
          details: error,
        },
        "Gemini AI generation failed",
      );

      throw error;
    }
  },
};