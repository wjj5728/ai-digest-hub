import { NextResponse } from "next/server";
import { collectRss } from "@/lib/collector/rss";
import { summarizeItems } from "@/lib/analyst/summarize";
import { toMarkdown } from "@/lib/publisher/markdown";
import { publishTelegram } from "@/lib/publisher/telegram";

export async function POST(request: Request) {
  const secret = request.headers.get("x-cron-secret");
  if (process.env.DIGEST_CRON_SECRET && secret !== process.env.DIGEST_CRON_SECRET) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const collected = await collectRss();
  const digest = await summarizeItems();
  const markdown = toMarkdown(digest.title, digest.body);
  const published = await publishTelegram(markdown);

  return NextResponse.json({ ok: true, stage: "daily", collected, digest, published });
}
