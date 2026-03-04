import { publishTelegram } from "@/lib/publisher/telegram";
import { publishWebhook } from "@/lib/publisher/webhook";

export async function publishAllChannels(message: string) {
  const channels = (process.env.DIGEST_CHANNELS || "telegram").split(",").map((x) => x.trim()).filter(Boolean);

  const results = [] as Array<{ channel: string; status: string; detail?: string }>;

  if (channels.includes("telegram")) {
    results.push(await publishTelegram(message));
  }
  if (channels.includes("webhook")) {
    results.push(await publishWebhook(message));
  }

  if (results.length === 0) {
    results.push({ channel: "none", status: "mocked", detail: "no enabled channels" });
  }

  return results;
}
