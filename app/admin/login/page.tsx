"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Shield, Mail, Lock, ArrowRight, AlertCircle } from "lucide-react"

const ADMIN_EMAIL = "admin@gmail.com"
const ADMIN_PASSWORD = "admin@gmail.com"

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    setTimeout(() => {
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        sessionStorage.setItem("admin_auth", "true")
        router.push("/admin")
      } else {
        setError("Identifiants administrateur incorrects.")
      }
      setIsLoading(false)
    }, 600)
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background px-5">
      <div className="w-full max-w-sm animate-slide-up space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
            <Shield className="w-8 h-8 text-destructive" />
          </div>
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Espace Admin
            </h1>
            <p className="text-sm text-muted-foreground">
              Acces restreint — identifiants requis
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                placeholder="Email administrateur"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-14 pl-11 pr-4 rounded-2xl bg-card border border-border text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-destructive/50 focus:border-destructive/50 transition-all"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-14 pl-11 pr-4 rounded-2xl bg-card border border-border text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-destructive/50 focus:border-destructive/50 transition-all"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-2xl border border-destructive/20 animate-scale-in">
              <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 rounded-2xl bg-destructive text-destructive-foreground text-base font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-destructive-foreground/30 border-t-destructive-foreground rounded-full animate-spin" />
            ) : (
              <>
                Acceder au panneau
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          Acces reserve aux administrateurs Jarmy
        </p>
      </div>
    </main>
  )
}
