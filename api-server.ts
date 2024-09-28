import Fastify, { type FastifyInstance, type FastifyRequest, type FastifyReply } from 'fastify';
import cors from '@fastify/cors';
import { Client, type TextChannel, GatewayIntentBits } from 'discord.js';

// Define request and response types
interface RetrieveMessagesRequest {
  startTime: string;
  endTime: string;
  channelId?: string;
  limit?: number;
}

interface SendMessageRequest {
  channelId: string;
  content: string;
  replyToId?: string;
}

interface MessageResponse {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
  };
  timestamp: string;
}

interface SendMessageResponse {
  id: string;
  content: string;
}

interface ErrorResponse {
  error: string;
}

const API_KEY = process.env.API_KEY;
const SERVICE_API_KEY = process.env.SERVICE_API_KEY; // Add this line

export function initializeApiServer(discordClient: Client): FastifyInstance {
  const fastify = Fastify({ logger: true });

  // Register plugins
  fastify.register(cors, {
    origin: '*', // In production, you should restrict this to specific origins
  });

  // Middleware for API key authentication
  fastify.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
    const apiKey = request.headers['x-api-key'];
    if (apiKey !== SERVICE_API_KEY) {
      reply.code(401).send({ error: 'Unauthorized' });
    }
  });

  // Retrieve Messages endpoint
  fastify.post<{ Body: RetrieveMessagesRequest, Reply: MessageResponse[] | ErrorResponse }>(
    '/messages',
    async (request, reply) => {
      const { startTime, endTime, channelId, limit } = request.body;
      
      if (!startTime || !endTime) {
        return reply.code(400).send({ error: 'startTime and endTime are required' });
      }

      try {
        const channel = channelId ? await discordClient.channels.fetch(channelId) : null;
        if (channelId && !channel) {
          return reply.code(404).send({ error: 'Channel not found' });
        }

        const messages = await (channel as TextChannel)?.messages.fetch({
          after: startTime,
          before: endTime,
          limit: limit || 100,
        }) || new Map();

        const formattedMessages: MessageResponse[] = [...messages.values()].map(msg => ({
          id: msg.id,
          content: msg.content,
          author: {
            id: msg.author.id,
            username: msg.author.username,
          },
          timestamp: msg.createdAt.toISOString(),
        }));

        return reply.send(formattedMessages);
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ error: 'Internal server error' });
      }
    }
  );

  // Send Message endpoint
  fastify.post<{ Body: SendMessageRequest, Reply: SendMessageResponse | ErrorResponse }>(
    '/messages/send',
    async (request, reply) => {
      const { channelId, content, replyToId } = request.body;

      if (!channelId || !content) {
        return reply.code(400).send({ error: 'channelId and content are required' });
      }

      try {
        const channel = await discordClient.channels.fetch(channelId);
        if (!channel || !channel.isTextBased()) {
          return reply.code(404).send({ error: 'Channel not found or is not a text channel' });
        }

        const messageOptions: { content: string; reply?: { messageReference: string } } = { content };
        if (replyToId) {
          messageOptions.reply = { messageReference: replyToId };
        }

        const sentMessage = await (channel as TextChannel).send(messageOptions);

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

  return fastify;
}

// Start the server if this file is run directly
if (require.main === module) {
  const start = async () => {
    try {
      const client = new Client({ 
        intents: [
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildMessages,
          GatewayIntentBits.MessageContent
        ] 
      });
      const server = initializeApiServer(client);
      await server.listen({ port: 3000 });
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  };
  start();
}