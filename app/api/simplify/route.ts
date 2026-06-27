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

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ simplified: fallbackSimplify(text), fallback: true });
  }

  const model = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: buildPrompt(text, level) }] }],
          generationConfig: { temperature: 0.3 },
        }),
      }
    );

    if (!res.ok) {
      const detail = await res.text();
      console.error("Gemini error:", detail);
      return NextResponse.json({ simplified: fallbackSimplify(text), fallback: true });
    }

    const data = await res.json();
    const simplified: string =
      data.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("").trim() ?? "";

    if (!simplified) {
      return NextResponse.json({ simplified: fallbackSimplify(text), fallback: true });
    }

    return NextResponse.json({ simplified });
  } catch (err) {
    console.error("Simplify request failed:", err);
    return NextResponse.json({ simplified: fallbackSimplify(text), fallback: true });
  }
}
