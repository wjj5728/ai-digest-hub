import { NextResponse } from "next/server";

import { listDigests } from "@/lib/db/file-store";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = Number(url.searchParams.get("limit") || 10);
  const rows = await listDigests(Math.min(Math.max(limit, 1), 50));
  return NextResponse.json({ ok: true, count: rows.length, rows });
}
