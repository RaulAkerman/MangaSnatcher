import type { Browser } from "puppeteer";
import { ScraperResult, Base, BrowserScape } from "./base";
import { Source } from "./base"; // Import the Source enum from your code

export default class MangaSeeScraper implements Base<BrowserScape> {
  public async scrape(options: BrowserScape): Promise<void> {
    // const browser = options.browser;
    // const urls = options.url;

    const page = await options.browser.newPage();
    await page.setCacheEnabled(false);
    console.log("Scraping MangaSee");
    let series: ScraperResult[] = [];
    let seriesUrllist: string[] = [];
    // Go to each url and scrape
    try {
      for (const url of options.url) {
        seriesUrllist.push(url);
        console.log(`Scraping ${url} for series \n`);
        await page.goto(url, { waitUntil: "networkidle2" });
        await page.screenshot({ path: "mangasee.png", fullPage: true });
        await page.waitForSelector(".list-group.top-10.bottom-5.ng-scope");
        await page.waitForSelector("li.list-group-item.d-none.d-sm-block > h1");
        const data = (await page.evaluate(() => {
          const siteUrl = "https://mangasee123.com";
          const title = document.querySelector("li.list-group-item.d-none.d-sm-block > h1")?.textContent;
          const chapterUrl =
            siteUrl +
            document
              .querySelector(".list-group-item.ChapterLink")
              ?.getAttribute("href")
              ?.replace(/-page-\d+\.html$/, ".html");
          const regex = /chapter-(\d+)/;
          const latestChapter = chapterUrl?.match(regex)?.[1];
          if (!title || !latestChapter || !chapterUrl) {
            console.error(`Error scraping`);
            return [];
          }
          console.log(`Scraped ${title} ${latestChapter} ${chapterUrl}`);
          return {
            title,
            latestChapter,
            chapterUrl,
          };
        })) as any;
        series.push(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      await page.close();
    }

    return series
      .filter((s) => s.title && s.latestChapter && s.chapterUrl)
      .map((s) => {
        return {
          title: s.title!,
          latestChapter: s.latestChapter!,
          seriesUrl: seriesUrllist[series.findIndex((s) => s.title === s.title)],
          source: Source.MangaSee, // Use the Source enum from your code
          chapterUrl: s.chapterUrl!,
        };
      });
  }

  public async latestChapter(options: BrowserScape): Promise<string> {
    const browser = options.browser;
    const url = options.url;

    const page = await browser.newPage();
    try {
      await page.goto(url, { waitUntil: "networkidle2" });
      await page.waitForSelector("li.list-group-item.d-none.d-sm-block > h1");
      const title = await page.evaluate(() => {
        const title = document.querySelector("li.list-group-item.d-none.d-sm-block > h1")?.textContent;
        return title;
      });

      await page.close();

      return title || "";
    } catch (e) {
      console.error(e);
      return "";
    }
  }

  public async seriesInfo(options: BrowserScape): Promise<string> {
    // Implement the logic to get series info here
    // You can use the `options` parameter to access the browser and URL
    // You can follow a similar structure as the `latestChapter` method
    throw new Error("Method not implemented.");
  }
}



// import type { Browser } from "puppeteer";
// import { ScraperResult, IScraper, ScraperSource } from "./base";

// export default class MangaSeeScraper implements IScraper {
//   public async scrape(browser: Browser, urls: string[]): Promise<ScraperResult[]> {
//     const page = await browser.newPage();
//     await page.setCacheEnabled(false);
//     console.log("Scraping MangaSee");
//     let series: ScraperResult[] = [];
//     let seriesUrllist: string[] = [];
//     // Go to each url and scrape
//     try {
//       for (const url of urls) {
//         seriesUrllist.push(url);
//         console.log(`Scraping ${url} for series \n`);
//         await page.goto(url, { waitUntil: "networkidle2" });
//         await page.screenshot({ path: "mangasee.png", fullPage: true });
//         await page.waitForSelector(".list-group.top-10.bottom-5.ng-scope");
//         await page.waitForSelector("li.list-group-item.d-none.d-sm-block > h1");
//         const data = (await page.evaluate(() => {
//           const siteUrl = "https://mangasee123.com";
//           const title = document.querySelector("li.list-group-item.d-none.d-sm-block > h1")?.textContent;
//           const chapterUrl =
//             siteUrl +
//             document
//               .querySelector(".list-group-item.ChapterLink")
//               ?.getAttribute("href")
//               ?.replace(/-page-\d+\.html$/, ".html");
//           const regex = /chapter-(\d+)/;
//           const latestChapter = chapterUrl?.match(regex)?.[1];
//           if (!title || !latestChapter || !chapterUrl) {
//             console.error(`Error scraping`);
//             return [];
//           }
//           console.log(`Scraped ${title} ${latestChapter} ${chapterUrl}`);
//           return {
//             title,
//             latestChapter,
//             chapterUrl,
//           };
//         })) as any;
//         series.push(data);
//       }
//     } catch (e) {
//       console.error(e);
//     } finally {
//       await page.close();
//     }

//     return series
//       .filter((s) => s.title && s.latestChapter && s.chapterUrl)
//       .map((s) => {
//         return {
//           title: s.title!,
//           latestChapter: s.latestChapter!,
//           seriesUrl: seriesUrllist[series.findIndex((s) => s.title === s.title)],
//           source: ScraperSource.MangaSee,
//           chapterUrl: s.chapterUrl!,
//         };
//       });
//   }

//   public async checkIfScrapeable(url: string, browser: Browser): Promise<boolean> {
//     const page = await browser.newPage();
//     try {
//       await page.goto(url, { waitUntil: "networkidle2" });
//       await page.waitForSelector("li.list-group-item.d-none.d-sm-block > h1");
//       const title = await page.evaluate(() => {
//         const title = document.querySelector("li.list-group-item.d-none.d-sm-block > h1")?.textContent;

//         //Close the page we opened here
//         // page.close();
//         return title;
//       });
//       console.log(title + "after scrap check");
//       //Close the page we opened here
//       await page.close();

//       return title !== null && title !== undefined;
//     } catch (e) {
//       console.error(e);
//     }
//     // finally {
//     //   await page.close();
//     // }
//     // return false;
//   }

//   public async getTitleName(url: string, browser: Browser): Promise<string> {
//     const page = await browser.newPage();
//     await page.goto(url, { waitUntil: "networkidle2" });
//     await page.screenshot({ path: "mangasee.png", fullPage: true });
//     await page.waitForSelector("li.list-group-item.d-none.d-sm-block > h1");
//     const title = await page.evaluate(() => {
//       const title = document.querySelector("li.list-group-item.d-none.d-sm-block > h1")?.textContent;

//       //Close the page we opened here
//       // page.close();

//       return title;
//     });

//     //Close the page we opened here
//     await page.close();

//     return title!;
//   }
// }
