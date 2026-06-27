import { Sparkles } from "lucide-react"

export function Hero() {
  return (
    <header className="mx-auto w-full max-w-5xl px-5 pt-14 pb-10 text-center sm:pt-20">
      <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-accent px-4 py-1.5 text-sm font-semibold text-accent-foreground">
        <Sparkles className="size-4" aria-hidden="true" />
        AI reading assistant
      </span>
      <h1 className="mx-auto mt-6 max-w-3xl text-balance text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
        Read anything, your way
      </h1>
      <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
        EaseRead turns hard text into plain, friendly language—built for readers with dyslexia,
        ADHD, and everyone who wants things simpler.
      </p>

      <dl className="mx-auto mt-8 flex max-w-2xl flex-col items-center gap-5 text-sm sm:flex-row sm:justify-center sm:gap-12">
        {[
          { stat: "1 in 5", label: "people have a language-based learning difference like dyslexia" },
          { stat: "1 click", label: "turns dense text into plain language" },
          { stat: "100% free", label: "accessible to everyone" },
        ].map((item) => (
          <div key={item.stat} className="max-w-56 text-center sm:text-left">
            <dt className="text-base font-bold text-primary">{item.stat}</dt>
            <dd className="mt-1 leading-relaxed text-muted-foreground text-pretty">{item.label}</dd>
          </div>
        ))}
      </dl>
    </header>
  )
}
