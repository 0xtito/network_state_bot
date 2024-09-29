import Fastify, { type FastifyInstance } from 'fastify';
import { Client, GatewayIntentBits } from 'discord.js';
import path from 'node:path';
import autoLoad from '@fastify/autoload';
import { z } from 'zod';

const SERVICE_API_KEY = process.env.SERVICE_API_KEY;

// Define a Zod schema for the error response
const errorResponseSchema = z.object({
  error: z.string(),
});

export function initializeApiServer(discordClient: Client): FastifyInstance {
  const fastify = Fastify({ logger: true });

  // Middleware for API key authentication
  fastify.register(async (instance) => {
    instance.addHook('onRequest', async (request, reply) => {
      const apiKey = request.headers['x-api-key'];
      if (apiKey !== SERVICE_API_KEY) {
        reply.code(401).send(errorResponseSchema.parse({ error: 'Unauthorized' }));
      }
    });
  });

  // Automatically load all route files in the 'routes' folder
  fastify.register(autoLoad, {
    dir: path.join(__dirname, 'routes'),
    options: { discordClient },
  });

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
      await client.login(process.env.DISCORD_BOT_TOKEN);
      const server = initializeApiServer(client);
      await server.listen({ port: 3000, host: '0.0.0.0' });
      console.log('Server listening on http://localhost:3000');
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  };
  start();
}