import { NextResponse } from "next/server";
import { summarizeTopItems } from "@/lib/analyst/summarize";
import { collectRss } from "@/lib/collector/rss";
import { appendDigest } from "@/lib/db/file-store";
import { dedupeItems } from "@/lib/pipeline/dedupe";
import { scoreItems } from "@/lib/pipeline/score";
import { toMarkdown } from "@/lib/publisher/markdown";
import { publishTelegram } from "@/lib/publisher/telegram";

export async function POST(request: Request) {
  const secret = request.headers.get("x-cron-secret");
  if (process.env.DIGEST_CRON_SECRET && secret !== process.env.DIGEST_CRON_SECRET) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const collected = await collectRss();
  const uniqueItems = dedupeItems(collected.items);
  const scored = scoreItems(uniqueItems);
  const digest = summarizeTopItems(scored);
  const markdown = toMarkdown(digest.title, digest.body);
  const saved = await appendDigest(digest.title, markdown);
  const published = await publishTelegram(markdown);

  return NextResponse.json({
    ok: true,
    stage: "daily",
    collected: {
      rawCount: collected.itemCount,
      uniqueCount: uniqueItems.length,
      sourceCount: collected.sourceCount,
      errors: collected.errors,
    },
    digest,
    saved,
    published,
  });
}
