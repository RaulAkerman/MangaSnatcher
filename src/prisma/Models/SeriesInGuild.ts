import prisma from "../client"

export const isWatchedByGuild = async (inputUrl: string, guildId: string) => {
    const results = await prisma.series.findFirst({
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
        guilds: true
      },
    });
  if(!results) {
    const isWatchedByAGuild = await prisma.series.findFirst({
      where: {
        url: inputUrl,
      },
      select: {
        title: true,
      }
    });
      return true
    };
    return results ? results.title : null;
  }

  