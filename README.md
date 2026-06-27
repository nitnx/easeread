# EaseRead — Read anything, your way

**Track 03 — AI That Actually Helps People** · Youth Code x AI

EaseRead is an AI reading assistant that rewrites any hard-to-read text into
plain, clear language. It's built for people with **dyslexia, ADHD, and low
literacy** — and for anyone who wants reading to feel less exhausting.

Paste a paragraph, an email, a legal notice, or a textbook page. EaseRead
rewrites it at the reading level you choose, then lets you tune how it looks and
even read it aloud.

## Why it matters

Roughly 1 in 5 people has a language-based learning difference like dyslexia.
Dense, jargon-heavy text shuts them out of information they have every right to
understand — school assignments, government letters, health instructions.
EaseRead removes that barrier in one click.

## Features

- **AI plain-language rewriting** at three reading levels (Kids / Easy / Standard)
- **Side-by-side view** so you can trust nothing was lost
- **Dyslexia-friendly font** (OpenDyslexic) toggle
- **Adjustable text size and line spacing** for comfortable reading
- **Read aloud** (text-to-speech) for multi-sensory support
- **Graceful demo mode** so the app works even without an API key

## Tech

- Next.js (App Router) + TypeScript
- Tailwind CSS v4 + shadcn/ui
- Any OpenAI-compatible LLM provider (Qwen Cloud, DashScope, OpenRouter, OpenAI)
- Web Speech API for read-aloud

## Run locally

```bash
npm install
cp .env.local.example .env.local   # set LLM_API_KEY, LLM_BASE_URL, LLM_MODEL
npm run dev
```

Open http://localhost:3000.

Without an API key the app still runs in demo mode (basic sentence splitting), so
the UI and accessibility features are always demoable.

## Accessibility notes

EaseRead is the product *and* an accessibility practice: keyboard-usable
controls, high-contrast text, adjustable typography, and an audio reading option.
