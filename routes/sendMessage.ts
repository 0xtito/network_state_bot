import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { type Client, TextChannel } from 'discord.js';
import { z } from 'zod';

// Zod schema for request validation
const sendMessageSchema = z.object({
  channelId: z.string(),
  content: z.string(),
  replyToId: z.string().optional(),
});

type SendMessageBody = z.infer<typeof sendMessageSchema>;

export default function sendMessageRoute(fastify: FastifyInstance, discordClient: Client) {
  fastify.post<{ Body: SendMessageBody }>(
    '/messages/send',
    async (request: FastifyRequest<{ Body: SendMessageBody }>, reply: FastifyReply) => {
      // Validate the request body using Zod
      const parseResult = sendMessageSchema.safeParse(request.body);
      if (!parseResult.success) {
        return reply.code(400).send({ error: 'Invalid request data', details: parseResult.error.errors });
      }

      const { channelId, content, replyToId } = parseResult.data;

      try {
        const channel = await discordClient.channels.fetch(channelId);
        if (!channel || !(channel instanceof TextChannel)) {
          return reply.code(404).send({ error: 'Channel not found or is not a text channel' });
        }

        // Construct the message options
        const messageOptions = {
          content,
          ...(replyToId && { reply: { messageReference: replyToId } }),
        };

        // Send the message
        const sentMessage = await channel.send(messageOptions);

        return reply.send({
          id: sentMessage.id,
          content: sentMessage.content,
        });
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ error: 'Internal server error' });
      }
    }
  );
}