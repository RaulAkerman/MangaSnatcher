import { Client, Events, GatewayIntentBits, managerToFetchingStrategyOptions } from "discord.js";
import { Message } from "discord.js";
import { CheckReturn, ExtractReturn, LatestReturn, Source, getDomainName } from "scraper/modules/base";
import { urlSearch, addSeriesToGuild, removeSeriesFromGuild, findSeriesByGuildId  } from "../prisma/Models/database.ts";
import { ScraperMethod } from "./scraper/abstract/BaseScraper.ts";
import { scraperCall } from "./scraper/child-process/handler.ts";

// const client = new Client({
//   intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
// });

enum DiscordUserCommand {
  UserCheck = "!check",
  UserAdd = "!add",
  UserRemove = "!remove",
  UserList = "!list",
}

interface DiscordInput<T> {
  ifCheck(message: Message): Promise<void>
  ifAdd(message: Message): Promise<void>
  ifRemove(message: Message): Promise<Message<true>> | Promise<Message<false>>
  ifList(message: Message): Promise<Message<true>> | Promise<Message<false>>
}

interface addSeriesToGuildInterface {
  title: string,
  url: string,
  source: string,
  latestChapter: string,
  latestChapterUrl: string 
}

class discordClientMessage {
  private extractDomainName(url: string): string | null {
    const regex = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/gim;
    const match = regex.exec(url);
    return match ? match[1] : null;
  }

  private async checkUrl(message: Message, url: string): Promise<boolean> {
    const domainName = this.extractDomainName(url);
    if (!domainName) {
      await message.channel.send(`Sorry, ${url} is not a valid URL.`);
      return false;
    } else if (!(domainName in Source)) {
      await message.channel.send(`Sorry, ${domainName} is not a supported domain.`);
      return false;
    } else {
      await message.channel.send(`Great, ${domainName} is a supported domain!`);
      return true;
    }
  }
  private async GuildHandler() {}

  public async UserMessageHandler(message: Message) {
    if (message.content.startsWith(DiscordUserCommand.UserCheck)) {
      const url = message.content.slice(DiscordUserCommand.UserCheck.length).trim();
      this.checkCommand(message, url);
      return;
    }
    if (message.content.startsWith(DiscordUserCommand.UserAdd)) {
      const url = message.content.slice(DiscordUserCommand.UserAdd.length).trim();
      this.addCommand(message, url);
      return;
    }
    if (message.content.startsWith(DiscordUserCommand.UserRemove)) {
      const url = message.content.slice(DiscordUserCommand.UserRemove.length).trim();
      this.removeCommand(message, url)
      return;
    }
    if (message.content.startsWith(DiscordUserCommand.UserList)) {
      const url = message.content.slice(DiscordUserCommand.UserList.length).trim();
      return;
    }
  }

  private async checkCommand(message: Message, url: string) {
    const isValid = await this.checkUrl(message, url);
    if (!isValid) {
      await message.channel.send( message.author + `sent a bad URL:` + url)
      return;
    }
    const seriesWatchedInGuild = await urlSearch(url, message.guildId!);
    if (!seriesWatchedInGuild) {
      const result = await scraperCall<CheckReturn>(url, ScraperMethod.Check);
      await message.channel.send(`Great, ${result.task[0].title}, Used !add ${url} to add to watch list`);
      return;
    }
    await message.channel.send(`Series is currently being watched`);
    return;
  }

  private async addCommand(message: Message, url: string) {
    const isValid = await this.checkUrl(message, url);
    if (!isValid) {
      await message.channel.send( message.author + `sent a bad URL:` + url)
      return;
    }
    const seriesWatchedInGuild = await urlSearch(url, message.guildId!);
    //If there is no currently watched series scrape the series, upsert using database.ts function
    if (!seriesWatchedInGuild) {
      const result = await scraperCall<ExtractReturn>(url, ScraperMethod.Extract);
      const resultAsSeries: addSeriesToGuildInterface = {
        title: result.task[0].title,
        url: result.task[0].Url,
        source: getDomainName(result.task[0].Url)!,
        latestChapter: result.task[0].latestChapter,
        latestChapterUrl: result.task[0].latestChapterUrl,
      };
      const dataBaseCall = await addSeriesToGuild(message.guildId!, resultAsSeries);
      await message.channel.send(`${dataBaseCall.action}`);
      return;
    }
    return;
  }

  private async removeCommand(message: Message, url: string) {
    const isValid = await this.checkUrl(message, url);
    if (!isValid) {
      await message.channel.send( message.author + `sent a bad URL:` + url)
      return;
    }
    const seriesWatchedInGuild = await urlSearch(url, message.guildId!);
    if(seriesWatchedInGuild) {
      const dataBaseCall = await removeSeriesFromGuild(message.guildId!, url)
      await message.channel.send(`${dataBaseCall.action}`)
      return
    }
    return
  }
}




