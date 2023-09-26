import type { Browser } from "puppeteer";
import puppeteer from "puppeteer";
// import AsuraScanscraper from "./asurascans"
import type { Series } from "@prisma/client";
import { getJSDocReturnType } from "typescript";

// Types

export interface ScraperResult {
  title: string;
  url: string;
  latestChapterUrl: string;
  latestChapter: string;
  source: Source;
}

export type ScraperTask = "check" | "extract" | "latest" | "check-return" | "extract-return" | "latest-return";

export interface BaseTask {
  type: ScraperTask;
}

export interface Check extends BaseTask {
  type: "check";
  task: Array<{
    id?: string;
    source: string;
    url: string;
  }>;
}

export interface Extract extends BaseTask {
  type: "extract";
  task: Array<{
    id?: string;
    source: string;
    url: string;
  }>;
}

export interface Latest extends BaseTask {
  type: "latest";
  task: Array<{
    id: string;
    source: string;
    url: string;
  }>;
}

export interface CheckReturn extends BaseTask {
  type: "check";
  task: Array<{
    title: string;
  }>;
}

export interface ExtractReturn extends BaseTask {
  type: "extract";
  task: Array<{
    title: string;
    Url: string;
    latestChapterUrl: string;
    latestChapter: string;
  }>;
}

export interface LatestReturn extends BaseTask {
  type: "latest";
  task: Array<{
    id: string;
    latestChapterUrl: string;
    LatestChapter: string;
  }>;
}

export type TaskType = Check | Extract | Latest;
export type ReturnType = CheckReturn | ExtractReturn | LatestReturn;

// Type Check Functions

export const isTypeCheck = (task: ReturnType): task is CheckReturn => {
  return task.type === "check";
};

export const isTypeExtract = (task: ReturnType): task is ExtractReturn => {
  return task.type === "extract";
};

export const isTypeLatest = (task: ReturnType): task is LatestReturn => {
  return task.type === "latest";
};

export function decode(data: string):ReturnType {
  const decodedData = JSON.parse(atob(data));
  return decodedData
}

// Encoding and Decoding Functions

export const encode = (data: any): string => {
  return btoa(JSON.stringify(data));
};


// Utility Function

export const getDomainName = (url: string): string | null => {
  const regex = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/gim;
  const match = regex.exec(url);
  return match ? match[1] : null;
};

// Enum

export enum ScraperMethod {
  Check = "check",
  Extract = "extract",
  Latest = "latest",
}



export enum Source {
  AsuraScans = "asura.gg",
  MangaSee = "mangasee123.com",
  MangaDex = "mangadex.org",
  ReaperScans = "reaperscans.com",
}

export type BrowserSources = Source.AsuraScans | Source.MangaSee | Source.ReaperScans;

export type ApiSources = Source.MangaDex;

export type BrowserScape = { browser: Browser; url: string };

export type ApiScrape = { url: string };

export interface Base<T> {
  scrape(options: T): Promise<ScrapeResult>
  latestChapter(options: T): Promise<LatestChapterResult>;
  seriesInfo(options: T): Promise<SeriesInfoResult>;
}

export type ScrapeResult = {
  title: string;
  chapterUrl: string;
  latestChapter: string;
} | null;

export type LatestChapterResult = {
  latestChapter: string;
} | null;

export type SeriesInfoResult = {
  title: string;
} | null;

export class AsuraScans implements Base<BrowserScape> {
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

export class MangaSee implements Base<BrowserScape> {
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

export class MangaDex implements Base<ApiScrape> {
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

export class ReaperScans implements Base<BrowserScape> {
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

export default TaskType;
