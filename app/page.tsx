import { Hero } from "@/components/ease-read/hero"
import { ReaderTool } from "@/components/ease-read/reader-tool"

export default function Page() {
  return (
    <main className="min-h-dvh bg-background">
      <Hero />
      <ReaderTool />
      <footer className="border-t border-border/60 py-8">
        <p className="text-center text-sm text-muted-foreground">Built for Youth Code x AI</p>
      </footer>
    </main>
  )
}
