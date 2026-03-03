import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const DATA_DIR = process.env.VERCEL ? "/tmp/ai-digest-hub" : join(process.cwd(), "data");
const METRICS_FILE = join(DATA_DIR, "daily-metrics.json");

type MetricsRecord = {
  date: string;
  total: number;
  aCount: number;
  bCount: number;
  cCount: number;
  dCount: number;
};

async function ensureDataDir() {
  await mkdir(DATA_DIR, { recursive: true });
}

async function loadAll(): Promise<MetricsRecord[]> {
  await ensureDataDir();
  try {
    const raw = await readFile(METRICS_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function saveAll(rows: MetricsRecord[]) {
  await ensureDataDir();
  await writeFile(METRICS_FILE, JSON.stringify(rows, null, 2), "utf8");
}

export async function upsertMetrics(record: MetricsRecord) {
  const rows = await loadAll();
  const next = rows.filter((x) => x.date !== record.date);
  next.unshift(record);
  await saveAll(next.slice(0, 14));
  return record;
}

export async function listMetrics(limit = 7) {
  const rows = await loadAll();
  return rows.slice(0, limit).reverse();
}
