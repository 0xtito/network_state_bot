import { z } from 'zod';

export const errorSchema = z.object({
  error: z.string(),
  message: z.string(),
  details: z.any().optional(),
});

export type ErrorResponse = z.infer<typeof errorSchema>;