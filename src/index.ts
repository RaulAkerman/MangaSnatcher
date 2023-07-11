import dotenv from "dotenv";
import pupeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import prisma from "./prisma";
import * as schedule from "node-schedule";
import { Client, Events, GatewayIntentBits, Guild, managerToFetchingStrategyOptions } from "discord.js";
import { map, next } from "cheerio/lib/api/traversing";
import { Message } from "discord.js";
import AsuraScans from "./scraper/modules/asurascans";
import MangaSee from "./scraper/modules/mangasee";
import client from "./client";
import { Browser } from "puppeteer";
import { join } from "@prisma/client/runtime";
dotenv.config();
pupeteer.use(StealthPlugin());

(async () => {
  const browser = await pupeteer.launch({ headless: true, dumpio: true });
  client.once(Events.ClientReady, async (c) => {
    console.log(`Logged in as ${c.user.tag}`);
    c.guilds.cache.forEach(async (guild) => {
      console.log(`Logged in to ${guild.name}`);
      await prisma.guild.upsert({
        where: {
          id: guild.id,
        },
        update: {
          name: guild.name,
        },
        create: {
          id: guild.id,
          name: guild.name,
        },
      });
    });
  });

  const AcceptedDomains = ["asurascans.com", "mangadex.org", "mangasee123.com"];

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

    if (message.content.startsWith("!add")) {
      const url = message.content.slice("!add".length).trim();
      const domainName = extractDomainName(url);
      if (!domainName) {
        await message.channel.send(`Sorry, ${url} is not a valid URL.`);
        return;
      }
      if (!AcceptedDomains.includes(domainName)) {
        await message.channel.send(`Sorry, ${domainName} is not an supported domain.`);
        return;
      }

      //Set seriesTitle depending on the domain name
      let seriesTitle = "";
      if (domainName === "asurascans.com") {
        seriesTitle = await asurascans.getTitleName(url, browser);
      } else if (domainName === "mangasee123.com") {
        seriesTitle = await mangasee.getTitleName(url, browser);
      }

      console.log(seriesTitle);
      console.log(domainName);
      console.log(url);
      console.log(message.guildId!);

      await prisma.series.upsert({
        where: {
          title_source_guildId: {
            title: seriesTitle,
            source: domainName,
            guildId: message.guildId!,
          },
        },
        update: {
          url: url,
        },
        create: {
          title: seriesTitle,
          source: domainName,
          guildId: message.guildId!,
          url: url,
        },
      });
      await message.channel.send(`Added ${seriesTitle} to the list of series to watch!`);
    }

    if (message.content.startsWith("!remove")) {
      const url = message.content.slice("!remove".length).trim();
      const domainName = extractDomainName(url);
      if (!domainName) {
        await message.channel.send(`Sorry, ${url} is not a valid URL.`);
        return;
      }
      if (!AcceptedDomains.includes(domainName)) {
        await message.channel.send(`Sorry, ${domainName} is not an supported domain.`);
        return;
      }

      //Set seriesTitle depending on the domain name

      let seriesTitle = "";
      if (domainName === "asurascans.com") {
        seriesTitle = await asurascans.getTitleName(url, browser);
      } else if (domainName === "mangasee123.com") {
        seriesTitle = await mangasee.getTitleName(url, browser);
      }

      console.log(seriesTitle);
      console.log(domainName);
      console.log(url);
      console.log(message.guildId!);

      await prisma.series.delete({
        where: {
          title_source_guildId: {
            title: seriesTitle,
            source: domainName,
            guildId: message.guildId!,
          },
        },
      });
      await message.channel.send(`Removed ${seriesTitle} from the list of series to watch!`);
    }

    if (message.content.startsWith("!list")) {
      const series = await prisma.series.findMany({
        where: {
          guildId: message.guildId!,
        },
      });
      await message.channel.send(`Here are the series you are watching:\n${series.map((s) => s.title + " : " + s.url).join("\n")}`);
    }
  });

  await client.login(process.env.DISCORD_TOKEN);
  const asurascans = new AsuraScans();
  const mangasee = new MangaSee();
  console.log("Running");
})().catch((e) => console.error(e));

// To run every 6 hours, change the first argument to "0 */6 * * *"
// To run every 12 hours, change the first argument to "0 */12 * * *"
// To run every 30 minutes change the first argument to "*/30 * * * *"
// To run every minute change the first argument to "* * * * *"

const job = schedule.scheduleJob("* */6 * * *", async function () {
    console.log("Running job at time: ", new Date().toLocaleString());
    const browser = await pupeteer.launch({ headless: true, dumpio: true });
    const asurascans = new AsuraScans();
    const mangasee = new MangaSee();

    //Find all URLs that have MangaSee as the source
    const mangaSeeUrls = await prisma.series
      .findMany({
        where: {
          source: "mangasee123.com",
        },
      })
      .then((series) => series.map((s) => s.url));

    //Find series names and latest chapters
    const NameLatestChapterMap = await prisma.series
      .findMany()
      .then((series) => series.map((s) => ({ name: s.title, latestChapter: s.latestChapter, source: s.source })));

    console.log(NameLatestChapterMap);

    const asuraResults = (await asurascans.scrape(browser)).filter((manga) => {
      const nameLatestChapter = NameLatestChapterMap.find((n) => n.name === manga.title && n.source === manga.source);
      if (!nameLatestChapter) {
        return false;
      }
      const latestChapter = nameLatestChapter.latestChapter;
      if (latestChapter === manga.latestChapter) {
        return false;
      }
      console.log("OLD CHAPTER: " + latestChapter);
      console.log("NEW CHAPTER: " + manga.latestChapter);
      return "true";
    });

    //Check if manga has a new chapter
    const mangaSeeResults = (await mangasee.scrape(browser, mangaSeeUrls)).filter((manga) => {
      const nameLatestChapter = NameLatestChapterMap.find((n) => n.name === manga.title && n.source === manga.source);
      if (!nameLatestChapter) {
        return false;
      }
      const latestChapter = nameLatestChapter.latestChapter;
      if (latestChapter === manga.latestChapter) {
        return false;
      }
      console.log("OLD CHAPTER: " + latestChapter);
      console.log("NEW CHAPTER: " + manga.latestChapter);
      return "true";
    });

    // console.log(asuraResults);

    //const mangas = asuraResults.filter((manga) => mangasToWatch.includes(manga.title));

    const channel = client.channels.cache.get("1124111916516778075");
    if (!channel) {
      console.error("Channel not found");
      return;
    }

    if (!channel.isTextBased()) {
      console.error("Channel is not a text channel");
      return;
    }

    mangaSeeResults.forEach((manga) => {
      channel.send(`New chapter of ${manga.title} is out! ${manga.chapterUrl}`);
    });

    asuraResults.forEach((manga) => {
      channel.send(`New chapter of ${manga.title} is out! ${manga.chapterUrl}`);
    });

    //Update latest chapter
    mangaSeeResults.forEach(async (manga) => {
      const existingSeries = await prisma.series.findUnique({
        where: {
          title_source_guildId: {
            title: manga.title,
            source: manga.source,
            guildId: "1124111916076371978",
          },
        },
      });
      if (existingSeries) {
        await prisma.series.update({
          where: {
            title_source_guildId: {
              title: manga.title,
              source: manga.source,
              guildId: "1124111916076371978",
            },
          },
          data: {
            latestChapter: manga.latestChapter,
            lastSrapedAt: new Date(),
          },
        });
      } else {
        console.error(`Series not found: ${manga.title} (${manga.source})`);
      }
    });

    asuraResults.forEach(async (manga) => {
      const existingSeries = await prisma.series.findUnique({
        where: {
          title_source_guildId: {
            title: manga.title,
            source: manga.source,
            guildId: "1124111916076371978",
          },
        },
      });
      if (existingSeries) {
        await prisma.series.update({
          where: {
            title_source_guildId: {
              title: manga.title,
              source: manga.source,
              guildId: "1124111916076371978",
            },
          },
          data: {
            latestChapter: manga.latestChapter,
            lastSrapedAt: new Date(),
          },
        });
      } else {
        console.error(`Series not found: ${manga.title} (${manga.source})`);
      }
    });
    console.log("Finished job at time: ", new Date().toLocaleString());
});