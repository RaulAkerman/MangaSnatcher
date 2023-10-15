import { Browser, Page } from "puppeteer";
import {
  Base,
  BrowserScape,
  Source,
  ScrapeResult,
  LatestChapterResult,
  SeriesInfoResult,
} from "../abstract/BaseScraper";

export default class AsuraScanScraper implements Base<BrowserScape> {
  private static readonly seriesSelector = ".series";
  private static readonly elementSelector = ".postbody";

  public async setupPage(browser: Browser): Promise<Page> {
    const page = await browser.newPage();
    await page.setCacheEnabled(false);
    return page;
  }

  private isValidSeries(series: any): boolean {
    return series.title && series.latestChapter && series.chapterUrl;
  }

  private async extractSeriesData(page: Page): Promise<{
    title: string;
    chapterUrl: string;
    latestChapter: string;
  } | null> {
    const elements = await page.$$(AsuraScanScraper.elementSelector);

    // Return the first valid series found, or null if none.
    for (const pageElement of elements) {
      const title = await pageElement.$eval(".entry-title", (element) => element.textContent);
      const latestChapter = await pageElement.$eval(".chapternum", (element) => element.textContent);
      const chapterUrl = await pageElement.$eval("ul li a", (element) => element.getAttribute("href") || "");
      if (!title || !latestChapter || !chapterUrl) {
        return null;
      }
      const seriesData = {
        title,
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
