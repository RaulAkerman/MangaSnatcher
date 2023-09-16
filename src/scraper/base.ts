import type { Browser } from "puppeteer"
import puppeteer from "puppeteer"
import AsuraScans from "./modules/asurascans"

export enum ScraperSource {
  MangaDex = "MangaDex",
  AsuraScans = "asura.gg",
  MangaSee = "mangasee123.com",
}



export interface ScraperResult {
  title: string
  seriesUrl: string
  chapterUrl: string
  latestChapter: string
  source: ScraperSource
}

export interface IScraper {
    scrape(browser: Browser, urls: string[]): Promise<Array<ScraperResult>>;
    checkIfScrapeable(url: string, browser: Browser): Promise<boolean>;
    getTitleName(url: string, browser: Browser): Promise<string>;
}

