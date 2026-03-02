import { NextResponse } from "next/server";

import { collectAllSources } from "@/lib/collector";
import { dedupeItems } from "@/lib/pipeline/dedupe";

export async function POST() {
  const collected = await collectAllSources();
  const uniqueItems = dedupeItems(collected.items);

  return NextResponse.json({
    ok: true,
    stage: "collect",
    collectedAt: collected.collectedAt,
    sourceCount: collected.sourceCount,
    rawCount: collected.itemCount,
    uniqueCount: uniqueItems.length,
    errors: collected.errors,
    breakdown: collected.breakdown,
    items: uniqueItems.slice(0, 50),
  });
}
