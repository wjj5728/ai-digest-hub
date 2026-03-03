import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const DATA_DIR = process.env.VERCEL ? "/tmp/ai-digest-hub" : join(process.cwd(), "data");
const FILE = join(DATA_DIR, "schedule-config.json");

export type ScheduleConfig = {
  timezone: string;
  hour: number;
  minute: number;
  autoPublish: boolean;
  topN: number;
};

const DEFAULT_CONFIG: ScheduleConfig = {
  timezone: "Asia/Shanghai",
  hour: 8,
  minute: 30,
  autoPublish: true,
  topN: 20,
};

async function ensureDir() {
  await mkdir(DATA_DIR, { recursive: true });
}

export async function getScheduleConfig(): Promise<ScheduleConfig> {
  await ensureDir();
  try {
    const raw = await readFile(FILE, "utf8");
    const parsed = JSON.parse(raw);
    return {
      timezone: String(parsed?.timezone || DEFAULT_CONFIG.timezone),
      hour: Number.isFinite(parsed?.hour) ? Number(parsed.hour) : DEFAULT_CONFIG.hour,
      minute: Number.isFinite(parsed?.minute) ? Number(parsed.minute) : DEFAULT_CONFIG.minute,
      autoPublish: Boolean(parsed?.autoPublish),
      topN: Number.isFinite(parsed?.topN) ? Number(parsed.topN) : DEFAULT_CONFIG.topN,
    };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export async function saveScheduleConfig(input: Partial<ScheduleConfig>) {
  const prev = await getScheduleConfig();
  const next: ScheduleConfig = {
    timezone: input.timezone || prev.timezone,
    hour: Number.isFinite(input.hour) ? Math.min(Math.max(Number(input.hour), 0), 23) : prev.hour,
    minute: Number.isFinite(input.minute) ? Math.min(Math.max(Number(input.minute), 0), 59) : prev.minute,
    autoPublish: typeof input.autoPublish === "boolean" ? input.autoPublish : prev.autoPublish,
    topN: Number.isFinite(input.topN) ? Math.min(Math.max(Number(input.topN), 1), 50) : prev.topN,
  };

  await ensureDir();
  await writeFile(FILE, JSON.stringify(next, null, 2), "utf8");
  return next;
}
