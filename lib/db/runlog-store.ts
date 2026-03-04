import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const DATA_DIR = process.env.VERCEL ? "/tmp/ai-digest-hub" : join(process.cwd(), "data");
const FILE = join(DATA_DIR, "runlogs.json");

type RunLog = {
  ts: number;
  stage: string;
  ok: boolean;
  detail: string;
};

async function ensureDir() {
  await mkdir(DATA_DIR, { recursive: true });
}

async function loadAll(): Promise<RunLog[]> {
  await ensureDir();
  try {
    const raw = await readFile(FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function appendRunLog(log: RunLog) {
  const rows = await loadAll();
  rows.unshift(log);
  await writeFile(FILE, JSON.stringify(rows.slice(0, 100), null, 2), "utf8");
  return log;
}

export async function listRunLogs(limit = 20) {
  const rows = await loadAll();
  return rows.slice(0, limit);
}
