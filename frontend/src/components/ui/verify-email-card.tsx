'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { resendVerification, verifyEmail } from '@/lib/api'

export default function VerifyEmailCard({ email }: { email: string }) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [info, setInfo] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [verified, setVerified] = useState(false)

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setInfo(null)
    try {
      setLoading(true)
      const res = await verifyEmail(email, code)
      if (res.status === 'verified') {
        setVerified(true)
        setInfo('Email verified. You can sign in now.')
      } else {
        setInfo('Already verified.')
      }
    } catch (err: any) {
      setError(err.message || 'Invalid code')
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    setError(null)
    setInfo(null)
    try {
      setLoading(true)
      await resendVerification(email)
      setInfo('Verification code sent')
    } catch (err: any) {
      setError(err.message || 'Could not resend yet')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded border p-4">
      <h2 className="font-medium">Verify your email</h2>
      <p className="text-sm text-muted-foreground">We sent a code to <span className="font-medium">{email}</span>.</p>

      {!!error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {!!info && <p className="mt-2 text-sm text-green-600">{info}</p>}

      {!verified && (
        <form onSubmit={handleVerify} className="mt-3 space-y-3">
          <div>
            <label className="text-sm">Code</label>
            <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter your code" required />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'Verifying…' : 'Verify'}
            </Button>
            <Button type="button" variant="secondary" onClick={handleResend} disabled={loading}>
              Resend code
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
