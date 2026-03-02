import { NextResponse } from "next/server";
import { publishTelegram } from "@/lib/publisher/telegram";

export async function POST() {
  const result = await publishTelegram("[MVP] AI 日报分发测试消息");
  return NextResponse.json({ ok: true, stage: "publish", result });
}
