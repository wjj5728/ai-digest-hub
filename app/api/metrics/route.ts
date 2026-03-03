import { NextResponse } from "next/server";

import { listMetrics } from "@/lib/db/metrics-store";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = Number(url.searchParams.get("limit") || 7);
  const rows = await listMetrics(Math.min(Math.max(limit, 1), 30));
  return NextResponse.json({ ok: true, rows });
}
