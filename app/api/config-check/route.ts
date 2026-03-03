import { NextResponse } from "next/server";

export async function GET() {
  const hasApiKey = Boolean(process.env.RAYINCODE_API_KEY);
  const baseUrl = process.env.RAYINCODE_BASE_URL || "https://api.rayincode.com/v1";
  const model = process.env.RAYINCODE_MODEL || "gpt-5.3-codex";

  return NextResponse.json({
    ok: true,
    provider: "rayincode",
    hasApiKey,
    baseUrl,
    model,
  });
}
