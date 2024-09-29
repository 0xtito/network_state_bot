import { Client, GatewayIntentBits, } from "discord.js";
import * as dotenv from "dotenv";
import { startApiServer } from "./api/api-server";

import type { Message, TextChannel } from "discord.js";

import { db } from "./db/index";

import { DiscordMessage, DiscordMessageRaw, discordMessages, discordMessagesRaw } from "./db/schema";

dotenv.config();

const TOKEN = process.env.TOKEN;


const insertMsg = async (msg: DiscordMessage) => {
	console.log("Inserting message");
	return db.insert(discordMessages).values(msg);
}

const insertMsgRaw = async (msg: DiscordMessageRaw) => {
	console.log("Inserting message");
	return db.insert(discordMessagesRaw).values(msg);
}

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	],
});

client.on("ready", async () => {
	console.log(`Logged in as ${client.user?.tag}!`);
	await startApiServer(client);
	console.log("API server started");
});

// Add this new event listener for messages
client.on("messageCreate", async (message: Message) => {
	console.log(`New message received:
		Author: ${message.author.tag}
		Channel: ${message.channel.id}
		Content: ${message.content}
	`);

	const discordMessage: DiscordMessage = {
		id: message.id,
		channelId: message.channelId,
		author: JSON.stringify(message.author),
		content: message.content,
		timestamp: new Date(message.createdTimestamp),
		editedTimestamp: message.editedTimestamp ? new Date(message.editedTimestamp) : null,
		mentions: JSON.stringify(message.mentions),
		attachments: JSON.stringify(message.attachments),
		embeds: JSON.stringify(message.embeds),
		reactions: JSON.stringify(message.reactions),
		pinned: message.pinned,
		type: message.type,
		flags: message.flags.bitfield,
		messageReference: message.reference ? JSON.stringify(message.reference) : null,
		// NOTE: Null for now
		referencedMessage: null,
		thread: JSON.stringify(message.thread),
		poll: JSON.stringify(message.poll),
	};

	const blob = JSON.stringify(discordMessage);

	const str_msg: DiscordMessageRaw = {
		blob: blob,
	};

	await insertMsg(discordMessage);
	await insertMsgRaw(str_msg);

	console.log("Message inserted");

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
