import type { FastifyInstance } from 'fastify';
import { Client } from 'discord.js';
import { initializeApiServer } from '../src/api/api-server';

// Mock Discord.js Client
jest.mock('discord.js', () => ({
  Client: jest.fn().mockImplementation(() => ({
    channels: {
      fetch: jest.fn(),
    },
  })),
  GatewayIntentBits: {
    Guilds: 1,
    GuildMessages: 2,
    MessageContent: 3,
  },
}));

describe('API Server', () => {
  let app: FastifyInstance;
  let mockDiscordClient: jest.Mocked<Client>;

  beforeAll(async () => {
    mockDiscordClient = new Client({ intents: [] }) as jest.Mocked<Client>;
    app = initializeApiServer(mockDiscordClient);
    await app.ready();
  });

  afterAll(() => {
    app.close();
  });

  // Test for Retrieve Messages endpoint
  describe('POST /messages', () => {
    it('should return 401 if API key is invalid', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/messages',
        headers: {
          'X-API-Key': 'invalid-key',
        },
        payload: {
          startTime: '2023-01-01T00:00:00Z',
          endTime: '2023-01-02T00:00:00Z',
        },
      });

      expect(response.statusCode).toBe(401);
      expect(JSON.parse(response.payload)).toEqual({ error: 'Unauthorized' });
    });

    it('should return 400 if startTime or endTime is missing', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/messages',
        headers: {
          'X-API-Key': process.env.SERVICE_API_KEY,
        },
        payload: {
          startTime: '2023-01-01T00:00:00Z',
        },
      });

      expect(response.statusCode).toBe(400);
      expect(JSON.parse(response.payload)).toEqual({ error: 'startTime and endTime are required' });
    });

    // it('should return messages when valid request is made', async () => {
    //   const mockMessages = new Map([
    //     ['1', { id: '1', content: 'Test message', author: { id: 'user1', username: 'User 1' }, createdAt: new Date() }],
    //   ]);
    //   mockDiscordClient.channels.fetch.mockResolvedValue({
    //     messages: {
    //       fetch: jest.fn().mockResolvedValue(mockMessages),
    //     },
    //   } as any);

    //   const response = await app.inject({
    //     method: 'POST',
    //     url: '/messages',
    //     headers: {
    //       'X-API-Key': process.env.SERVICE_API_KEY,
    //     },
    //     payload: {
    //       startTime: '2023-01-01T00:00:00Z',
    //       endTime: '2023-01-02T00:00:00Z',
    //       channelId: '123456789',
    //     },
    //   });

    //   expect(response.statusCode).toBe(200);
    //   const responseBody = JSON.parse(response.payload);
    //   expect(responseBody).toHaveLength(1);
    //   expect(responseBody[0]).toHaveProperty('id', '1');
    //   expect(responseBody[0]).toHaveProperty('content', 'Test message');
    // });
  });

  // Test for Send Message endpoint
  describe('POST /messages/send', () => {
    it('should return 401 if API key is invalid', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/messages/send',
        headers: {
          'X-API-Key': 'invalid-key',
        },
        payload: {
          channelId: '123456789',
          content: 'Test message',
        },
      });

      expect(response.statusCode).toBe(401);
      expect(JSON.parse(response.payload)).toEqual({ error: 'Unauthorized' });
    });

    it('should return 400 if channelId or content is missing', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/messages/send',
        headers: {
          'X-API-Key': process.env.SERVICE_API_KEY,
        },
        payload: {
          channelId: '123456789',
        },
      });

      expect(response.statusCode).toBe(400);
      expect(JSON.parse(response.payload)).toEqual({ error: 'channelId and content are required' });
    });

    // it('should send a message when valid request is made', async () => {
    //   const mockSentMessage = { id: '2', content: 'Test message' };
    //   mockDiscordClient.channels.fetch.mockResolvedValue({
    //     isTextBased: () => true,
    //     send: jest.fn().mockResolvedValue(mockSentMessage),
    //   } as any);

    //   const response = await app.inject({
    //     method: 'POST',
    //     url: '/messages/send',
    //     headers: {
    //       'X-API-Key': process.env.SERVICE_API_KEY,
    //     },
    //     payload: {
    //       channelId: '123456789',
    //       content: 'Test message',
    //     },
    //   });

    //   expect(response.statusCode).toBe(200);
    //   const responseBody = JSON.parse(response.payload);
    //   expect(responseBody).toEqual({
    //     id: '2',
    //     content: 'Test message',
    //   });
    // });
  });
});