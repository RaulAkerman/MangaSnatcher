import { ExtractReturn } from "../../scraper/abstract/BaseScraper";
import { addSeriesToGuildInterface } from "client";
import prisma from "./prisma";
import { GatewayIntentBits } from "discord.js";

// const client = new Client({
//   intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
// });

//checks if a guild is currently watching a series
const isWatchedByGuild = async (inputUrl: string, guildId: string) => {
  const results = await prisma.series.findMany({
    where: {
      url: inputUrl,
      guilds: {
        some: {
          id: guildId,
        },
      },
    },
    select: {
      title: true,
    },
  });

  return results.length > 0 ? results[0].title : null;
};

export async function addSeriesToGuild(guildId: string, seriesData:addSeriesToGuildInterface) {
  // Check if the series already exists in any guild
  const existingSeries = await prisma.series.findFirst({
    where: {
      url: seriesData.url,
    },
  });

  if (existingSeries) {
    // Series already exists, check if it's associated with the given guild
    const isSeriesAssociatedWithGuild = await prisma.seriesInGuild.findFirst({
      where: {
        seriesId: existingSeries.id,
        guildId: guildId,
      },
    });

    if (!isSeriesAssociatedWithGuild) {
      // If the series is not associated with the given guild, associate it
      await prisma.seriesInGuild.create({
        data: {
          seriesId: existingSeries.id,
          guildId: guildId,
        },
      });

      // Return an object indicating what happened
      return { series: existingSeries, action: 'Series was added' };
    }

    // Return an object indicating what happened
    return { series: existingSeries, action: 'Series was already watched' };
  } else {
    // Series doesn't exist, create it and associate it with the guild
    const newSeries = await prisma.series.create({
      data: {
        title: seriesData.title,
        url: seriesData.url,
        source: seriesData.source,
        latestChapter: seriesData.latestChapter,
        latestChapterUrl: seriesData.latestChapterUrl,
        guilds: {
          connect: {
            id: guildId,
          },
        },
      },
    });

    // Return an object indicating that the series was added
    return { series: newSeries, action: 'Series was added' };
  }
}



export async function removeSeriesFromGuild(guildId: string, seriesUrl: string) {
  // Check if the series with the specified URL is associated with the specified guild
  const isSeriesAssociatedWithGuild = await prisma.seriesInGuild.findFirst({
    where: {
      series: {
        url: seriesUrl,
      },
      guildId,
    },
  });

  if (isSeriesAssociatedWithGuild) {
    // If the series is associated with the guild, delete the association
    await prisma.seriesInGuild.delete({
      where: {
        id: isSeriesAssociatedWithGuild.id,
      },
    });

    // Check if any other guilds are still associated with the series
    const otherGuilds = await prisma.seriesInGuild.findFirst({
      where: {
        series: {
          url: seriesUrl,
        },
        NOT: {
          guildId,
        },
      },
    });

    // If no other guilds are associated, delete the series
    if (!otherGuilds) {
      await prisma.series.deleteMany({
        where: {
          url: seriesUrl,
        },
      });

      // Return an object indicating that the series was removed
      return { action: "Series was Removed" };
    } else {
      // Return an object indicating that the series association was removed
      return { action: "Series was Removed" };
    }
  } else {
    // Series is not associated with the specified guild
    // You can return an object indicating that the series doesn't exist
    return { action: "Series doesn't exist" };
  }
}



export async function findSeriesByGuildId(guildId: string) {
  // Find all series associated with the specified guild
  const series = await prisma.seriesInGuild.findMany({
    where: {
      guildId,
    },
    include: {
      series: true,
    },
  });

  // Extract the series data from the result
  const seriesData = series.map((seriesInGuild) => seriesInGuild.series);

  return seriesData;
}



export async function updateSeriesLatestChapter(seriesId: string, newLatestChapter: string, newLatestChapterUrl:string ) {
  // Update the series's latestChapter
  const updatedSeries = await prisma.series.update({
    where: {
      id: seriesId,
    },
    data: {
      latestChapter: newLatestChapter,
      latestChapterUrl: newLatestChapterUrl,
    },
    include: {
      SeriesInGuild: {
        include: {
          guild: true,
        },
      },
    },
  });

  // Extract the associated guilds from the updated series
  const associatedGuilds = updatedSeries.SeriesInGuild.map((entry) => entry.guild);

  return { action: 'updated', series: updatedSeries, guilds: associatedGuilds };
}
