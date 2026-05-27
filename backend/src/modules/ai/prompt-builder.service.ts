import type {
  Content,
} from "@google/genai";

import type {
  MessageContent,
  MessageRole,
} from "../../shared/types/message.types.js";

interface HistoryMessage {
  role: MessageRole;

  content: MessageContent;
}

interface NormalizedMessage {
  role: "user" | "model";

  text: string;
}

export const promptBuilderService = {
  buildConversationPrompt(
    history: HistoryMessage[],
  ): Content[] {
    const normalizedMessages: NormalizedMessage[] =
      [];

    for (const message of history) {
      // Ignore unsupported content
      if (
        message.content.type !== "text"
      ) {
        continue;
      }

      // Ignore system messages for now
      if (
        message.role === "system"
      ) {
        continue;
      }

      const mappedRole =
        message.role === "assistant"
          ? "model"
          : "user";

      const lastMessage =
        normalizedMessages[
          normalizedMessages.length - 1
        ];

      // Merge consecutive same-role messages
      if (
        lastMessage &&
        lastMessage.role === mappedRole
      ) {
        lastMessage.text += `\n${message.content.text}`;

        continue;
      }

      normalizedMessages.push({
        role: mappedRole,
        text: message.content.text,
      });
    }

    return normalizedMessages.map(
      (message) => ({
        role: message.role,

        parts: [
          {
            text: message.text,
          },
        ],
      }),
    );
  },
};