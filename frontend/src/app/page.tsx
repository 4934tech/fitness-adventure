import { LandingHero } from '@/components/landing/hero'
import { LandingFeatures } from '@/components/landing/features'
import { LandingCta } from '@/components/landing/cta'
import { LandingFooter } from '@/components/landing/footer'
import { AppNav } from '@/components/app/nav'
import Link from 'next/link'

export default function Home() {
  return (
    <div>
      <header className="sticky top-0 z-50 fa-glass border-b border-border/50 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold fa-gradient-text">
            Fitness Adventure
          </Link>
          <AppNav />
        </div>
      </header>
      <LandingHero />
      <LandingCta />
      <LandingFooter />
    </div>
  )
}


