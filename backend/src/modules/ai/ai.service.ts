import {
  GoogleGenAI,
  type Content,
} from "@google/genai";

import { env }
from "../../core/config/env.js";

import { logger }
from "../../core/logger/logger.js";

const ai = new GoogleGenAI({
  apiKey: env.GOOGLE_API_KEY,
});

const SYSTEM_PROMPT = `
You are Sakhi Bazaar's AI assistant.

Rules:
- Be helpful
- Be concise
- Be professional
- Keep replies suitable for WhatsApp chat
- Avoid markdown formatting
`;

export const aiService = {
  async generateReply(
    contents: Content[],
  ): Promise<string> {
    try {
      const response =
        await ai.models.generateContent({
          model: "gemini-2.5-flash",

          contents,

          config: {
            systemInstruction:
              SYSTEM_PROMPT,
          },
        });

      return (
        response.text ??
        "I'm sorry, I could not process your request right now."
      );
    } catch (error) {
      logger.error(
        {
          error,
        },
        "Gemini AI generation failed",
      );

      throw error;
    }
  },
};