import { Client, GatewayIntentBits, type TextChannel, type Message } from "discord.js";
import * as dotenv from "dotenv";
import { initializeApiServer } from '@/api/api-server';

dotenv.config();

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	],
});
const TOKEN = process.env.TOKEN;

client.on("ready", () => {
	console.log(`Logged in as ${client.user?.tag}!`);
	initializeApiServer(client);
});

// Add this new event listener for messages
client.on("messageCreate", async (message: Message) => {
	console.log(`New message received:
		Author: ${message.author.tag}
		Channel: ${message.channel.id}
		Content: ${message.content}
	`);
});

client.on("interactionCreate", async (interaction) => {
	if (!interaction.isChatInputCommand()) return;

	if (interaction.commandName === "ping") {
		await interaction.reply("Pong!");
	} else if (interaction.commandName === "post") {
		const channel = interaction.channel as TextChannel;
		await channel.send("Hello, I'm your bot!");
		await interaction.reply("Message posted!");
	} else if (interaction.commandName === "read") {
		const channel = interaction.channel as TextChannel;
		const messages = await channel.messages.fetch({ limit: 1 });
		const lastMessage = messages.first();
		if (lastMessage) {
			await interaction.reply(`Last message: ${lastMessage.content}`);
		} else {
			await interaction.reply("No messages found in this channel.");
		}
	}
});

client.login(TOKEN);
