import type { Browser } from "puppeteer"
import puppeteer from "puppeteer"
import AsuraScans from "./asurascans"
import type { Series } from "@prisma/client"

export enum ScraperSource {
  MangaDex = "MangaDex",
  AsuraScans = "asura.gg",
  MangaSee = "mangasee123.com",
}

export interface ScraperResult {
  title: string
  seriesUrl: string
  chapterUrl: string
  latestChapter: string
  source: ScraperSource
}

export interface IScraper {
    scrape(browser: Browser, urls: string[]): Promise<Array<ScraperResult>>;
    checkIfScrapeable(url: string, browser: Browser): Promise<boolean>;
    getTitleName(url: string, browser: Browser): Promise<string>;
}


type ScraperTask = 'check' | 'extract' | 'latest';

export interface BaseTask {
  type: ScraperTask;
}

export interface Check extends BaseTask {
  type: 'check';
  task: Array<{
    id?:String,
    source:string,
    url:string
  }>,
}

export interface Extract extends BaseTask {
  type: 'extract';
  task: Array<{
    id?:String,
    source:string,
    url:string
  }>,
}

export interface Latest extends BaseTask {
  type: 'latest';
  task: Array<{
    id:String,
    source:string,
    url:string
  }>,
}

export type TaskType = Check | Extract | Latest;

export const isTypeCheck = (task: TaskType): task is Check => {
  return task.type === 'check';
}

export const isTypeExtract = (task: TaskType): task is Extract => {
  return task.type === 'extract';
}

export const isTypeLatest = (task: TaskType): task is Latest => {
  return task.type === 'latest';
}

export const PayloadTypeChecker = (params: TaskType,) => {
  if (isTypeCheck(params) || isTypeExtract(params) || isTypeLatest(params)) {
    return true
  } else {
    return new Error("Task passed into Payload is invalid");
  }
};

export const encode = (data: any): string => {
  return btoa(JSON.stringify(data))
}

export function decode<T>(data: string): T {
  return JSON.parse(atob(data))
}

export const getDomainName = (url: string): string | null => {
  const regex = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/gim;
  const match = regex.exec(url);
  return match ? match[1] : null;
}

export enum ScraperMethod {
  Check = 'check',
  Extract = 'extract',
  Latest = 'latest',
}

export default TaskType;
