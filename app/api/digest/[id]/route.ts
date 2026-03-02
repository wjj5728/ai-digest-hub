import { NextResponse } from "next/server";

import { getDigestById } from "@/lib/db/file-store";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const row = await getDigestById(id);
  if (!row) {
    return NextResponse.json({ ok: false, error: "digest not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, row });
}
