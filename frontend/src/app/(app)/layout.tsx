import { AppNav } from '@/components/app/nav'
import Link from 'next/link'

export default function AppSectionLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-50 fa-glass border-b border-border/50 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold fa-gradient-text">
            Fitness Adventure
          </Link>
          <AppNav />
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-6">{children}</div>
    </div>
  )
}


