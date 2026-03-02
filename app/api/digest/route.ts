import { NextResponse } from "next/server";

import { summarizeTopItems } from "@/lib/analyst/summarize";
import { collectRss } from "@/lib/collector/rss";
import { dedupeItems } from "@/lib/pipeline/dedupe";
import { scoreItems } from "@/lib/pipeline/score";
import { toMarkdown } from "@/lib/publisher/markdown";

export async function POST() {
  const collected = await collectRss();
  const uniqueItems = dedupeItems(collected.items);
  const scored = scoreItems(uniqueItems);
  const digest = summarizeTopItems(scored);
  const markdown = toMarkdown(digest.title, digest.body);

  return NextResponse.json({ ok: true, stage: "digest", digest, markdown });
}
