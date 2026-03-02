type PublishResult = {
  channel: "telegram";
  status: "sent" | "mocked" | "failed";
  messagePreview: string;
  detail?: string;
};

export async function publishTelegram(message: string): Promise<PublishResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  const dryRun = process.env.DIGEST_PUBLISH_DRY_RUN === "1";

  if (dryRun || !token || !chatId) {
    return {
      channel: "telegram",
      status: "mocked",
      messagePreview: message.slice(0, 120),
      detail: dryRun ? "DIGEST_PUBLISH_DRY_RUN=1" : "TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID missing",
    };
  }

  const endpoint = `https://api.telegram.org/bot${token}/sendMessage`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: message.slice(0, 4000),
      disable_web_page_preview: true,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    return {
      channel: "telegram",
      status: "failed",
      messagePreview: message.slice(0, 120),
      detail: `HTTP ${response.status}: ${detail.slice(0, 200)}`,
    };
  }

  return {
    channel: "telegram",
    status: "sent",
    messagePreview: message.slice(0, 120),
  };
}
