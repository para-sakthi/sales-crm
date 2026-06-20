import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { login, getMe } from '@/api/auth'
import { useAuthStore } from '../store'
import { DEMO_TOKEN, DEMO_PROFILE } from '../demo'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const setTokens = useAuthStore((s) => s.setTokens)
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const tokens = await login({ email, password })
      const profile = await getMe(tokens.accessToken)
      setTokens(tokens.accessToken, tokens.refreshToken, profile.role)
      navigate('/dashboard')
    } catch {
      setError('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  function handleDemo() {
    setTokens(DEMO_TOKEN, DEMO_TOKEN, DEMO_PROFILE.role)
    navigate('/dashboard')
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-ink p-12 text-white lg:flex">
        <div className="flex items-center gap-2.5">
          <div className="grid size-9 place-items-center rounded-md bg-white font-serif text-xl font-semibold text-ink">
            K
          </div>
          <div className="font-serif text-lg font-semibold tracking-tight">Kryon</div>
        </div>

        <div>
          <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.18em] text-white/50">
            Quote Decision Intelligence
          </div>
          <h1 className="max-w-md font-serif text-[2.75rem] font-semibold leading-[1.05] tracking-[-0.02em]">
            The commercial brain for BLDC motor sales.
          </h1>
          <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-white/60">
            Lead to PO in one system — pipeline, BOM-driven pricing, GST-ready PFIs, and
            PO reconciliation, built for OEM component sales.
          </p>
        </div>

        <div className="flex gap-6 font-mono text-[11px] uppercase tracking-[0.1em] text-white/40">
          <span>Pipeline</span>
          <span>Pricing</span>
          <span>PFI · PO</span>
          <span>Intelligence</span>
        </div>

        <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -bottom-32 -right-10 size-80 rounded-full border border-white/10" />
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="grid size-9 place-items-center rounded-md bg-ink font-serif text-xl font-semibold text-white">K</div>
            <div className="font-serif text-lg font-semibold tracking-tight">Kryon CRM</div>
          </div>

          <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            Welcome back
          </div>
          <h2 className="mb-7 font-serif text-3xl font-semibold tracking-[-0.02em]">Sign in</h2>

          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-1.5">
              <label htmlFor="email" className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                Email
              </label>
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-10" />
            </div>
            <div className="grid gap-1.5">
              <label htmlFor="password" className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                Password
              </label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-10" />
            </div>
            {error && <p className="font-mono text-[12px] text-block">{error}</p>}
            <Button type="submit" disabled={loading} size="lg" className="mt-1 h-10 w-full">
              {loading ? 'Signing in…' : 'Sign in'}
              {!loading && <ArrowRight className="size-4" />}
            </Button>
          </form>

          <div className="mt-6 border-t border-border pt-6">
            <Button type="button" variant="outline" className="h-10 w-full" onClick={handleDemo}>
              Enter demo mode
            </Button>
            <p className="mt-2.5 text-center font-mono text-[11px] text-muted-foreground">
              Explore the full UI on sample data — no backend needed
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
