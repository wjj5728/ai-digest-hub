import { NextResponse } from "next/server";
import { collectRss } from "@/lib/collector/rss";

export async function POST() {
  const data = await collectRss();
  return NextResponse.json({ ok: true, stage: "collect", data });
}
