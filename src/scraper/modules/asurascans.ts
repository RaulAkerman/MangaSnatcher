import puppeteer, { Browser, Page } from "puppeteer";
import { Base, BrowserScape, Source } from "./base";
import type { ScrapeResult, LatestChapterResult, SeriesInfoResult } from "./base";

export default class AsuraScanScraper implements Base<BrowserScape> {
  private static readonly seriesSelector = ".series";
  private static readonly elementSelector = ".uta";

  public async setupPage(browser: Browser): Promise<Page> {
    const page = await browser.newPage();
    await page.setCacheEnabled(false);
    return page;
  }

  private isValidSeries(series: any): boolean {
    return series.title && series.seriesUrl && series.latestChapter && series.chapterUrl;
  }

  private async extractSeriesData(page: Page): Promise<{
    title: string;
    seriesUrl: string;
    chapterUrl: string;
    latestChapter: string;
  } | null> {
    const elements = await page.$$(AsuraScanScraper.elementSelector);

    // Return the first valid series found, or null if none.
    for (const pageElement of elements) {
      const title = await pageElement.$eval("h4", (element) => element.textContent || "");
      const seriesUrl = await pageElement.$eval("a", (element) => element.getAttribute("href") || "");
      const latestChapter = await pageElement.$eval("ul li a", (element) => element.textContent || "");
      const chapterUrl = await pageElement.$eval("ul li a", (element) => element.getAttribute("href") || "");

      const seriesData = {
        title,
        seriesUrl,
        chapterUrl,
        latestChapter,
      };

      if (this.isValidSeries(seriesData)) {
        return seriesData;
      }
    }

    return null; // Return null if no valid series found.
  }

  public async scrape(options: BrowserScape): Promise<ScrapeResult> {
    const url = options.url;
    const browser = options.browser;
    const page = await this.setupPage(browser);

    try {
      await page.goto(url, { waitUntil: "networkidle2" });
      await page.waitForSelector(AsuraScanScraper.seriesSelector);

      return await this.extractSeriesData(page);
    } catch (e) {
      console.error(e);
      throw e; // Handle the error as needed.
    } finally {
      await page.close();
    }
  }

  public async latestChapter(options: BrowserScape): Promise<LatestChapterResult> {
    const url = options.url;
    const browser = options.browser;
    const page = await this.setupPage(browser);

    try {
      await page.goto(url, { waitUntil: "networkidle2" });
      await page.waitForSelector(AsuraScanScraper.seriesSelector);

      const seriesData = await this.extractSeriesData(page);
      if (seriesData) {
        return { latestChapter: seriesData.latestChapter };
      } else {
        return null;
      }
    } catch (e) {
      console.error(e);
      throw e; // Handle the error as needed.
    } finally {
      await page.close();
    }
  }

  public async seriesInfo(options: BrowserScape): Promise<SeriesInfoResult> {
    const url = options.url;
    const browser = options.browser;
    const page = await this.setupPage(browser);

    try {
      await page.goto(url, { waitUntil: "networkidle2" });
      await page.waitForSelector(AsuraScanScraper.seriesSelector);

      const seriesData = await this.extractSeriesData(page);
      if (seriesData) {
        return { title: seriesData.title };
      } else {
        return null;
      }
    } catch (e) {
      console.error(e);
      throw e; // Handle the error as needed.
    } finally {
      await page.close();
    }
  }
}
