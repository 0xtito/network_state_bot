import { Client, GatewayIntentBits } from "discord.js";
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
import * as dotenv from "dotenv";

dotenv.config();

const TOKEN = process.env.TOKEN!;

const PUBLIC_KEY =
  "0642a4123aafc9dbd36e5ef0a8f2bb2d40dfa87a8500c2809f67de9332dfe26c";

client.on("ready", () => {
  console.log(`Logged in as ${client.user!.tag}!`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "ping") {
    await interaction.reply("Pong!");
  }
});

client.login(TOKEN);
