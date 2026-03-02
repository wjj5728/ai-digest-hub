import { NextResponse } from "next/server";

import { summarizeTopItems } from "@/lib/analyst/summarize";
import { collectAllSources } from "@/lib/collector";import { dedupeItems } from "@/lib/pipeline/dedupe";
import { scoreItems } from "@/lib/pipeline/score";
import { toMarkdown } from "@/lib/publisher/markdown";
import { publishTelegram } from "@/lib/publisher/telegram";

export async function POST() {
  const collected = await collectAllSources();  const uniqueItems = dedupeItems(collected.items);
  const scored = scoreItems(uniqueItems);
  const digest = await summarizeTopItems(scored);
  const markdown = toMarkdown(digest.title, digest.body);
  const result = await publishTelegram(markdown);

  return NextResponse.json({
    ok: true,
    stage: "publish",
    digestTitle: digest.title,
    result,
  });
}
