import { REST, Routes, SlashCommandBuilder } from 'discord.js';
import * as dotenv from 'dotenv';

dotenv.config();

const commands = [
  new SlashCommandBuilder().setName('ping').setDescription('Replies with Pong!'),
  new SlashCommandBuilder().setName('post').setDescription('Posts a message'),
  new SlashCommandBuilder().setName('read').setDescription('Reads the last message'),
];

const token = process.env.TOKEN;
if (!token) {
  throw new Error('TOKEN environment variable is not set');
}

const clientId = process.env.CLIENT_ID;
if (!clientId) {
  throw new Error('CLIENT_ID environment variable is not set');
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();