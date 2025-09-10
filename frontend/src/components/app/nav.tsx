'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth'

const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/workouts', label: 'Workouts' },
  { href: '/quests', label: 'Quests' },
  { href: '/progress', label: 'Progress' },
]

export function AppNav() {
  const pathname = usePathname()
  const { isAuthed, user, clearAuth } = useAuth()

  return (
    <nav className="flex items-center gap-6">
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={cn(
            'text-sm font-medium transition-colors hover:text-primary',
            pathname === l.href
              ? 'text-primary'
              : 'text-muted-foreground'
          )}
        >
          {l.label}
        </Link>
      ))}

      {!isAuthed ? (
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Login
          </Link>
          <Link href="/signup">
            <Button size="sm" className="h-8 px-4">
              Sign up
            </Button>
          </Link>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {user?.name || 'Account'}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              clearAuth()
              window.location.href = '/login'
            }}
          >
            Logout
          </Button>
        </div>
      )}
    </nav>
  )
}
