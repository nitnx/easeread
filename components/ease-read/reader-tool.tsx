"use client"

import { useState, useEffect, useRef } from "react"
import { Sparkles, Volume2, Square, Type, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { SegmentedControl } from "@/components/ease-read/segmented-control"
import { simplifyText, SAMPLE_TEXT, type ReadingLevel } from "@/lib/simplify"

const LEVEL_OPTIONS = [
  { value: "kids" as const, label: "Kids", hint: "Ages 6–10" },
  { value: "easy" as const, label: "Easy", hint: "Plain words" },
  { value: "standard" as const, label: "Standard", hint: "Light edit" },
]

export function ReaderTool() {
  const [level, setLevel] = useState<ReadingLevel>("easy")
  const [original, setOriginal] = useState("")
  const [output, setOutput] = useState("")
  const [dyslexic, setDyslexic] = useState(false)
  const [fontSize, setFontSize] = useState(20)
  const [lineSpacing, setLineSpacing] = useState(1.7)
  const [speaking, setSpeaking] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [usedFallback, setUsedFallback] = useState(false)
  const [fallbackReason, setFallbackReason] = useState("")
  const [fallbackDetail, setFallbackDetail] = useState("")
  const [errorMsg, setErrorMsg] = useState("")
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    return () => {
      abortRef.current?.abort()
    }
  }, [])

  async function runSimplify(text: string) {
    if (!text.trim()) return
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setIsLoading(true)
    setOutput("")
    setErrorMsg("")
    setUsedFallback(false)
    setFallbackReason("")
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
    }

    try {
      const res = await fetch("/api/simplify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, level }),
        signal: controller.signal,
      })
      const data = await res.json()
      if (!res.ok) {
        setErrorMsg(data.error ?? "Something went wrong. Please try again.")
        return
      }
      setOutput(data.simplified ?? "")
      setUsedFallback(Boolean(data.fallback))
      setFallbackReason(data.reason ?? "")
      setFallbackDetail(data.detail ?? "")
    } catch (err) {
      if ((err as Error).name === "AbortError") return
      // Network failed — fall back to on-device simplification so the demo never breaks.
      setOutput(simplifyText(text, level))
      setUsedFallback(true)
      setFallbackReason("network")
    } finally {
      setIsLoading(false)
    }
  }

  function handleSimplify() {
    runSimplify(original)
  }

  function handleSample() {
    setOriginal(SAMPLE_TEXT)
    runSimplify(SAMPLE_TEXT)
  }

  function handleReadAloud() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return
    if (speaking) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
      return
    }
    if (!output) return
    const utterance = new SpeechSynthesisUtterance(output.replace(/•/g, ""))
    utterance.rate = level === "kids" ? 0.85 : 0.95
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
    setSpeaking(true)
  }

  const readingStyle = {
    fontSize: `${fontSize}px`,
    lineHeight: lineSpacing,
  }

  return (
    <section className="mx-auto w-full max-w-5xl px-5 pb-20">
      {/* Controls row: reading level + simplify */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-medium text-muted-foreground">Reading level</p>
          <SegmentedControl
            label="Choose a reading level"
            options={LEVEL_OPTIONS}
            value={level}
            onChange={setLevel}
          />
        </div>
        <Button
          size="lg"
          onClick={handleSimplify}
          disabled={!original.trim() || isLoading}
          className="h-12 gap-2 rounded-2xl px-6 text-base"
        >
          <Sparkles className={cn("size-5", isLoading && "animate-spin")} aria-hidden="true" />
          {isLoading ? "Simplifying…" : "Simplify text"}
        </Button>
      </div>

      {/* Split panel */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Original */}
        <Card className="rounded-2xl border-border/70 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle className="text-lg">Original</CardTitle>
            <button
              type="button"
              onClick={handleSample}
              className="rounded-md text-sm font-medium text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              Try a sample
            </button>
          </CardHeader>
          <CardContent>
            <Label htmlFor="original-text" className="sr-only">
              Paste text to simplify
            </Label>
            <Textarea
              id="original-text"
              value={original}
              onChange={(e) => setOriginal(e.target.value)}
              placeholder="Paste or type the hard text you want to make easier to read…"
              className="min-h-64 resize-y rounded-xl text-base leading-relaxed"
            />
          </CardContent>
        </Card>

        {/* Easy version */}
        <Card className="rounded-2xl border-border/70 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle className="text-lg">Easy version</CardTitle>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleReadAloud}
              disabled={!output || isLoading}
              className="gap-2 rounded-xl"
              aria-pressed={speaking}
            >
              {speaking ? (
                <Square className="size-4" aria-hidden="true" />
              ) : (
                <Volume2 className="size-4" aria-hidden="true" />
              )}
              {speaking ? "Stop" : "Read aloud"}
            </Button>
          </CardHeader>
          <CardContent>
            <div
              aria-live="polite"
              aria-busy={isLoading}
              style={isLoading ? undefined : readingStyle}
              className={cn(
                "min-h-64 rounded-xl bg-muted/40 p-4 whitespace-pre-wrap text-foreground",
                dyslexic && "font-dyslexic",
                !output && !isLoading && "flex items-center justify-center text-center",
              )}
            >
              {isLoading ? (
                <div className="space-y-4" aria-hidden="true">
                  <div className="h-4 w-[92%] animate-pulse rounded-full bg-primary/15" />
                  <div className="h-4 w-full animate-pulse rounded-full bg-primary/15 [animation-delay:150ms]" />
                  <div className="h-4 w-[78%] animate-pulse rounded-full bg-primary/15 [animation-delay:300ms]" />
                </div>
              ) : output ? (
                output
              ) : (
                <span className="text-base text-muted-foreground" style={{ lineHeight: 1.5 }}>
                  Your easy-to-read version will appear here.
                </span>
              )}
            </div>
            {usedFallback && (
              <p className="mt-3 flex items-center gap-2 rounded-lg border border-amber-300/60 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                <Info className="size-4 shrink-0" aria-hidden="true" />
                Demo mode — set LLM_API_KEY, LLM_BASE_URL and LLM_MODEL for full AI rewriting.
                {fallbackReason ? ` [${fallbackReason}]` : ""}
                {fallbackDetail ? ` — ${fallbackDetail}` : ""}
              </p>
            )}
            {errorMsg && (
              <p className="mt-3 flex items-center gap-2 rounded-lg border border-rose-300/60 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                <Info className="size-4 shrink-0" aria-hidden="true" />
                {errorMsg}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Controls bar */}
      <div className="mt-5 grid gap-6 rounded-2xl border border-border/70 bg-card p-5 shadow-sm sm:grid-cols-3 sm:items-center">
        <div className="flex items-center gap-3">
          <Checkbox
            id="dyslexia-font"
            checked={dyslexic}
            onCheckedChange={(checked) => setDyslexic(checked === true)}
          />
          <Label htmlFor="dyslexia-font" className="flex items-center gap-2 text-base">
            <Type className="size-4 text-muted-foreground" aria-hidden="true" />
            Dyslexia font
          </Label>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <Label htmlFor="font-size" className="text-sm font-medium">
              Font size
            </Label>
            <span className="text-sm text-muted-foreground">{fontSize}px</span>
          </div>
          <Slider
            id="font-size"
            aria-label="Font size"
            min={14}
            max={32}
            step={1}
            value={[fontSize]}
            onValueChange={(value) => setFontSize(Array.isArray(value) ? value[0] : value)}
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <Label htmlFor="line-spacing" className="text-sm font-medium">
              Line spacing
            </Label>
            <span className="text-sm text-muted-foreground">{lineSpacing.toFixed(1)}</span>
          </div>
          <Slider
            id="line-spacing"
            aria-label="Line spacing"
            min={1.2}
            max={2.4}
            step={0.1}
            value={[lineSpacing]}
            onValueChange={(value) => setLineSpacing(Array.isArray(value) ? value[0] : value)}
          />
        </div>
      </div>
    </section>
  )
}
