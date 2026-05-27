export type MessageRole =
  | "user"
  | "assistant"
  | "system";

export interface UserTextMessageContent {
  type: "text";

  text: string;

  timestamp: string;

  raw?: unknown;
}

export interface AssistantTextMessageContent {
  type: "text";

  text: string;
}

export type MessageContent =
  | UserTextMessageContent
  | AssistantTextMessageContent;