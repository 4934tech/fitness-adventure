'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { loginDirect } from '@/lib/api'
import { PasswordInput } from '@/components/ui/password-input'
import { useAuth } from '@/lib/auth'
import { useSearchParams } from 'next/navigation'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { setAuth } = useAuth()
  const searchParams = useSearchParams()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    try {
      setLoading(true)
      const res = await loginDirect(email, password)

      setAuth({
        token: res.token,
        user: { id: res.id, name: res.name, email: res.email },
      })

      const next = searchParams.get('next') || '/dashboard'
      window.location.href = next
    } catch (e) {
      if(e instanceof Error){
        setError(e.message || 'Invalid credentials')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <p className="text-sm text-muted-foreground">Enter your credentials to sign in.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-3">
        {!!error && <p className="text-sm text-red-600">{error}</p>}

        <div>
          <label className="text-sm">Email</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="text-sm">Password</label>
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Do not have an account?{' '}
        <Link href="/signup" className="text-primary hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  )
}
