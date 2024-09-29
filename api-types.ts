import { z, type ZodError } from 'zod';

export interface ErrorResponse {
  error: string;
  details?: ZodError['errors'];
}
