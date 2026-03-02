import { NextResponse } from "next/server";

import { summarizeTopItems } from "@/lib/analyst/summarize";
import { collectRss } from "@/lib/collector/rss";
import { dedupeItems } from "@/lib/pipeline/dedupe";
import { scoreItems } from "@/lib/pipeline/score";

export async function POST() {
  const collected = await collectRss();
  const uniqueItems = dedupeItems(collected.items);
  const scored = scoreItems(uniqueItems);
  const digest = summarizeTopItems(scored);

  return NextResponse.json({
    ok: true,
    stage: "analyze",
    rawCount: collected.itemCount,
    uniqueCount: uniqueItems.length,
    digest,
  });
}
