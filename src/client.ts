import { Client, Events, GatewayIntentBits, managerToFetchingStrategyOptions } from "discord.js";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

export default client;