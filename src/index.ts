import { Client, Events, GatewayIntentBits, Collection, Message, BaseInteraction ,ChatInputCommandInteraction, ApplicationCommandData} from "discord.js";
import fs from "node:fs"
import path from "node:path"
import {REST, Routes } from "discord.js"
import { isArrowFunction } from "typescript";
import { scraperCall } from "scraper/child-process/handler";
import { ScraperMethod } from "scraper/abstract/BaseScraper";

scraperCall("https://www.mangasee123.com/manga/You-Werent-My-Sister-but-My-Fiance", ScraperMethod.Check)
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
});

// Log in to Discord with your client's token
client.login(Bun.env.DISCORD_TOKEN);

client.commands = new Collection();

const commandsPath = path.join(__dirname, '/discord/commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'));
// const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'));
for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath).default;
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

client.once(Events.ClientReady, () =>{
    console.log('ready')
})

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});