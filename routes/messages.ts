import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import type { ErrorResponse } from '@/api-types';

export interface MessageResponse {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
  };
  timestamp: string;
}

// Define the schema using Zod
const retrieveMessagesSchema = z.object({
  startTime: z.string(),
  endTime: z.string(),
  channelId: z.string().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

type RetrieveMessagesBody = z.infer<typeof retrieveMessagesSchema>;

// TODO: Implement the actual database fetching logic
async function fetchMessagesFromDB(
  channelId: string | undefined,
  startTime: string,
  endTime: string,
  limit: number
): Promise<MessageResponse[]> {
  return [
    {
      id: '123',
      content: 'Example message',
      author: { id: '456', username: 'User1' },
      timestamp: new Date().toISOString(),
    },
  ];
}

const messagesRoute: FastifyPluginAsync = async (fastify) => {
  fastify.post<{
    Body: RetrieveMessagesBody;
    Reply: MessageResponse[] | ErrorResponse;
  }>(
    '/',
    async (request, reply) => {
      // Validate the request body with Zod
      const parseResult = retrieveMessagesSchema.safeParse(request.body);
      if (!parseResult.success) {
        return reply.code(400).send({ error: 'Invalid request data', details: parseResult.error.errors });
      }

      const { startTime, endTime, channelId, limit = 100 } = parseResult.data;

      try {
        // Fetch messages from the database
        const messages = await fetchMessagesFromDB(channelId, startTime, endTime, limit);
        return reply.send(messages);
      } catch (error) {
        request.log.error(error);
        return reply.code(500).send({ error: 'Internal server error' });
      }
    }
  );
};

export default messagesRoute;