import { SlashCommandBuilder, CommandInteraction } from "discord.js";
import {checkUrl} from "../utilities/checkurl"
import { isWatchedByGuild } from "prisma/Models/SeriesInGuild";
import { scraperCall } from "scraper/child-process/handler";
import { CheckReturn, ScraperMethod } from "scraper/abstract/BaseScraper";

const check: any  = {
	data: new SlashCommandBuilder()
		.setName('check')
		.setDescription('checks if a Url is Scrapable!')
        .addStringOption(option =>
            option.setName('url')
                .setDescription("Series Url to check")
                .setRequired(true)),
	async execute(interaction:CommandInteraction ) {

        const urlOption = interaction.options.get('url')?.type.toString()
        const isValid = await checkUrl(interaction, urlOption!);
    if (!isValid) {
      await interaction.reply( interaction.user + `sent a bad URL:` + urlOption)
      return;
    }
    const seriesWatchedInGuild = await isWatchedByGuild(urlOption!, interaction.guildId!);
    if (seriesWatchedInGuild == null) {
      const result = await scraperCall<CheckReturn>(urlOption!, ScraperMethod.Check);
      await interaction.reply(`Great, ${result.task[0].title}, Use /add ${urlOption!} to add to watch list`);
      return;
    }
    if(seriesWatchedInGuild == true) {
        await interaction.reply(`Supported, Use /add ${urlOption!} to add to watch list`);        
    }
    await interaction.reply(`Series is currently being watched`);
    return;
	},
};

export default check
