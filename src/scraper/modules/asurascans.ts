import type { Browser } from "puppeteer";
import { Base, BrowserScape } from "./base";
import { Source } from "./base"; // Import the Source enum from your code

export default class AsuraScanScraper implements Base<BrowserScape> {
  private siteUrl = "https://asura.gg/";

  public async scrape(options: BrowserScape): Promise<void> {
    const browser = options.browser;
    const url = options.url;

    const page = await browser.newPage();
    await page.setCacheEnabled(false);
    try {
      await page.goto(url, { waitUntil: "networkidle2" });
      await page.waitForSelector(".series");

      const series = await page.evaluate(() => {
        const elements = document.getElementsByClassName("uta");
        const pageElements = Array.from(elements);
        return pageElements.map((pageElement) => {
          const title = pageElement.querySelector("h4")?.textContent;
          const seriesUrl = pageElement.querySelector("a")?.getAttribute("href");
          const latestChapter = pageElement.querySelector("ul")?.querySelector("li")?.querySelector("a")?.textContent;
          const chapterUrl = pageElement
            .querySelector("ul")
            ?.querySelector("li")
            ?.querySelector("a")
            ?.getAttribute("href");
          return {
            title,
            seriesUrl,
            chapterUrl,
            latestChapter,
          };
        });
      });

      const validSeries = series.filter((s) => s.title && s.seriesUrl && s.latestChapter && s.chapterUrl);
      const scraperResults = validSeries.map((s) => {
        return {
          title: s.title!,
          latestChapter: s.latestChapter!,
          seriesUrl: s.seriesUrl!,
          source: Source.AsuraScans, // Use the Source enum from your code
          chapterUrl: s.chapterUrl!,
        };
      });

      // Handle your results here, you might want to store or process them as needed.

    } catch (e) {
      console.error(e);
    } finally {
      await page.close();
    }
  }

  public async latestChapter(options: BrowserScape): Promise<string> {
    // Implement the logic to get the latest chapter here
    // You can use the `options` parameter to access the browser and URL
    throw new Error("Method not implemented.");
  }

  public async seriesInfo(options: BrowserScape): Promise<string> {
    // Implement the logic to get series info here
    // You can use the `options` parameter to access the browser and URL
    throw new Error("Method not implemented.");
  }
}












// export default class AsuraScanScraper implements Base<BrowserScape> {
//   private siteUrl = "https://asura.gg/";
  
//   public async scrape(browser: Browser, url: string): Promise<ScraperResult[]> {
//     const page = await browser.newPage();
//     await page.setCacheEnabled(false);
//     try {
//       //page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));
//       await page.goto("https://asura.gg/", { waitUntil: "networkidle2" });
//       await page.waitForSelector(".series");
//       await page.screenshot({ path: "asura.png", fullPage: true });
//       const series = await page.evaluate(() => {
//         const elements = document.getElementsByClassName("uta");
//         const pageElements = Array.from(elements);
//         return pageElements.map((pageElement) => {
//           const title = pageElement.querySelector("h4")?.textContent;
//           const seriesUrl = pageElement.querySelector("a")?.getAttribute("href");
//           const latestChapter = pageElement.querySelector("ul")?.querySelector("li")?.querySelector("a")?.textContent;
//           const chapterUrl = pageElement
//             .querySelector("ul")
//             ?.querySelector("li")
//             ?.querySelector("a")
//             ?.getAttribute("href");
//           return {
//             title,
//             seriesUrl,
//             chapterUrl,
//             latestChapter,
//           };
//         });
//       });

//       return series
//         .filter((s) => s.title && s.seriesUrl && s.latestChapter && s.chapterUrl)
//         .map((s) => {
//           return {
//             title: s.title!,
//             latestChapter: s.latestChapter!,
//             seriesUrl: s.seriesUrl!,
//             source: ScraperSource.AsuraScans,
//             chapterUrl: s.chapterUrl!,
//           };
//         });
//     } catch (e) {
//       console.error(e);
//     } finally {
//       await page.close();
//     }
//     return [];
//   }

//   public async checkIfScrapeable(url: string, browser: Browser): Promise<boolean> {
//     const page = await browser.newPage();
//     await page.goto(url, { waitUntil: "networkidle2" });
//     await page.waitForSelector("h1.entry-title");
//     const title = await page.evaluate(() => {
//       const title = document.querySelector("h1.entry-title")?.textContent;

//       page.close();

//       return title;
//     });

//     page.close();

//     return title !== null && title !== undefined;
//   }

//   public async getTitleName(url: string, browser: Browser): Promise<string> {
//     const page = await browser.newPage();
//     await page.goto(url, { waitUntil: "networkidle2" });
//     await page.waitForSelector("h1.entry-title");
//     const title = await page.evaluate(() => {
//       const title = document.querySelector("h1.entry-title")?.textContent;
//       page.close();
//       return title;
//     });

//     page.close();
//     return title!;
//   }
// }
