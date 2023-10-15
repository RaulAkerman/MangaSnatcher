import { CommandInteraction, CommandInteractionOption } from "discord.js";
import { Source } from "scraper/abstract/BaseScraper";

function extractDomainName(url: string): string | null {
    const regex = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/gim;
    const match = regex.exec(url);
    return match ? match[1] : null;
  }

export async function checkUrl(interaction: CommandInteraction, url:string): Promise<boolean> {
    const domainName = extractDomainName(url);
    if (!domainName) {
      await interaction.reply(`Sorry, ${url} is not a valid URL.`);
      return false;
    } else if (!(domainName in Source)) {
      await interaction.reply(`Sorry, ${domainName} is not a supported domain.`);
      return false;
    } else {
      await interaction.reply(`Great, ${domainName} is a supported domain!`);
      return true;
    }
  }
