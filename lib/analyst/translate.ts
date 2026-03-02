const TERM_MAP: Array<[RegExp, string]> = [
  [/\bOpenAI\b/gi, "OpenAI"],
  [/\bAnthropic\b/gi, "Anthropic"],
  [/\bGoogle\b/gi, "Google"],
  [/\bMistral\b/gi, "Mistral"],
  [/\bHugging Face\b/gi, "Hugging Face"],
  [/\bmodel(s)?\b/gi, "模型"],
  [/\brelease(d)?\b/gi, "发布"],
  [/\blaunch(ed)?\b/gi, "上线"],
  [/\bupdate(d)?\b/gi, "更新"],
  [/\bfeature(s)?\b/gi, "功能"],
  [/\bpolicy\b/gi, "政策"],
  [/\bsafety\b/gi, "安全"],
  [/\bbenchmark(s)?\b/gi, "基准测试"],
  [/\breal[- ]?time\b/gi, "实时"],
  [/\btranscribe|transcription\b/gi, "转写"],
  [/\bimage\b/gi, "图像"],
  [/\bvideo\b/gi, "视频"],
  [/\bspeech\b/gi, "语音"],
];

function heuristicTranslate(text: string) {
  let out = text;
  for (const [pattern, word] of TERM_MAP) {
    out = out.replace(pattern, word);
  }
  out = out.replace(/\s{2,}/g, " ").trim();
  return `中文摘要：${out}`;
}

function looksMostlyEnglish(text: string) {
  const ascii = (text.match(/[A-Za-z]/g) || []).length;
  const cjk = (text.match(/[\u4e00-\u9fff]/g) || []).length;
  return ascii > cjk * 2;
}

export async function translateToChinese(text: string) {
  const apiKey = process.env.RAYINCODE_API_KEY;
  const baseUrl = process.env.RAYINCODE_BASE_URL || "https://api.rayincode.com/v1";
  const model = process.env.RAYINCODE_MODEL || "gpt-5.3-codex";

  if (!text.trim()) return "";

  if (!apiKey) {
    return heuristicTranslate(text);
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
      return heuristicTranslate(text);
    }

    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const out = data.choices?.[0]?.message?.content?.trim();
    if (!out) return heuristicTranslate(text);
    if (looksMostlyEnglish(out)) return heuristicTranslate(text);
    return out;
  } catch {
    return heuristicTranslate(text);
  }
}
