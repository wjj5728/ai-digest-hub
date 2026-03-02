import { NextResponse } from "next/server";
import { summarizeItems } from "@/lib/analyst/summarize";
import { toMarkdown } from "@/lib/publisher/markdown";

export async function POST() {
  const digest = await summarizeItems();
  const markdown = toMarkdown(digest.title, digest.body);
  return NextResponse.json({ ok: true, stage: "digest", digest, markdown });
}
