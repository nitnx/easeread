export type ReadingLevel = "kids" | "easy" | "standard"

export const SAMPLE_TEXT =
  "Notwithstanding the inclement meteorological conditions, the expedition's participants endeavored to commence their ascent at dawn. Subsequently, they encountered numerous obstacles that necessitated considerable perseverance and collaboration in order to facilitate a successful summit attempt."

// Common hard words mapped to plain alternatives.
const REPLACEMENTS: Record<string, string> = {
  notwithstanding: "even with",
  inclement: "bad",
  meteorological: "weather",
  conditions: "conditions",
  "expedition's": "team's",
  expedition: "trip",
  participants: "people",
  endeavored: "tried",
  endeavour: "try",
  commence: "start",
  commenced: "started",
  ascent: "climb",
  dawn: "sunrise",
  subsequently: "after that",
  encountered: "met",
  numerous: "many",
  obstacles: "problems",
  necessitated: "needed",
  considerable: "a lot of",
  perseverance: "not giving up",
  collaboration: "teamwork",
  facilitate: "help",
  successful: "good",
  summit: "top",
  attempt: "try",
  utilize: "use",
  utilized: "used",
  approximately: "about",
  demonstrate: "show",
  additional: "more",
  assistance: "help",
  purchase: "buy",
  sufficient: "enough",
  require: "need",
  required: "needed",
  obtain: "get",
  prior: "before",
  regarding: "about",
  numerousness: "amount",
  therefore: "so",
  however: "but",
  furthermore: "also",
  consequently: "so",
}

function replaceHardWords(text: string): string {
  return text.replace(/[A-Za-z']+/g, (word) => {
    const lower = word.toLowerCase()
    const swap = REPLACEMENTS[lower]
    if (!swap) return word
    // Preserve leading capital.
    if (word[0] === word[0].toUpperCase()) {
      return swap.charAt(0).toUpperCase() + swap.slice(1)
    }
    return swap
  })
}

function splitIntoSentences(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .trim()
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean)
}

// Break a long sentence into shorter chunks at connective words.
function breakLongSentence(sentence: string, maxWords: number): string[] {
  const words = sentence.split(" ")
  if (words.length <= maxWords) return [sentence]

  const connectors = new Set(["and", "but", "so", "because", "after", "then", "while", "or"])
  const chunks: string[] = []
  let current: string[] = []

  for (const word of words) {
    const clean = word.replace(/[.,;:]/g, "").toLowerCase()
    if (current.length >= maxWords && connectors.has(clean)) {
      chunks.push(current.join(" "))
      current = []
    }
    current.push(word)
  }
  if (current.length) chunks.push(current.join(" "))

  return chunks.map((chunk) => {
    let c = chunk.trim()
    c = c.charAt(0).toUpperCase() + c.slice(1)
    if (!/[.!?]$/.test(c)) c += "."
    return c
  })
}

const LEVEL_CONFIG: Record<ReadingLevel, { maxWords: number; intro?: string }> = {
  kids: { maxWords: 8, intro: "Here is the easy story:" },
  easy: { maxWords: 12 },
  standard: { maxWords: 20 },
}

export function simplifyText(input: string, level: ReadingLevel): string {
  const trimmed = input.trim()
  if (!trimmed) return ""

  const config = LEVEL_CONFIG[level]
  const swapped = replaceHardWords(trimmed)
  const sentences = splitIntoSentences(swapped)

  const rebuilt = sentences.flatMap((sentence) => breakLongSentence(sentence, config.maxWords))

  if (level === "kids") {
    const lines = rebuilt.map((s) => `• ${s}`)
    return [config.intro, "", ...lines].join("\n")
  }

  if (level === "easy") {
    return rebuilt.join("\n\n")
  }

  return rebuilt.join(" ")
}
