export async function publishTelegram(message: string) {
  return {
    channel: "telegram",
    status: "mocked",
    messagePreview: message.slice(0, 120)
  };
}
