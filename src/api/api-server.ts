import Fastify from "fastify";
import { Client, GatewayIntentBits } from "discord.js";
import path from "node:path";
import autoLoad from "@fastify/autoload";
import { z } from "zod";
import * as dotenv from "dotenv";

dotenv.config();

import type { FastifyInstance } from "fastify";

const SERVICE_API_KEY = process.env.SERVICE_API_KEY;
const TOKEN = process.env.TOKEN;

// Define a Zod schema for the error response
const errorResponseSchema = z.object({
  error: z.string(),
});

export function initializeApiServer(discordClient: Client): FastifyInstance {
  console.log("Initializing API server");
  const fastify = Fastify({
    logger: true,
    pluginTimeout: 10000,
  });

  // Middleware for API key authentication
  // NOTE: Not seeing where this is being triggered
  // in the app lifecycle
  fastify.register(async (instance) => {
    instance.addHook("onRequest", async (request, reply) => {
      console.log("Inside Middleware");
      const apiKey = request.headers["x-api-key"];
      if (apiKey !== SERVICE_API_KEY) {
        reply
          .code(401)
          .send(errorResponseSchema.parse({ error: "Unauthorized" }));
      }
    });
  });

  const routesDir = path.join(process.cwd(), "src", "routes");

  // Automatically load all route files in the 'routes' folder
  fastify.register(autoLoad, {
    dir: routesDir,
    options: { discordClient },
  });

  console.log("API server initialized, returning fastify instance");

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
          GatewayIntentBits.MessageContent,
        ],
      });
      await client.login(TOKEN);
      console.log("Logged in as", client.user?.tag);
      const server = initializeApiServer(client);
      await server.listen({ port: 3000, host: "0.0.0.0" });
      console.log("Server listening on http://localhost:3000");
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  };
  start();
}

export async function startApiServer(client: Client) {
  try {
    await client.login(TOKEN);
    console.log("Logged in as", client.user?.tag);

    const server = initializeApiServer(client);
    await server.listen({ port: 3000, host: "0.0.0.0" });

    console.log("Server listening on http://localhost:3000");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
