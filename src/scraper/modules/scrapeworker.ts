import MangaSee from './mangasee';
import AsuraScans from './asurascans';
import puppeteer from 'puppeteer-extra';
import type { Series } from '@prisma/client';
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { ScraperResult, IScraper, ScraperSource } from "./base";

puppeteer.use(StealthPlugin());


const inpDataArg = process.argv.find((a) => a.startsWith('--input-data'));
const inpDataB64 = inpDataArg ? inpDataArg.replace('--input-data', '') : '';
const inputData:Series[] = inpDataB64 ? JSON.parse(Buffer.from(inpDataB64, 'base64').toString()) : {};
let scrapers = new Map<ScraperSource, IScraper>([
    [ScraperSource.AsuraScans, new AsuraScans()],
    [ScraperSource.MangaSee, new MangaSee()]
]);

main(inputData);

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
