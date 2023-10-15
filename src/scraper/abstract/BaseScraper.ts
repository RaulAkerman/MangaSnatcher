import puppeteer, { Browser } from "puppeteer";
interface ScraperResult {
  title: string;
  url: string;
  latestChapterUrl: string;
  latestChapter: string;
  source: Source;
}


type ScraperTask = "check" | "extract" | "latest" | "check-return" | "extract-return" | "latest-return";

interface BaseTask {
  type: ScraperTask;
}

interface Check extends BaseTask {
  type: "check";
  task: Array<{
    id?: string;
    source: string;
    url: string;
  }>;
}

interface Extract extends BaseTask {
  type: "extract";
  task: Array<{
    id?: string;
    source: string;
    url: string;
  }>;
}

interface Latest extends BaseTask {
  type: "latest";
  task: Array<{
    id: string;
    source: string;
    url: string;
  }>;
}

interface CheckReturn extends BaseTask {
  type: "check";
  task: Array<{
    title: string;
  }>;
}

interface ExtractReturn extends BaseTask {
  type: "extract";
  task: Array<{
    title: string;
    Url: string;
    latestChapterUrl: string;
    latestChapter: string;
  }>;
}

interface LatestReturn extends BaseTask {
  type: "latest";
  task: Array<{
    id: string;
    latestChapterUrl: string;
    LatestChapter: string;
  }>;
}

type TaskType = Check | Extract | Latest;
type ReturnType = CheckReturn | ExtractReturn | LatestReturn;

// Type Check Functions

const isTypeCheck = (task: ReturnType): task is CheckReturn => {
  return task.type === "check";
};

const isTypeExtract = (task: ReturnType): task is ExtractReturn => {
  return task.type === "extract";
};

const isTypeLatest = (task: ReturnType): task is LatestReturn => {
  return task.type === "latest";
};

function decode(data: string):ReturnType {
  const decodedData = JSON.parse(atob(data));
  return decodedData
}

// Encoding and Decoding Functions

const encode = (data: any): string => {
  return btoa(JSON.stringify(data));
};


// Utility Function

const getDomainName = (url: string): string | null => {
  const regex = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/gim;
  const match = regex.exec(url);
  return match ? match[1] : null;
};

// Enum

enum ScraperMethod {
  Check = "check",
  Extract = "extract",
  Latest = "latest",
}



enum Source {
  AsuraScans = "asura.gg",
  MangaSee = "mangasee123.com",
  MangaDex = "mangadex.org",
  ReaperScans = "reaperscans.com",
}

type BrowserSources = Source.AsuraScans | Source.MangaSee | Source.ReaperScans;

type ApiSources = Source.MangaDex;

type BrowserScape = { browser: Browser; url: string };

type ApiScrape = { url: string };

interface Base<T> {
  scrape(options: T): Promise<ScrapeResult>
  latestChapter(options: T): Promise<LatestChapterResult>;
  seriesInfo(options: T): Promise<SeriesInfoResult>;
}
type ScrapeResult = {
  title: string;
  chapterUrl: string;
  latestChapter: string;
} | null;

type LatestChapterResult = {
  latestChapter: string;
} | null;

type SeriesInfoResult = {
  title: string;
} | null;

class AsuraScans implements Base<BrowserScape> {
  latestChapter(options: BrowserScape): Promise<LatestChapterResult> {
    throw new Error("Method not implemented.");
  }
  seriesInfo(options: BrowserScape): Promise<SeriesInfoResult | null> {
    throw new Error("Method not implemented.");
    // Check if scrapeable
  }
  scrape(options: BrowserScape): Promise<ScrapeResult | null> {
    throw new Error("Method not implemented.");
  }
}

class MangaSee implements Base<BrowserScape> {
  latestChapter(options: BrowserScape): Promise<LatestChapterResult> {
    throw new Error("Method not implemented.");
  }
  seriesInfo(options: BrowserScape): Promise<SeriesInfoResult | null> {
    throw new Error("Method not implemented.");
    // Check if scrapeable
  }
  scrape(options: BrowserScape): Promise<ScrapeResult | null> {
    throw new Error("Method not implemented.");
  }
}

class MangaDex implements Base<ApiScrape> {
  latestChapter(options: ApiScrape): Promise<LatestChapterResult> {
    throw new Error("Method not implemented.");
  }
  seriesInfo(options: ApiScrape): Promise<SeriesInfoResult | null> {
    throw new Error("Method not implemented.");
    // Check if scrapeable
  }
  scrape(options: ApiScrape): Promise<ScrapeResult | null> {
    throw new Error("Method not implemented.");
  }
}

class ReaperScans implements Base<BrowserScape> {
  latestChapter(options: BrowserScape): Promise<LatestChapterResult> {
    throw new Error("Method not implemented.");
  }
  seriesInfo(options: BrowserScape): Promise<SeriesInfoResult | null> {
    throw new Error("Method not implemented.");
    // Check if scrapeable
  }
  scrape(options: BrowserScape): Promise<ScrapeResult | null> {
    throw new Error("Method not implemented.");
  }
}

export {
  ScraperMethod,
  Source,
  BrowserSources,
  ApiSources,
  AsuraScans,
  MangaSee,
  MangaDex,
  ReaperScans,
  ScraperTask,
  BaseTask,
  ScraperResult,
  Check,
  Extract,
  Latest,
  CheckReturn,
  ExtractReturn,
  LatestReturn,
  TaskType,
  ReturnType,
  isTypeCheck,
  isTypeExtract,
  isTypeLatest,
  decode,
  encode,
  getDomainName,
  BrowserScape,
  ApiScrape,
  Base,
  ScrapeResult,
  LatestChapterResult,
  SeriesInfoResult,
};