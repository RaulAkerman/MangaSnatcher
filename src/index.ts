import dotenv from "dotenv";
import pupeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import prisma from "./prisma";
import * as schedule from "node-schedule";
import { Client, Events, GatewayIntentBits, Guild, channelLink, managerToFetchingStrategyOptions } from "discord.js";
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
  const browser = await pupeteer.launch({ headless: true });
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

  const AcceptedDomains = ["asura.gg", "mangadex.org", "mangasee123.com"];

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

      // Check if the series is already being watched
      if (domainName === "asura.gg") {
        const existingSeries = await prisma.series.findFirst({
          where: {
            title: await asurascans.getTitleName(url, browser),
            url: url,
            guildId: message.guildId!,
          },
        });
        if (existingSeries) {
          await message.channel.send(`<${url}> is already being watched!`);
          return;
        }
      } else if (domainName === "mangasee123.com") {
        const existingSeries = await prisma.series.findFirst({
          where: {
            url: url,
            title: await mangasee.getTitleName(url, browser),
            guildId: message.guildId!,
          },
        });
        if (existingSeries) {
          await message.channel.send(`<${url}> is already being watched!`);
          return;
        }
      }

      // Check if the series is scrapeable

      //Send a message to the channel saying that the bot is checking if the series is scrapeable, delete the message after 10 seconds
      const checkingMessage = await message.channel.send(`Checking if ${url} is scrapeable...`);

      setTimeout(async () => {
        await checkingMessage.delete();
      }, 10000);

      try {
        if (domainName === "asura.gg") {
          await asurascans.checkIfScrapeable(url, browser);
        } else if (domainName === "mangasee123.com") {
          await mangasee.checkIfScrapeable(url, browser);
        }
      } catch (e) {
        await message.channel.send(
          `${url} is not scrapeable...\n` + 'Make sure to link the URL at the "Home" page of the series.',
        );
        return;
      }

      //Set seriesTitle depending on the domain name
      let seriesTitle = "";
      if (domainName === "asura.gg") {
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
          channelId: message.channelId!,
        },
      });
      await message.channel.send(`Added ${seriesTitle} to the watchlist!`);
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
      if (domainName === "asura.gg") {
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
      await message.channel.send(
        `Here are the series you are watching:\n${series.map((s) => s.title + " : " + s.url).join("\n")}`,
      );
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

const job = schedule.scheduleJob("*/15 * * * *", async function () {
  console.log("Running job at time: ", new Date().toLocaleString());
  const browser = await pupeteer.launch({ headless: true });
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

  let resultsToAnnounce: any[] = [] ;

  const asuraResults = (await asurascans.scrape(browser)).filter((manga) => {
    const nameLatestChapter = NameLatestChapterMap.find((n) => n.name === manga.title && n.source === manga.source);
    if (!nameLatestChapter) {
      return false;
    }
    const latestChapter = nameLatestChapter.latestChapter;
    if (latestChapter === manga.latestChapter) {
      return false;
    }
    if (nameLatestChapter.latestChapter === null || nameLatestChapter.latestChapter === undefined) {
      resultsToAnnounce.push(manga);
      return true;
    }
    console.log("OLD CHAPTER: " + latestChapter);
    console.log("NEW CHAPTER: " + manga.latestChapter);
    return true;
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
    if (nameLatestChapter.latestChapter === null || nameLatestChapter.latestChapter === undefined) {
      return true;
    }
    console.log("OLD CHAPTER: " + latestChapter);
    console.log("NEW CHAPTER: " + manga.latestChapter);
    resultsToAnnounce.push(manga);
    return true;
  });

  // console.log(asuraResults);

  //const mangas = asuraResults.filter((manga) => mangasToWatch.includes(manga.title));
  let channels = await prisma.series.findMany({
    select: {
      channelId: true,
    },
  });

  //Remove duplicate channels
  channels = channels.filter((channel, index, self) => {
    return index === self.findIndex((c) => c.channelId === channel.channelId);
  });

  channels.forEach(async (channel) => {
    const channelInstance = client.channels.cache.get(channel.channelId);

    //Find series with channel id and mangasee as source
    const MangaSeeSeries = await prisma.series.findMany({
      where: {
        channelId: channel.channelId,
        source: "mangasee123.com",
      },
      select: {
        title: true,
        latestChapter: true,
      },
    });

    //Get the series names 
    const mangaSeeSeriesNames = MangaSeeSeries.map((s) => s.title);
    //Find series with channel id and asura as source
    const AsuraSeries = await prisma.series.findMany({
      where: {
        channelId: channel.channelId,
        source: "asura.gg",
      },
      select: {
        title: true,
        latestChapter: true,
      },
    });

    const asuraSeriesNames = AsuraSeries.map((s) => s.title);

    if (!channelInstance || !channelInstance.isTextBased()) {
      console.error("Channel is not a text channel");
      return;
    }

    // mangaSeeResults.forEach((manga) => {
    //   if (mangaSeeSeriesNames.includes(manga.title)) {
    //     //If the last chapter was undefined dont send message
    //     console.log("Current Chapter: ");
    //     console.log(MangaSeeSeries.find((s) => s.title === manga.title)?.latestChapter);

    //     if (
    //       MangaSeeSeries.find((s) => s.title === manga.title)?.latestChapter === undefined ||
    //       MangaSeeSeries.find((s) => s.title === manga.title)?.latestChapter === null
    //     ) {
    //       return;
    //     } else {
    //       channelInstance.send(`New chapter of ${manga.title} is out! <${manga.chapterUrl}>`);
    //     }
    //   }
    // });

    // asuraResults.forEach((manga) => {
    //   if (asuraSeriesNames.includes(manga.title)) {
    //     //If the last chapter was undefined dont send message
    //     if (
    //       AsuraSeries.find((s) => s.title === manga.title)?.latestChapter === undefined ||
    //       AsuraSeries.find((s) => s.title === manga.title)?.latestChapter === null
    //     ) {
    //       return;
    //     } else {
    //       channelInstance.send(`New chapter of ${manga.title} is out! <${manga.chapterUrl}>`);
    //     }
    //   }
    // });

    resultsToAnnounce.forEach((manga) => {
      if (asuraSeriesNames.includes(manga.title) || mangaSeeSeriesNames.includes(manga.title)) {
        channelInstance.send(`New series ${manga.title} is out! <${manga.seriesUrl}>`);
      }
    });
  });


  //Update latest chapter
  const guilds = await prisma.guild.findMany();
  guilds.forEach(async (guild) => {
    mangaSeeResults.forEach(async (manga) => {
      const existingSeries = await prisma.series.findUnique({
        where: {
          title_source_guildId: {
            title: manga.title,
            source: manga.source,
            guildId: guild.id,
          },
        },
      });
      if (existingSeries) {
        await prisma.series.update({
          where: {
            title_source_guildId: {
              title: manga.title,
              source: manga.source,
              guildId: guild.id,
            },
          },
          data: {
            latestChapter: manga.latestChapter,
            lastSrapedAt: new Date(),
          },
        });
      } else {
        console.error(`Series not found: ${manga.title} (${manga.source}) OR series up-to-date`);
      }
    });
  });
  guilds.forEach(async (guild) => {
    asuraResults.forEach(async (manga) => {
      const existingSeries = await prisma.series.findUnique({
        where: {
          title_source_guildId: {
            title: manga.title,
            source: manga.source,
            guildId: guild.id,
          },
        },
      });
      if (existingSeries) {
        await prisma.series.update({
          where: {
            title_source_guildId: {
              title: manga.title,
              source: manga.source,
              guildId: guild.id,
            },
          },
          data: {
            latestChapter: manga.latestChapter,
            lastSrapedAt: new Date(),
          },
        });
      } else {
        console.error(`Series not found: ${manga.title} (${manga.source}) OR series up-to-date`);
      }
    });
  });
  console.log("Finished job at time: ", new Date().toLocaleString());
});
