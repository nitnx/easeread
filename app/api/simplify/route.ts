import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

type Level = "kids" | "easy" | "standard";

const LEVEL_INSTRUCTIONS: Record<Level, string> = {
  kids: "Rewrite for a 7-year-old. Use very short sentences (max 8 words). Use the simplest possible everyday words. Explain any hard idea in plain terms.",
  easy: "Rewrite at roughly a 5th-grade reading level. Use short, clear sentences. Replace jargon and long words with simple alternatives. Keep all the original meaning.",
  standard:
    "Rewrite at roughly an 8th-grade reading level. Keep sentences clear and direct. Simplify only the most complex words and break up very long sentences.",
};

function buildPrompt(text: string, level: Level) {
  return `You are EaseRead, an accessibility tool that makes text easier to read for people with dyslexia, ADHD, or low literacy.

${LEVEL_INSTRUCTIONS[level]}

Rules:
- Preserve the original meaning and all key facts. Do not add new information.
- Keep paragraphs short. Use a blank line between paragraphs.
- Do not use markdown, bullets, or headings unless the original had a clear list.
- Output ONLY the rewritten text, nothing else.

Original text:
"""
${text}
"""`;
}

// Lightweight fallback so the app still works without an API key (demo safety).
function fallbackSimplify(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .join("\n\n");
}

export async function POST(req: NextRequest) {
  let body: { text?: string; level?: Level };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const text = (body.text ?? "").trim();
  const level: Level = body.level ?? "easy";

  if (!text) {
    return NextResponse.json({ error: "Please provide some text to simplify." }, { status: 400 });
  }
  if (text.length > 8000) {
    return NextResponse.json({ error: "Text is too long. Please keep it under 8000 characters." }, { status: 400 });
  }

  // OpenAI-compatible provider (Qwen Cloud, DashScope, OpenRouter, etc.).
  const apiKey = process.env.LLM_API_KEY;
  const baseUrl = (process.env.LLM_BASE_URL ?? "").replace(/\/$/, "");
  const model = process.env.LLM_MODEL ?? "qwen-plus";

  if (!apiKey || !baseUrl) {
    return NextResponse.json({ simplified: fallbackSimplify(text), fallback: true, reason: "missing_config" });
  }

  const requestBody = JSON.stringify({
    model,
    temperature: 0.3,
    // DashScope/Qwen: thinking models require this to be false in non-streaming mode.
    enable_thinking: false,
    messages: [
      { role: "system", content: "You rewrite text to be easier to read. Output only the rewritten text." },
      { role: "user", content: buildPrompt(text, level) },
    ],
  });

  // Retry with exponential backoff to ride out transient rate limits (429).
  const maxAttempts = 3;
  let lastStatus = 0;
  let lastDetail = "";

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: requestBody,
      });

      if (res.ok) {
        const data = await res.json();
        const simplified: string = data.choices?.[0]?.message?.content?.trim() ?? "";
        if (!simplified) {
          return NextResponse.json({ simplified: fallbackSimplify(text), fallback: true, reason: "empty_response" });
        }
        return NextResponse.json({ simplified });
      }

      lastStatus = res.status;
      lastDetail = (await res.text()).slice(0, 300);
      console.error(`LLM error (attempt ${attempt + 1}):`, res.status, lastDetail);

      // Only rate-limit (429) is worth retrying; other errors fail fast.
      if (res.status !== 429 || attempt === maxAttempts - 1) break;
      await new Promise((r) => setTimeout(r, 600 * Math.pow(2, attempt)));
    } catch (err) {
      console.error("Simplify request failed:", err);
      return NextResponse.json({ simplified: fallbackSimplify(text), fallback: true, reason: "exception" });
    }
  }

  return NextResponse.json({
    simplified: fallbackSimplify(text),
    fallback: true,
    reason: `api_${lastStatus}`,
    detail: lastDetail,
  });
}
