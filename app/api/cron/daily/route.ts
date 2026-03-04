import { NextResponse } from "next/server";

import { summarizeTopItems } from "@/lib/analyst/summarize";
import { collectAllSources } from "@/lib/collector";
import { appendDigest } from "@/lib/db/file-store";
import { upsertMetrics } from "@/lib/db/metrics-store";
import { appendRunLog } from "@/lib/db/runlog-store";
import { getScheduleConfig } from "@/lib/db/schedule-store";
import { dedupeItems } from "@/lib/pipeline/dedupe";
import { buildDailyMetrics } from "@/lib/pipeline/metrics";
import { withRetry } from "@/lib/pipeline/retry";
import { scoreItems } from "@/lib/pipeline/score";
import { buildTopicStats } from "@/lib/pipeline/topics";
import { toMarkdown } from "@/lib/publisher/markdown";
import { publishAllChannels } from "@/lib/publisher";

export async function POST(request: Request) {
  const secret = request.headers.get("x-cron-secret");
  if (process.env.DIGEST_CRON_SECRET && secret !== process.env.DIGEST_CRON_SECRET) {
    await appendRunLog({ ts: Date.now(), stage: "auth", ok: false, detail: "unauthorized cron secret" });
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  try {
    const collected = await withRetry(() => collectAllSources(), 2, 500);
    const uniqueItems = dedupeItems(collected.items);
    const scored = scoreItems(uniqueItems);

    const schedule = await getScheduleConfig();
    const topN = schedule.topN || Number(process.env.DIGEST_TOP_N || 20);

    const digest = await summarizeTopItems(scored, topN);
    const topics = buildTopicStats(scored);
    const markdown = toMarkdown(digest.title, digest.body);

    const saved = await appendDigest(digest.title, markdown);
    const metrics = await upsertMetrics(buildDailyMetrics(scored));

    const published = schedule.autoPublish
      ? await withRetry(() => publishAllChannels(markdown), 2, 700)
      : [{ channel: "telegram", status: "mocked", detail: "autoPublish disabled" }];

    await appendRunLog({
      ts: Date.now(),
      stage: "daily",
      ok: true,
      detail: `raw=${collected.itemCount}, unique=${uniqueItems.length}, publish=${published.map((x) => `${x.channel}:${x.status}`).join("|")}`,
    });

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
      topics,
      saved,
      metrics,
      published,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    await appendRunLog({ ts: Date.now(), stage: "daily", ok: false, detail: message });
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
