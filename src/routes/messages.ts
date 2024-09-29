import type { FastifyPluginAsync } from "fastify";
import { zodToJsonSchema } from "zod-to-json-schema";
import {
  retrieveMessagesSchema,
  messageResponseSchema,
  RetrieveMessagesBody,
  // MessageResponse,
  ErrorResponse,
  // jsonMessageResponseSchema,
  JsonMessageResponse,
} from "../schemas/messages"
import { db } from "../db/index";
// import { discordMessages } from "@/db/schema"; 
import { eq } from "drizzle-orm";

async function fetchMessagesFromDB(
  params: RetrieveMessagesBody
): Promise<JsonMessageResponse[]> {
  const { startTime, endTime, channelId, limit } = params;

  // Query the database for messages
  const messages = await db.query.discordMessages.findMany({
    where: (messages, { gte, lte, and }) => {
      return and(
        gte(messages.timestamp, new Date(startTime)),
        lte(messages.timestamp, new Date(endTime)),
        channelId ? eq(messages.channelId, channelId) : undefined
      );
    },
    limit: limit,
  });

  return messages.map((msg) => {
    return {
      id: msg.id,
      channel_id: msg.channelId,
      content: msg.content,
      author: msg.author,
      timestamp: msg.timestamp.toISOString(),
    };
  });
}

const messagesRoute: FastifyPluginAsync = async (fastify) => {
  fastify.post<{
    Body: RetrieveMessagesBody;
    Reply: JsonMessageResponse[] | ErrorResponse;
  }>(
    "/",
    {
      schema: {
        body: zodToJsonSchema(retrieveMessagesSchema),
        response: {
          200: {
            description: "Successful response",
            type: "array",
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
        return reply.code(400).send({
          message: "Invalid request or unexpected error occurred",
          error: "Bad Request",
        });
      }
    }
  );
};

export default messagesRoute;
