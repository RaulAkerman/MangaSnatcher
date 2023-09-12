import { LastScrape, Prisma, PrismaPromise, Series, SeriesPayload } from "@prisma/client";
import { Message, Guild } from "discord.js";
import prisma from "./prisma";
import client from "./client";

//
export const getChannelInstances = async () => {
  let unfilteredChannels = await prisma.series.findMany({
    select: {
      channelId: true,
    },
  });

  const filteredChannels = unfilteredChannels.filter((channel, index, self) => {
    return index === self.findIndex((c) => c.channelId === channel.channelId);
  });
  return filteredChannels
};


//Finds series for a specific channel id
export const getSeriesByChannelId = async (args: string) => {
  const SeriesByChannelId = await prisma.series.findMany({
    where: {
      channelId: args,
    },
    select: {
      title: true,
      latestChapter: true,
    },
  });
  return SeriesByChannelId;
};

//Grabs all series and their latest chapers
//Later for performance make sure its only selecting columns for (s.title, latestChapter: s.latestChapter, source: s.source)
export const allLatestChapters = async () => {
  let data = await prisma.series
    .findMany()
    .then((series) => series.map((s) => ({ name: s.title, latestChapter: s.latestChapter, source: s.source })));
    return data
};

export const findGuildSeries = async (message: Guild, argsurl: string) => {
  const existingSeries = await prisma.series.findFirst({
    where: {
      url: argsurl,
      guildId: message.id!,
    },
  });
  if (!existingSeries) {
    return false;
  } else {
    return existingSeries;
  }
};

export const guildAddSeries = async (args: Series) => {
  await prisma.series.upsert({
    where: {
      title_source_guildId: {
        title: args.title,
        source: args.source,
        guildId: args.guildId!,
      },
    },
    update: {
      url: args.url,
    },
    create: {
      title: args.title,
      source: args.source,
      guildId: args.guildId!,
      url: args.url,
      channelId: args.channelId!,
    },
  });
};

export const guildDeleteSeries = async (args: Series) => {
  await prisma.series.delete({
    where: {
      title_source_guildId: {
        title: args.title,
        source: args.source,
        guildId: args.guildId,
      },
    },
  });
};

//------holding for making relational types later just ignore this
// export type Guildprop =
// PrismaClient.guildsGetPayload<{
//     include:{ Guild:true}
// }>;
