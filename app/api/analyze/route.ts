import { NextResponse } from "next/server";

import { summarizeTopItems } from "@/lib/analyst/summarize";
import { collectAllSources } from "@/lib/collector";
import { dedupeItems } from "@/lib/pipeline/dedupe";
import { scoreItems } from "@/lib/pipeline/score";
import { buildTopicStats } from "@/lib/pipeline/topics";

export async function POST() {
  const collected = await collectAllSources();  const uniqueItems = dedupeItems(collected.items);
  const scored = scoreItems(uniqueItems);
  const digest = await summarizeTopItems(scored);
  const topics = buildTopicStats(scored);

  return NextResponse.json({
    ok: true,
    stage: "analyze",
    rawCount: collected.itemCount,
    uniqueCount: uniqueItems.length,
    digest,
    topics,
  });
}
