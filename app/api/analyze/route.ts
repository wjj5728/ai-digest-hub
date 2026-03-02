import { NextResponse } from "next/server";
import { summarizeItems } from "@/lib/analyst/summarize";

export async function POST() {
  const digest = await summarizeItems();
  return NextResponse.json({ ok: true, stage: "analyze", digest });
}
