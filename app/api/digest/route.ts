import { NextResponse } from "next/server";

import { summarizeTopItems } from "@/lib/analyst/summarize";
import { collectRss } from "@/lib/collector/rss";
import { appendDigest } from "@/lib/db/file-store";
import { dedupeItems } from "@/lib/pipeline/dedupe";
import { scoreItems } from "@/lib/pipeline/score";
import { buildTopicStats } from "@/lib/pipeline/topics";
import { toMarkdown } from "@/lib/publisher/markdown";

export async function POST() {
  const collected = await collectRss();
  const uniqueItems = dedupeItems(collected.items);
  const scored = scoreItems(uniqueItems);
  const digest = await summarizeTopItems(scored);
  const topics = buildTopicStats(scored);
  const markdown = toMarkdown(digest.title, digest.body);
  const saved = await appendDigest(digest.title, markdown);

  return NextResponse.json({ ok: true, stage: "digest", digest, topics, markdown, saved });
}
