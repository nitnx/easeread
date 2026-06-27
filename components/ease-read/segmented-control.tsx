"use client"

import { useRef } from "react"
import { cn } from "@/lib/utils"

export type SegmentedOption<T extends string> = {
  value: T
  label: string
  hint?: string
}

type SegmentedControlProps<T extends string> = {
  options: SegmentedOption<T>[]
  value: T
  onChange: (value: T) => void
  label: string
  className?: string
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
}: SegmentedControlProps<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  function handleKeyDown(event: React.KeyboardEvent, index: number) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return
    event.preventDefault()
    const dir = event.key === "ArrowRight" ? 1 : -1
    const next = (index + dir + options.length) % options.length
    onChange(options[next].value)
    refs.current[next]?.focus()
  }

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        "inline-flex w-full items-center gap-1 rounded-2xl border border-border bg-muted/60 p-1.5 sm:w-auto",
        className,
      )}
    >
      {options.map((option, index) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            ref={(el) => {
              refs.current[index] = el
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={cn(
              "flex flex-1 flex-col items-center justify-center rounded-xl px-4 py-2 text-base font-semibold transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:flex-none",
              selected
                ? "bg-card text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <span>{option.label}</span>
            {option.hint ? (
              <span className="text-xs font-normal text-muted-foreground">{option.hint}</span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
