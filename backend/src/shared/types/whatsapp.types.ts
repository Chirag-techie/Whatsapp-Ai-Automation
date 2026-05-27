export interface ParsedWhatsAppMessage {
  whatsappMessageId: string;

  senderPhone: string;

  senderProfileName: string;

  messageType: string;

  textBody: string;

  timestamp: string;

  raw: unknown;
}