import { NextResponse } from "next/server";

import { listRunLogs } from "@/lib/db/runlog-store";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = Number(url.searchParams.get("limit") || 20);
  const rows = await listRunLogs(Math.min(Math.max(limit, 1), 100));
  return NextResponse.json({ ok: true, rows });
}
