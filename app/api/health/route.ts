import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ ok: true, service: "ai-digest-hub", ts: Date.now() });
}
