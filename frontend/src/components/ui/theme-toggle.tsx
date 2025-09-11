'use client'

import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <Button variant="outline" size="sm">Theme</Button>
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="transition-all duration-200 hover:scale-105"
    >
      {theme === 'dark' ? '🌞' : '🌙'}
      <span className="ml-2 hidden sm:inline">
        {theme === 'dark' ? 'Light' : 'Dark'}
      </span>
    </Button>
  )
}
