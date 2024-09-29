import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { type Client, TextChannel } from 'discord.js';
import { zodToJsonSchema } from 'zod-to-json-schema';
import {
  sendMessageSchema,
  sendMessageResponseSchema,
  SendMessageBody,
  SendMessageResponse,
  ErrorResponse,
} from '@/schemas/sendMessage';

export default function sendMessageRoute(fastify: FastifyInstance, discordClient: Client) {
  fastify.post<{
    Body: SendMessageBody;
    Reply: SendMessageResponse | ErrorResponse;
  }>(
    '/messages/send',
    {
      schema: {
        body: zodToJsonSchema(sendMessageSchema),
        response: {
          200: {
            description: 'Successful response',
            ...zodToJsonSchema(sendMessageResponseSchema),
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: SendMessageBody }>, reply: FastifyReply) => {
      try {
        const { channelId, content, replyToId } = sendMessageSchema.parse(request.body);

        const channel = await discordClient.channels.fetch(channelId);
        if (!channel || !(channel instanceof TextChannel)) {
          return reply.code(404).send({ error: 'Channel not found or is not a text channel' });
        }

        const messageOptions = {
          content,
          ...(replyToId && { reply: { messageReference: replyToId } }),
        };

        const sentMessage = await channel.send(messageOptions);

        return reply.send({
          id: sentMessage.id,
          content: sentMessage.content,
        });
      } catch (error) {
        fastify.log.error(error);
        return reply.code(400).send({ error: 'Invalid request or unexpected error occurred' });
      }
    }
  );
}