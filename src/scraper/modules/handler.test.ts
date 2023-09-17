import { Series } from "@prisma/client";
import TaskType, { Check, Extract, Latest } from "./base.ts";
import { getDomainName, BaseTask } from "./base.ts";
import { ScraperMethod } from "./base.ts";
import {
  generateBaseTask,
  generateTaskData,
  createCheckTask,
  createExtractTask,
  createLatestTask,
  createTask,
  scraperCall,
} from "./handler.ts";
import { Test, describe, expect, test } from "bun:test";
import { isTypeCheck, isTypeExtract, isTypeLatest } from "./base.ts";

//#region
const testObj1: Series[] = [
  {
    id: "1",
    title: "The Saga of Tanya the Evil",
    url: "https://mangasee123.com/manga/Youjo-Senki",
    source: "mangasee123.com",
    latestChapter: "64",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSrapedAt: new Date(),
    channelId: "Something",
    guildId: "Something Else",
  },
];

const testObj2: Series[] = [
  {
    id: "1",
    title: "The Saga of Tanya the Evil",
    url: "https://mangasee123.com/manga/Youjo-Senki",
    source: "mangasee123.com",
    latestChapter: "64",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSrapedAt: new Date(),
    channelId: "Something",
    guildId: "Something Else",
  },
  {
    id: "1",
    title: "The Saga of Tanya the Evil",
    url: "https://mangasee123.com/manga/Youjo-Senki",
    source: "mangasee123.com",
    latestChapter: "64",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSrapedAt: new Date(),
    channelId: "Something",
    guildId: "Something Else",
  },
  {
    id: "1",
    title: "The Saga of Tanya the Evil",
    url: "https://mangasee123.com/manga/Youjo-Senki",
    source: "mangasee123.com",
    latestChapter: "64",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSrapedAt: new Date(),
    channelId: "Something",
    guildId: "Something Else",
  },
];

//#endregion

//Needs implementation good starting point
/*
describe("creating Task Lists of different types", () => {
  test("Generating CheckTask List from single Series", () => {
    const checkTasklist = createTask(generateBaseTask(ScraperMethod.Check), generateTaskData(testObj1));
    expect();
  });
  test("Generating CheckTask List from multiple Series", () => {
    const checkTasklist = createTask(generateBaseTask(ScraperMethod.Check), generateTaskData(testObj2));
    expect();
  });
  test("Generating ExtractTask List from single Series", () => {
    const extractTasklist = createTask(generateBaseTask(ScraperMethod.Extract), generateTaskData(testObj1));
    expect();
  });
  test("Generating ExtractTask List from multiple Series", () => {
    const extractTasklist = createTask(generateBaseTask(ScraperMethod.Extract), generateTaskData(testObj2));
    expect();
  });
  test("Generating LatestTask List from single Series", () => {
    const latestTasklist = createTask(generateBaseTask(ScraperMethod.Latest), generateTaskData(testObj1));
    expect();
  });
  test("Generating LatestTask List from multiple Series", () => {
    const latestTasklist = createTask(generateBaseTask(ScraperMethod.Latest), generateTaskData(testObj2));
    expect();
  });
});
*/