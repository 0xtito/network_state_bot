import { FastifyPluginAsync } from "fastify";
import { TextChannel } from "discord.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import {
  sendMessageSchema,
  sendMessageResponseSchema,
  SendMessageBody,
  SendMessageResponse,
  ErrorResponse,
} from "../schemas/sendMessage";

import type { Client } from "discord.js";

const sendMessageRoute: FastifyPluginAsync<{ discordClient: Client }> = async (
  fastify,
  opts
) => {
  const { discordClient } = opts;

  fastify.post<{
    Body: SendMessageBody;
    Reply: SendMessageResponse | ErrorResponse;
  }>(
    "/messages/send",
    {
      schema: {
        body: zodToJsonSchema(sendMessageSchema),
        response: {
          200: {
            description: "Successful response",
            ...zodToJsonSchema(sendMessageResponseSchema),
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { channelId, content, replyToId } = sendMessageSchema.parse(
          request.body
        );

        const channel = await discordClient.channels.fetch(channelId);
        if (!channel || !(channel instanceof TextChannel)) {
          return reply.code(404).send({
            message: "Channel not found or is not a text channel",
            error: "Channel not found or is not a text channel",
          });
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
        return reply.code(400).send({
          message: "Invalid request or unexpected error occurred",
          error: "Invalid request or unexpected error occurred",
        });
      }
    }
  );
};

export default sendMessageRoute;
