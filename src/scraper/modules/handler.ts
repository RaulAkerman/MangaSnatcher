import { Series } from '@prisma/client';
import TaskType, { Check, Extract, Latest } from './base.ts';
import { getDomainName, BaseTask } from './base.ts';
import { ScraperMethod } from './base.ts';
import { EnumMember } from 'typescript';
// import { isTypeCheck, isTypeExtract, isTypeLatest } from './base.ts';
// Handler is called with an array of Series and string "method"
// We iterate through every series and map every series.url new array within a ScraperJob
//          - type: ("method"), (url[] || url)


//dumbyload for testing
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

type ScraperMethodToTaskType = {
  [ScraperMethod.Check]: Check;
  [ScraperMethod.Extract]: Extract;
  [ScraperMethod.Latest]: Latest; // Example mapping, adjust as needed
};

function generateBaseTask(method: ScraperMethod): TaskType | undefined {
  let taskType: TaskType | undefined;

  if (method === ScraperMethod.Check) {
    taskType = { type: "check", task: [] };
  } else if (method === ScraperMethod.Extract) {
    taskType = { type: "extract", task: [] };
  } else if (method === ScraperMethod.Latest) {
    taskType = { type: "latest", task: [] };
  } else {
    console.log("Invalid scraper method");
  }

  return taskType;
}

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
    task: taskData.map((data) => ({
      source: data.source,
      url: data.url,
    })),
  };
}

function createExtractTask(taskType: Extract, taskData: any[]): Extract {
  return {
    ...taskType,
    task: taskData.map((data) => ({
      source: data.source,
      url: data.url,
    })),
  };
}

function createLatestTask(taskType: Latest, taskData: any[]): Latest {
  return {
    ...taskType,
    task: taskData.map((data) => ({
      id: data.id,
      source: data.source,
      url: data.url,
      title: data.title,
    })),
  };
}

function createTask(
  taskType: TaskType | undefined,
  taskData: any[],
): Check | Extract | Latest {
  if (taskType === undefined) {
    throw new Error('Invalid task type');
  }
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

// Example of createTask syntax
export const scraperCall = async (seriesInput: Series[] | Series | string, method: ScraperMethod) => {

  const tasklist = createTask(generateBaseTask(method), generateTaskData(seriesInput));

  const base64 = btoa(JSON.stringify(tasklist));

  const proc = Bun.spawn(["bun", "run", "./scrapeworker.ts", base64], {
    cwd: "./src/scraper/modules",
    env: {},
  });

  const encodedoutput = await new Response(proc.stdout).text();

  let output = atob(encodedoutput)

  console.log(output)
  return true
};
