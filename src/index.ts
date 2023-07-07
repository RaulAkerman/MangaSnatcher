import dotenv from "dotenv";
import axios from "axios";
import cheerio from "cheerio";
import pupeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { Client, Events, GatewayIntentBits, managerToFetchingStrategyOptions } from "discord.js";
import { next } from "cheerio/lib/api/traversing";
import { Message } from "discord.js";
dotenv.config();
pupeteer.use(StealthPlugin());

// const client = new Client({
//   intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
// });

// client.once(Events.ClientReady, (c) => {
//   console.log(`Logged in as ${c.user.tag}`);

// });

// client.on(Events.MessageCreate, (message) => {
//     console.log(message.content);
//     if (message.content === "ping") {
//         message.reply("pong");
//     }
// });

// client.login(process.env.DISCORD_TOKEN);

// const webpagedata = async () => {
//     const { data } = await axios.get("https://www.asurascans.com");
//     const $ = cheerio.load(data);
//     const mangas = $(".series");
//     console.log(mangas.length);
//     }

// webpagedata();

// (async () => {
//   const browser = await pupeteer.launch({ headless: true });
//   const page = await browser.newPage();
//   await page.goto("https://www.asurascans.com", { waitUntil: "networkidle2" });
//   await page.screenshot({ path: "example.png", fullPage: true });
//   await page.waitForSelector(".series");
//   const series = await page.evaluate(() => {
//     const mangastowatch = ["Return of the Mount Hua Sect"];
//     const elements = document.getElementsByClassName("uta");
//     const set = new Set();
//     const mangas = Array.from(elements);
//     mangas.forEach((manga) => {
//       const title = manga.getAttribute("title");
//       if (title && mangastowatch.includes(title)) {

//         set.add(title);
//       }
//     });
//     return Array.from(set);
//   });
//   console.log(series);
// })().catch((e) => console.error(e));


 const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
 });

 client.once(Events.ClientReady, (c) => {
   console.log(`Logged in as ${c.user.tag}`);
});

const AcceptedDomains = ["asurascans.com", "mangadex.org"];

function extractDomainName(url: string): string | null {
  const regex = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/gim;
  const match = regex.exec(url);
  return match ? match[1] : null;
}

async function checkUrl(message: Message, url: string): Promise<void> {
  const domainName = extractDomainName(url);
  if (!domainName) {
    await message.channel.send(`Sorry, ${url} is not a valid URL.`);
    return;
  }
  if (!AcceptedDomains.includes(domainName)) {
    await message.channel.send(`Sorry, ${domainName} is not an supported domain.`);
    return;
  }
  await message.channel.send(`Great, ${domainName} is a supported domain!`);
}

client.on(Events.MessageCreate, async (message: Message) => {
  if (message.content.startsWith("!check")) {
    const url = message.content.slice("!check".length).trim();
    await checkUrl(message, url);
  }
});


client.login(process.env.DISCORD_TOKEN);