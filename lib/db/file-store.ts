import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const DATA_DIR = join(process.cwd(), "data");
const DIGEST_FILE = join(DATA_DIR, "daily-digests.json");

type DigestRecord = {
  id: string;
  createdAt: number;
  title: string;
  body: string;
};

async function ensureDataDir() {
  await mkdir(DATA_DIR, { recursive: true });
}

async function loadAll(): Promise<DigestRecord[]> {
  await ensureDataDir();
  try {
    const raw = await readFile(DIGEST_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function saveAll(rows: DigestRecord[]) {
  await ensureDataDir();
  await writeFile(DIGEST_FILE, JSON.stringify(rows, null, 2), "utf8");
}

export async function appendDigest(title: string, body: string) {
  const rows = await loadAll();
  const record: DigestRecord = {
    id: `${Date.now()}`,
    createdAt: Date.now(),
    title,
    body,
  };
  rows.unshift(record);
  await saveAll(rows.slice(0, 100));
  return record;
}

export async function listDigests(limit = 10) {
  const rows = await loadAll();
  return rows.slice(0, limit);
}
