import { NextResponse } from "next/server";

import { getScheduleConfig, saveScheduleConfig } from "@/lib/db/schedule-store";

export async function GET() {
  const config = await getScheduleConfig();
  return NextResponse.json({ ok: true, config });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const saved = await saveScheduleConfig({
    timezone: body?.timezone,
    hour: body?.hour,
    minute: body?.minute,
    autoPublish: body?.autoPublish,
    topN: body?.topN,
  });
  return NextResponse.json({ ok: true, config: saved });
}
