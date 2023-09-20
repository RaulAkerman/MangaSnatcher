import type { Browser } from "puppeteer";
import puppeteer from "puppeteer";
// import AsuraScanscraper from "./asurascans"
import type { Series } from "@prisma/client";

// Types

export interface ScraperResult {
  title: string;
  seriesUrl: string;
  chapterUrl: string;
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
  type: "check-return";
  task: Array<{
    title: string;
  }>;
}

export interface ExtractReturn extends BaseTask {
  type: "extract-return";
  task: Array<{
    title: string;
    chapterurl: string;
    seriesUrl: string;
    latestChapter: string;
  }>;
}

export interface LatestReturn extends BaseTask {
  type: "extract-return";
  task: Array<{
    id: string;
    ChapterUrl: string;
    LatestChapter: string;
  }>;
}

export type TaskType = Check | Extract | Latest;
export type ReturnType = CheckReturn | ExtractReturn | LatestReturn;

// Type Check Functions

export const isTypeCheck = (task: TaskType): task is Check => {
  return task.type === "check";
};

export const isTypeExtract = (task: TaskType): task is Extract => {
  return task.type === "extract";
};

export const isTypeLatest = (task: TaskType): task is Latest => {
  return task.type === "latest";
};

// Payload Type Checker Function

export const PayloadTypeChecker = (params: TaskType) => {
  if (isTypeCheck(params) || isTypeExtract(params) || isTypeLatest(params)) {
    return true;
  } else {
    return new Error("Task passed into Payload is invalid");
  }
};

// Encoding and Decoding Functions

export const encode = (data: any): string => {
  return btoa(JSON.stringify(data));
};

export function decode<T>(data: string): T {
  return JSON.parse(atob(data));
}

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
  MangaDex = "MangaDex",
  ReaperScans = "ReaperScans",
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
  seriesUrl: string;
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
