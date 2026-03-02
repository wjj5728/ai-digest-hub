export async function translateToChinese(text: string) {
  const apiKey = process.env.RAYINCODE_API_KEY;
  const baseUrl = process.env.RAYINCODE_BASE_URL || "https://api.rayincode.com/v1";
  const model = process.env.RAYINCODE_MODEL || "gpt-5.3-codex";

  if (!text.trim()) return "";

  if (!apiKey) {
    return `中文要点：${text}`;
  }

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content: "你是资讯翻译助手。请把输入内容翻译成简洁、自然的中文，不要添加编造信息。",
          },
          {
            role: "user",
            content: text,
          },
        ],
      }),
    });

    if (!res.ok) {
      return `中文要点：${text}`;
    }

    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const out = data.choices?.[0]?.message?.content?.trim();
    return out || `中文要点：${text}`;
  } catch {
    return `中文要点：${text}`;
  }
}
