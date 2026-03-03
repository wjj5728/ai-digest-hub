import { NextResponse } from "next/server";

import { getResolvedSources } from "@/lib/config/sources-runtime";
import { upsertSourceSetting } from "@/lib/db/source-settings";

export async function GET() {
  const rows = await getResolvedSources();
  return NextResponse.json({ ok: true, rows });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const id = String(body?.id || "").trim();
  if (!id) return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });

  const enabled = typeof body?.enabled === "boolean" ? body.enabled : undefined;
  const weight = Number.isFinite(Number(body?.weight)) ? Number(body.weight) : undefined;

  const saved = await upsertSourceSetting({ id, enabled, weight });
  return NextResponse.json({ ok: true, saved });
}
