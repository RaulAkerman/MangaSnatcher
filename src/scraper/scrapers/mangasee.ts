import { Browser, Page } from "puppeteer";
import {
  Base,
  BrowserScape,
  Source,
  ScrapeResult,
  LatestChapterResult,
  SeriesInfoResult,
} from "../abstract/BaseScraper";

export default class MangaSeeScraper implements Base<BrowserScape> {
  private static readonly seriesSelector = ".series";
  private static readonly elementSelector = "p-2 space-y-4 lg:col-span-2 lg:col-start-1 lg:p-0";

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
    const elements = await page.$$(MangaSeeScraper.elementSelector);
    // Return the first valid series found, or null if none.
    for (const pageElement of elements) {
      const title = await pageElement.$eval("li.list-group-item.d-none.d-sm-block", (element) => {
        const content = element.textContent;
        return content ? content.trim() : null;
      });
      // replace elements required to clean-up the latest chapter
      const latestChapter = await pageElement.$eval(
        "a.list-group-item.ChapterLink.ng-scope span.ng-binding",
        (element) => {
          const levelText = element.textContent
            ? element.textContent.trim().replace(/\n/g, " ").replace(/\s+/g, " ")
            : null;
          return levelText;
        },
      );
      const chapterUrl = await pageElement.$eval("a.list-group-item.ChapterLink.ng-scope", (element) =>
        element.getAttribute("href"),
      );
      //MAJOR CORRECTION NEEDED Chapters come out as /read-online/Oshi-no-Ko-chapter-126-page-1.html !!!!! NEED TO ADD SOURCE INFRONT!!!!
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
      await page.waitForSelector(MangaSeeScraper.seriesSelector);

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
      await page.waitForSelector(MangaSeeScraper.seriesSelector);

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
      await page.waitForSelector(MangaSeeScraper.seriesSelector);

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
