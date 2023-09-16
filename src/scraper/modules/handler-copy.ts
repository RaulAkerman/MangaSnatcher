import { Series } from "@prisma/client";
import { Base64String } from "discord.js";
import path from "path";

function decodeUTF8(s:any){
    return decodeURIComponent(escape(s))
}

//Spawns the child process "puppeteer scraper" and sends/recieves an encoded payload "Series[]"
// --export const scraperspawn =async (payload:Series[])
export const scraperspawn = async () => {
  //  --const encodedPayload:Base64String = Buffer.from(JSON.stringify(payload)).toString('base64');
  const proc = Bun.spawn(["bun", "run", "worker"], {
    stdout: "pipe",
    stdin: "pipe",
  });
  const enc = new TextEncoder();
  proc.stdin.write(enc.encode("hello"));
  proc.stdin.flush();

  let output = await new Response(proc.stdout)

  //    --proc.stdin.write(encodedPayload)
  const procReturn = await new Response(proc.stdout);
  //    --const procReturn = await new Response(proc.stdout).text()
  //    --const decodedResponse:Series[] = JSON.parse(procReturn)
  //temp for debugging "checks if it was killed "
  console.log("spawning scraper at" + Date.now());
  console.log(proc.pid);
  console.log(proc.exitCode);
  console.log(decodeUTF8(output) + "and" + procReturn);
  if (!proc.killed) {
    console.log("process didnt die");
    proc.kill
  }
  return;
};
