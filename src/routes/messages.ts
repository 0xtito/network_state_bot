import type { FastifyPluginAsync } from 'fastify';
import { zodToJsonSchema } from 'zod-to-json-schema';
import {
  retrieveMessagesSchema,
  messageResponseSchema,
  RetrieveMessagesBody,
  MessageResponse,
  ErrorResponse
} from '@/schemas/messages';

// TODO: Implement the actual database fetching logic
async function fetchMessagesFromDB(
  params: RetrieveMessagesBody
): Promise<MessageResponse[]> {
  return [
    {
      id: '123e4567-e89b-12d3-a456-426614174000',
      content: 'Example message',
      author: { id: '123e4567-e89b-12d3-a456-426614174001', username: 'User1' },
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
    {
      schema: {
        body: zodToJsonSchema(retrieveMessagesSchema),
        response: {
          200: {
            description: 'Successful response',
            type: 'array',
            items: zodToJsonSchema(messageResponseSchema),
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const params = retrieveMessagesSchema.parse(request.body);
        const messages = await fetchMessagesFromDB(params);
        return reply.send(messages);
      } catch (error) {
        request.log.error(error);
        return reply.code(400).send({ message: 'Invalid request or unexpected error occurred', error: 'Bad Request' });
      }
    }
  );
};

export default messagesRoute;