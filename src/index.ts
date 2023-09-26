import dotenv from "dotenv";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import prisma from "./prisma";
import * as schedule from "node-schedule";
import { Client, Events, GatewayIntentBits, Guild, channelLink, managerToFetchingStrategyOptions } from "discord.js";
import { Message } from "discord.js";
import client from "./client";
import {
  getChannelInstances,
  getSeriesByChannelId,
  allLatestChapters,
  findGuildSeries,
  guildAddSeries,
  guildDeleteSeries,
} from "./database";

import { Series } from "@prisma/client";
import { deflateSync } from "bun";
import { discordClientMessage } from "./client";
import { MangaSee } from "scraper/modules/base";


//import log from "why-is-node-running";
dotenv.config();
puppeteer.use(StealthPlugin());
console.log(process.pid);

const test: Series[] = [
  {
    id: "1",
    title: "The Saga of Tanya the Evil",
    url: "https://mangasee123.com/manga/Youjo-Senki",
    source: "mangasee123.com",
    latestChapter: "64",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSrapedAt: new Date(),
    channelId: "Something",
    guildId: "Something Else",
  },
];


// To run every 6 hours, change the first argument to "0 */6 * * *"
// To run every 12 hours, change the first argument to "0 */12 * * *"
// To run every 30 minutes change the first argument to "*/30 * * * *"
// To run every minute change the first argument to "* * * * *"

const job = schedule.scheduleJob("*/30 * * * *", async function () {
  //Check if has been 30 minutes since last scrape
  const lastScrape = await prisma.lastScrape.findFirst({
    where: {
      timestamp: {
        gt: new Date(new Date().getTime() - 30 * 60000),
      },
    },
  });
  if (lastScrape) {
    // wait 30 minutes
    console.log("Job cancelled");
    await Promise.resolve(new Promise((resolve) => setTimeout(resolve, 30 * 60000)));
    console.log("EXIT");
    //prisma.$disconnect();
    //client.destroy();
    //process.removeAllListeners();
    await process.exit();
  } else {
    console.log("Job not cancelled");
  }

  console.log("Running job at time: ", new Date().toLocaleString());

  const args = [
    "--aggressive-cache-discard",
    "--disable-cache",
    "--disable-application-cache",
    "--disable-offline-load-stale-cache",
    "--disable-gpu-shader-disk-cache",
    "--media-cache-size=0",
    "--disk-cache-size=0",
  ];

  const browser = await puppeteer.launch({ headless: "new", args });
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

  //Latest chapters
  const NameLatestChapterMap = await allLatestChapters();
  console.log(NameLatestChapterMap);

  let resultsToAnnounce: any[] = [];

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
      return true;
    }
    console.log("OLD CHAPTER: " + latestChapter);
    console.log("NEW CHAPTER: " + manga.latestChapter);
    resultsToAnnounce.push(manga);
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

  let channels = await getChannelInstances();

  //probably better way
  interface channel {
    channelId: string;
  }

  channels.forEach(async (channel: channel) => {
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

    resultsToAnnounce.forEach((manga) => {
      if (asuraSeriesNames.includes(manga.title) || mangaSeeSeriesNames.includes(manga.title)) {
        channelInstance.send(`New chapter of ${manga.title} is out! <${manga.chapterUrl}>`);
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

  //Clear puppeteer cache
  await browser.close();

  //Update last scrape
  const lastScrape2 = await prisma.lastScrape.findFirst();
  if (lastScrape2) {
    await prisma.lastScrape.update({
      where: {
        id: lastScrape2.id,
      },
      data: {
        timestamp: new Date(),
      },
    });
  } else {
    await prisma.lastScrape.create({
      data: {
        timestamp: new Date(),
      },
    });
  }
});

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
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

  // function extractDomainName(url: string): string | null {
  //   const regex = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/gim;
  //   const match = regex.exec(url);
  //   return match ? match[1] : null;
  // }

  // async function checkUrl(message: Message, url: string): Promise<void> {
  //   const domainName = extractDomainName(url);
  //   if (!domainName) {
  //     await message.channel.send(`Sorry, ${url} is not a valid URL.`);
  //     return;
  //   }
  //   if (!AcceptedDomains.includes(domainName)) {
  //     await message.channel.send(`Sorry, ${domainName} is not an supported domain.`);
  //     return;
  //   }
  //   await message.channel.send(`Great, ${domainName} is a supported domain!`);
  // }
  //Start   !maybe use a public class to separate and reduce excessive type-checking!
  


  const discordClient = new discordClientMessage()
  client.on('messageCreate', async (message: Message) => {
    if(!message.guild) {
      message.reply("I dont do DM's use commands in channel")
      return
    } 
    await discordClient.UserMessageHandler(message);

  });


}




  console.log("trying to log in");
  await client.login(process.env.DISCORD_TOKEN);
  const asurascans = new AsuraScans();
  const mangasee = new MangaSee();

  //Start job
  job.invoke();
  console.log("Running");
})().catch((e) => console.error(e));




// client.on(Events.MessageCreate, async (message: Message) => {
//   if (message.content.startsWith("!check")) {
//     const url = message.content.slice("!check".length).trim();
//     await checkUrl(message, url);
//   }

//   if (message.content.startsWith("!add")) {
//     const url = message.content.slice("!add".length).trim();
//     const domainName = extractDomainName(url);

//     if (!domainName) {
//       await message.channel.send(`Sorry, ${url} is not a valid URL.`);
//       return;
//     }
//     if (!AcceptedDomains.includes(domainName)) {
//       await message.channel.send(`Sorry, ${domainName} is not an supported domain.`);
//       return;
//     }

//     // Check if the series is already being watched
//     if (domainName === "asura.gg") {
//       const existingSeries = await prisma.series.findFirst({
//         where: {
//           title: await asurascans.getTitleName(url, browser),
//           url: url,
//           guildId: message.guildId!,
//         },
//       });
//       if (existingSeries) {
//         await message.channel.send(`<${url}> is already being watched!`);
//         return;
//       }
//     } else if (domainName === "mangasee123.com") {
//       if (!browser) {
//         throw new Error("browser doesnt exist");
//       }
//       const existingSeries = await prisma.series.findFirst({
//         where: {
//           url: url,
//           title: await mangasee.getTitleName(url, browser),
//           guildId: message.guildId!,
//         },
//       });
//       if (existingSeries) {
//         await message.channel.send(`<${url}> is already being watched!`);
//         return;
//       }
//     }

//     // Check if the series is scrapeable

//     //Send a message to the channel saying that the bot is checking if the series is scrapeable, delete the message after 10 seconds
//     const checkingMessage = await message.channel.send(`Checking if ${url} is scrapeable...`);

//     setTimeout(async () => {
//       await checkingMessage.delete();
//     }, 10000);

//     try {
//       if (domainName === "asura.gg") {
//         await asurascans.checkIfScrapeable(url, browser);
//       } else if (domainName === "mangasee123.com") {
//         await mangasee.checkIfScrapeable(url, browser);
//       }
//     } catch (e) {
//       await message.channel.send(
//         `${url} is not scrapeable...\n` + 'Make sure to link the URL at the "Home" page of the series.',
//       );
//       return;
//     }

//     //Set seriesTitle depending on the domain name
//     let seriesTitle = "";
//     if (domainName === "asura.gg") {
//       seriesTitle = await asurascans.getTitleName(url, browser);
//     } else if (domainName === "mangasee123.com") {
//       seriesTitle = await mangasee.getTitleName(url, browser);
//     }

//     console.log(seriesTitle);
//     console.log(domainName);
//     console.log(url);
//     console.log(message.guildId!);

//     await prisma.series.upsert({
//       where: {
//         title_source_guildId: {
//           title: seriesTitle,
//           source: domainName,
//           guildId: message.guildId!,
//         },
//       },
//       update: {
//         url: url,
//       },
//       create: {
//         title: seriesTitle,
//         source: domainName,
//         guildId: message.guildId!,
//         url: url,
//         channelId: message.channelId!,
//       },
//     });
//     await message.channel.send(`Added ${seriesTitle} to the watchlist!`);
//   }

//   if (message.content.startsWith("!remove")) {
//     const url = message.content.slice("!remove".length).trim();
//     const domainName = extractDomainName(url);
//     if (!domainName) {
//       await message.channel.send(`Sorry, ${url} is not a valid URL.`);
//       return;
//     }
//     if (!AcceptedDomains.includes(domainName)) {
//       await message.channel.send(`Sorry, ${domainName} is not an supported domain.`);
//       return;
//     }

//     //Set seriesTitle depending on the domain name

//     let seriesTitle = "";
//     if (domainName === "asura.gg") {
//       seriesTitle = await asurascans.getTitleName(url, browser);
//     } else if (domainName === "mangasee123.com") {
//       seriesTitle = await mangasee.getTitleName(url, browser);
//     }

//     console.log(seriesTitle);
//     console.log(domainName);
//     console.log(url);
//     console.log(message.guildId!);

//     await prisma.series.delete({
//       where: {
//         title_source_guildId: {
//           title: seriesTitle,
//           source: domainName,
//           guildId: message.guildId!,
//         },
//       },
//     });
//     await message.channel.send(`Removed ${seriesTitle} from the list of series to watch!`);
//   }

//   if (message.content.startsWith("!list")) {
//     const series = await prisma.series.findMany({
//       where: {
//         guildId: message.guildId!,
//       },
//     });
//     await message.channel.send(
//       `Here are the series you are watching:\n${series.map((s) => s.title + " : " + s.url).join("\n")}`,
//     );
//   }
// });