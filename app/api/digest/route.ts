import { NextResponse } from "next/server";

import { summarizeTopItems } from "@/lib/analyst/summarize";
import { collectAllSources } from "@/lib/collector";
import { appendDigest } from "@/lib/db/file-store";
import { upsertMetrics } from "@/lib/db/metrics-store";
import { dedupeItems } from "@/lib/pipeline/dedupe";
import { buildDailyMetrics } from "@/lib/pipeline/metrics";
import { scoreItems } from "@/lib/pipeline/score";
import { buildTopicStats } from "@/lib/pipeline/topics";
import { toMarkdown } from "@/lib/publisher/markdown";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const topN = Number(body?.topN || 20);

  const collected = await collectAllSources();
  const uniqueItems = dedupeItems(collected.items);
  const scored = scoreItems(uniqueItems);
  const digest = await summarizeTopItems(scored, topN);
  const topics = buildTopicStats(scored);
  const markdown = toMarkdown(digest.title, digest.body);
  const saved = await appendDigest(digest.title, markdown);
  const metrics = await upsertMetrics(buildDailyMetrics(scored));

  return NextResponse.json({ ok: true, stage: "digest", digest, topics, markdown, saved, metrics });
}
