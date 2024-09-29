import { z } from 'zod';
import { errorSchema, ErrorResponse } from './errors';

export const retrieveMessagesSchema = z.object({
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  channelId: z.string().uuid().optional(),
  limit: z.number().int().min(1).max(100).optional().default(100),
});

export const authorSchema = z.object({
  id: z.string().uuid(),
  username: z.string().min(1).max(50),
});

export const authorSchemaJson = z.unknown({ description: "Author json schema" })

export const messageResponseSchema = z.object({
  id: z.string().uuid(),
  channel_id: z.string().uuid(),
  content: z.string().min(1).max(2000),
  author: authorSchema,
  timestamp: z.string().datetime(),
});

export const jsonMessageResponseSchema = z.object({
  id: z.string().uuid(),
  channel_id: z.string().uuid(),
  content: z.string().min(1).max(2000),
  author: authorSchemaJson,
  timestamp: z.string().datetime(),
});


// Infer TypeScript types from Zod schemas
export type RetrieveMessagesBody = z.infer<typeof retrieveMessagesSchema>;
export type MessageResponse = z.infer<typeof messageResponseSchema>;
export type JsonMessageResponse = z.infer<typeof jsonMessageResponseSchema>;

// Re-export ErrorResponse
export { ErrorResponse };
