import { NextResponse } from "next/server";

import { renderDigestByAudience, type AudienceMode } from "@/lib/analyst/template";
import { summarizeTopItems } from "@/lib/analyst/summarize";
import { collectAllSources } from "@/lib/collector";
import { dedupeItems } from "@/lib/pipeline/dedupe";
import { scoreItems } from "@/lib/pipeline/score";
import { toMarkdown } from "@/lib/publisher/markdown";
import { publishAllChannels } from "@/lib/publisher";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const topN = Number(body?.topN || 20);
  const mode = String(body?.mode || "boss") as AudienceMode;

  const collected = await collectAllSources();
  const uniqueItems = dedupeItems(collected.items);
  const scored = scoreItems(uniqueItems);
  const digest = await summarizeTopItems(scored, topN);
  const rendered = renderDigestByAudience(digest, mode);
  const markdown = toMarkdown(rendered.title, rendered.body);
  const results = await publishAllChannels(markdown);

  return NextResponse.json({
    ok: true,
    stage: "publish",
    digestTitle: rendered.title,
    results,
  });
}
