import Link from 'next/link'

export function LandingFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-6xl px-4 py-8 flex flex-col items-center justify-between gap-3 sm:flex-row">
        <div className="text-sm text-muted-foreground">© {new Date().getFullYear()} Fitness Adventure</div>
        <nav className="flex gap-4 text-sm text-muted-foreground">
          <Link href="/onboarding">Start</Link>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/quests">Quests</Link>
        </nav>
      </div>
    </footer>
  )
}


