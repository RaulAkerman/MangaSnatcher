import { spawn, ChildProcess } from 'child_process';
import { Series, SeriesPayload } from '@prisma/client';
import * as path from 'path';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from "puppeteer-extra-plugin-stealth";

export type series = Series

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

async function runPuppeteer(data: Series[]): Promise<any> {
  const jsonData = JSON.stringify(data);
  const b64Data = Buffer.from(jsonData).toString('base64');
  let stdoutData = '';

  return new Promise((resolve) => {
    const proc: ChildProcess = spawn('node', [
      'src/scraper/modules/scrapeworker.ts',
      `--input-data${b64Data}`,
      '--tagprocess'
    ], { shell: false });

    proc.stdout.on('data', (data) => {
      stdoutData += data;
    });

    proc.stderr.on('data', (data) => {
      console.error(`NodeERR: ${data}`);
    });

    proc.on('close', async (code) => {
      // Handle the close event if needed
    });

    proc.on('exit', () => {
      proc.kill();
      resolve(JSON.parse(stdoutData));
    });
  });
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