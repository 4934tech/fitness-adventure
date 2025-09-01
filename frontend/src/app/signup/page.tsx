'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function SignUpPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirmPassword) {
      console.log('Passwords do not match')
      return
    }
    setLoading(true)
    // TODO: Add your registration logic here
    setTimeout(() => {
      setLoading(false)
      console.log('Registration attempt with:', { name, email, password })
    }, 1000)
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-semibold">Create account</h1>
      <p className="text-sm text-muted-foreground">Get started on your fitness adventure.</p>
      <form onSubmit={onSubmit} className="mt-6 space-y-3">
        <div>
          <label className="text-sm">Full name</label>
          <Input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
            placeholder="Enter your full name"
          />
        </div>
        <div>
          <label className="text-sm">Email</label>
          <Input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            placeholder="Enter your email"
          />
        </div>
        <div>
          <label className="text-sm">Password</label>
          <Input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            placeholder="Create a password"
          />
        </div>
        <div>
          <label className="text-sm">Confirm password</label>
          <Input 
            type="password" 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
            required 
            placeholder="Confirm your password"
          />
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/signin" className="text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
