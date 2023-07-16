import type { Browser } from "puppeteer";
import { ScraperResult, IScraper, ScraperSource } from "../base";

export default class AsuraScans implements IScraper {
  private siteUrl = "https://www.asurascans.com";
  public async scrape(browser: Browser): Promise<ScraperResult[]> {
    const page = await browser.newPage();
    //page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));
    await page.goto("https://www.asurascans.com", { waitUntil: "networkidle2" });
    await page.waitForSelector(".series");
    await page.screenshot({ path: "asura.png", fullPage: true });
    const series = await page.evaluate(() => {
      const elements = document.getElementsByClassName("uta");
      const pageElements = Array.from(elements);
      return pageElements.map((pageElement) => {
        const title = pageElement.querySelector("h4")?.textContent;
        const seriesUrl = pageElement.querySelector("a")?.getAttribute("href");
        const latestChapter = pageElement.querySelector("ul")?.querySelector("li")?.querySelector("a")?.textContent;
        const chapterUrl = pageElement.querySelector("ul")?.querySelector("li")?.querySelector("a")?.getAttribute("href");
        return {
          title,
          seriesUrl,
          chapterUrl,
          latestChapter,
        };
      });
    });
    return series.filter(
      (s) => s.title && s.seriesUrl && s.latestChapter && s.chapterUrl
    ).map((s) => {
      return {
        title: s.title!,
        latestChapter: s.latestChapter!,
        seriesUrl: s.seriesUrl!,
        source: ScraperSource.AsuraScans,
        chapterUrl: s.chapterUrl!,
        };
    });
  }

  public async checkIfScrapeable(url: string, browser: Browser): Promise<boolean> {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });
    await page.waitForSelector("h1.entry-title");
    const title = await page.evaluate(() => {
      const title = document.querySelector("h1.entry-title")?.textContent;
      return title;
    });
    return title !== null && title !== undefined;
  }

  public async getTitleName(url: string, browser: Browser): Promise<string> {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });
    await page.waitForSelector("h1.entry-title");
    const title = await page.evaluate(() => {
      const title = document.querySelector("h1.entry-title")?.textContent;
      return title;
    });
    return title!;
  }
}
