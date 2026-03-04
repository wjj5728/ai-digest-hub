export type WebhookPublishResult = {
  channel: "webhook";
  status: "sent" | "mocked" | "failed";
  detail?: string;
};

export async function publishWebhook(message: string): Promise<WebhookPublishResult> {
  const endpoint = process.env.DIGEST_WEBHOOK_URL;
  const dryRun = process.env.DIGEST_PUBLISH_DRY_RUN === "1";

  if (dryRun || !endpoint) {
    return {
      channel: "webhook",
      status: "mocked",
      detail: dryRun ? "DIGEST_PUBLISH_DRY_RUN=1" : "DIGEST_WEBHOOK_URL missing",
    };
  }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "ai-digest",
        ts: Date.now(),
        message,
      }),
    });

    if (!res.ok) {
      return { channel: "webhook", status: "failed", detail: `HTTP ${res.status}` };
    }

    return { channel: "webhook", status: "sent" };
  } catch (error) {
    return {
      channel: "webhook",
      status: "failed",
      detail: error instanceof Error ? error.message : "unknown",
    };
  }
}
