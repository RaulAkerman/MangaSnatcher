import { Series, SeriesPayload } from '@prisma/client';
import * as path from 'path';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import TaskType, { PayloadTypeChecker, Check, Extract, Latest} from './base.ts';
import { getDomainName } from './base.ts';
// import { isTypeCheck, isTypeExtract, isTypeLatest } from './base.ts';
// Handler is called with an array of Series and string "method"
// We iterate through every series and map every series.url new array within a ScraperJob
//          - type: ("method"), (url[] || url)


function generateTaskData(seriesData: Series[] | Series | string): any[] {
  if (typeof seriesData === 'string') {
    return [{ source: getDomainName(seriesData), url: seriesData}];
  } else {
    const taskData = [];

    for (const series of Array.isArray(seriesData) ? seriesData : [seriesData]) {
      taskData.push({
        source: series.source,
        url: series.url,
        title: series.title,
      });
    }

    return taskData;
  }
}

function createCheckTask(taskType: Check, taskData: any[]): Check {
  return {
    ...taskType,
    task: {
      source: 'check-source',
      url: 'check-url',
    },
  };
}

function createExtractTask(taskType: Extract, taskData: any[]): Extract {
  return {
    ...taskType,
    task: taskData.map((data, index) => ({
      source: data.source,
      url: data.url,
    })),
  };
}

function createLatestTask(taskType: Latest, taskData: any[]): Latest {
  return {
    ...taskType,
    task: taskData.map((data, index) => ({
      id: data.id,
      source: data.source,
      url: data.url,
      title: data.title,
    })),
  };
}

function createTask(
  taskType: TaskType,
  taskData: any[]
): Check | Extract | Latest {
  if (taskType.type === 'check') {
    return createCheckTask(taskType, taskData);
  } else if (taskType.type === 'extract') {
    return createExtractTask(taskType, taskData);
  } else if (taskType.type === 'latest') {
    return createLatestTask(taskType, taskData);
  } else {
    throw new Error('Invalid task type');
  }
}









































puppeteer.use(StealthPlugin());

const __dirname = path.resolve();

const test:Series[] = [{
  id: "1",
  title: "The Saga of Tanya the Evil",
  url: "https://mangasee123.com/manga/Youjo-Senki",
  source: "mangasee123.com",
  latestChapter: "64",
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSrapedAt: new Date(),
  channelId: "Something",
  guildId: "Something Else"
}]


for (const obj of objectsToSend) {
  const base64 = btoa(JSON.stringify(obj))

  const proc = Bun.spawn(['bun', 'run', './scrapeworker.ts', base64], {
    cwd: "./src/scraper/modules",
    env: {}
  });

  const output = await new Response(proc.stdout).text();

  console.log(output);
}


/*
async function runPuppeteer(data: Series[]): Promise<any> {
  const jsonData = JSON.stringify(data);
  const b64Data = Buffer.from(jsonData).toString('base64');
  let stdoutData = '';

}

export const runner =async (data:Series[]) => {
  let i = 0;
  while (true) {
    const resData = await runPuppeteer(data);
    console.log(resData)
    if (!resData) {
      console.error('Was not able to load a page');
    }

    console.log('🎉 Scraper Spawned');
  }  
}
*/







