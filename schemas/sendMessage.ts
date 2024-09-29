import { z } from 'zod';
import { ErrorResponse } from './errors';

export const sendMessageSchema = z.object({
  channelId: z.string(),
  content: z.string().min(1).max(2000),
  replyToId: z.string().optional(),
});

export const sendMessageResponseSchema = z.object({
  id: z.string(),
  content: z.string(),
});

// Infer TypeScript types from Zod schemas
export type SendMessageBody = z.infer<typeof sendMessageSchema>;
export type SendMessageResponse = z.infer<typeof sendMessageResponseSchema>;

// Re-export ErrorResponse
export { ErrorResponse };