import { NextResponse } from "next/server";

import { collectRss } from "@/lib/collector/rss";
import { dedupeItems } from "@/lib/pipeline/dedupe";

export async function POST() {
  const collected = await collectRss();
  const uniqueItems = dedupeItems(collected.items);

  return NextResponse.json({
    ok: true,
    stage: "collect",
    collectedAt: collected.collectedAt,
    sourceCount: collected.sourceCount,
    rawCount: collected.itemCount,
    uniqueCount: uniqueItems.length,
    errors: collected.errors,
    items: uniqueItems.slice(0, 50),
  });
}
