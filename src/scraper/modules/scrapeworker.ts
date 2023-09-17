import MangaSeeScraper from './mangasee';
import AsuraScanScraper from './asurascans';
import puppeteer from 'puppeteer-extra';
import type { Series } from '@prisma/client';
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { decode } from "./base"
import TaskType, { Check, Extract, Latest } from './base.ts';

//#region 

import { BrowserSources, BrowserScape, ApiScrape, ApiSources, Base, Source, AsuraScans, MangaSee, ReaperScans, MangaDex } from './base';
type BrowserScraperMapper = {
  [key in BrowserSources]: Base<BrowserScape>;
};

type ApiScraperMapper = {
  [key in ApiSources]: Base<ApiScrape>;
};

const browserScraperMapper: BrowserScraperMapper = {
  [Source.AsuraScans]: new AsuraScans(),
  [Source.MangaSee]: new MangaSee(),
  [Source.ReaperScans]: new ReaperScans(),
};

const apiScraperMapper: ApiScraperMapper = {
  [Source.MangaDex]: new MangaDex(),
};

const isBrowserSource = (source: Source): source is BrowserSources => {
  return source in browserScraperMapper;
};

const isApiSource = (source: Source): source is ApiSources => {
  return source in apiScraperMapper;
};

type SourceToScrapeType = {
  [Source.AsuraScans]: BrowserScape;
  [Source.MangaSee]: BrowserScape;
  [Source.ReaperScans]: BrowserScape;
  [Source.MangaDex]: ApiScrape;
};

type ScraperMapper = {
  [key in Source]: Base<SourceToScrapeType[key]>;
};

const scraperMapper: ScraperMapper = {
  [Source.AsuraScans]: new AsuraScans(),
  [Source.MangaSee]: new MangaSee(),
  [Source.ReaperScans]: new ReaperScans(),
  [Source.MangaDex]: new MangaDex(),
};

//#endregion

const scraper = <S extends Source>(source: S): Base<SourceToScrapeType[S]> => {
  const base = scraperMapper[source];
  if (!base) {
    throw new Error(`Source ${source} not found`);
  }
  return base as Base<SourceToScrapeType[S]>;
};

puppeteer.use(StealthPlugin());

const args = Bun.argv.slice(2)

const rawData = args[0]

const data = decode<TaskType>(rawData)

for ( const task of data.task) {

}







// let scrapmethod = new Map<TaskType, IScraper>([
//   [Check, getTitleName],
//   [Extract, checkIfScrapeable],
//   [Latest, scrape]
// ]);

// let scrapers = new Map<ScraperSource, IScraper>([
//     [ScraperSource.AsuraScans, new AsuraScans()],
//     [ScraperSource.MangaSee, new MangaSee()]
// ]);

// async function main(series: Series[]) {
//   const browser = await puppeteer.launch({args: ["--no-sandbox", "--disable-setuid-sandbox"] });
//   const page = await browser.newPage();
//   await page.setCacheEnabled(false);

//   try {
    
//     for (const serie of series) {
//       let scrapeResults: Promise<ScraperResult[]> = scrapers.get(serie.source as ScraperSource).scrape(browser, [serie.url]);
//       let conditionedResults = JSON.stringify(scrapeResults);
//       const outputData = { conditionedResults };
//       console.error(outputData); // Use console.error for output data
//     }
//   } catch (error) {
//     console.error(`Error: ${error}`);
//   } finally {
//     await page.close();
//     await browser.close();
//   }
// }
