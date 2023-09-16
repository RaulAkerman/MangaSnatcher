import MangaSee from './mangasee';
import AsuraScans from './asurascans';
import puppeteer from 'puppeteer-extra';
import type { Series } from '@prisma/client';
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import TaskType, { ScraperResult, IScraper, ScraperSource, ScraperMethod, Check, Extract, Latest, isTypeCheck} from "./base";
import { decode } from "./base"


puppeteer.use(StealthPlugin());

const args = Bun.argv.slice(2)

const rawData = args[0]

const dataa = decode<TaskType>(rawData)

switch (dataa.type) {
  case 'check':
    await Bun.write(Bun.stdout, `Check got url: ${dataa.url}`)
    break
  case 'extract':
    await Bun.write(Bun.stdout, `Extract got url: ${dataa.url}`)
    break
  case 'latest':
    await Bun.write(Bun.stdout, `Latest got urls: ${dataa.url}`)
    break
}







let scrapmethod = new Map<TaskType, IScraper>([
  [Check, new getTitleName()],
  [Extract, new checkIfScrapeable()],
  [Latest, new scrape()]
]);

let scrapers = new Map<ScraperSource, IScraper>([
    [ScraperSource.AsuraScans, new AsuraScans()],
    [ScraperSource.MangaSee, new MangaSee()]
]);

async function main(series: Series[]) {
  const browser = await puppeteer.launch({args: ["--no-sandbox", "--disable-setuid-sandbox"] });
  const page = await browser.newPage();
  await page.setCacheEnabled(false);

  try {
    
    for (const serie of series) {
      let scrapeResults: Promise<ScraperResult[]> = scrapers.get(serie.source as ScraperSource).scrape(browser, [serie.url]);
      let conditionedResults = JSON.stringify(scrapeResults);
      const outputData = { conditionedResults };
      console.error(outputData); // Use console.error for output data
    }
  } catch (error) {
    console.error(`Error: ${error}`);
  } finally {
    await page.close();
    await browser.close();
  }
}
