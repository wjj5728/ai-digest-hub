import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const DATA_DIR = process.env.VERCEL ? "/tmp/ai-digest-hub" : join(process.cwd(), "data");
const SETTINGS_FILE = join(DATA_DIR, "source-settings.json");

type SourceSetting = {
  id: string;
  enabled?: boolean;
  weight?: number;
};

async function ensureDataDir() {
  await mkdir(DATA_DIR, { recursive: true });
}

export async function listSourceSettings(): Promise<SourceSetting[]> {
  await ensureDataDir();
  try {
    const raw = await readFile(SETTINGS_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function upsertSourceSetting(input: SourceSetting) {
  const rows = await listSourceSettings();
  const next = rows.filter((x) => x.id !== input.id);
  next.push(input);
  await writeFile(SETTINGS_FILE, JSON.stringify(next, null, 2), "utf8");
  return input;
}
