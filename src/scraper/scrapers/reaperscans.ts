import { Browser, Page } from "puppeteer";
import {
  Base,
  BrowserScape,
  Source,
  ScrapeResult,
  LatestChapterResult,
  SeriesInfoResult,
} from "../abstract/BaseScraper";

export default class ReaperScanScraper implements Base<BrowserScape> {
  private static readonly seriesSelector = ".series";
  private static readonly elementSelector = ".mb-auto";

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
    const elements = await page.$$(ReaperScanScraper.elementSelector);
    for (const pageElement of elements) {
      const title = await pageElement.$eval("h1", (element) => element.textContent?.trim() || null);
      const latestChapter = await pageElement.$eval(
        "p.truncate.font-medium.text-neutral-200",
        (element) => element.textContent?.trim() || null,
      );
      const chapterUrl = await pageElement.$eval("a", (element) => element.getAttribute("href"));

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
      await page.waitForSelector(ReaperScanScraper.seriesSelector);

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
      await page.waitForSelector(ReaperScanScraper.seriesSelector);

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
      await page.waitForSelector(ReaperScanScraper.seriesSelector);

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
