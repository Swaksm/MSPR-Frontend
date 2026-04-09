"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, Lock, ArrowRight, Check } from "lucide-react"

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("http://localhost:8004/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (data.success && data.user_id) {
        localStorage.setItem("user_id", String(data.user_id))
        localStorage.setItem("user_email", data.email ?? email)
        localStorage.setItem("user_name", data.user_name ?? data.email ?? email)
        setSuccess(data.message)
        setTimeout(() => {
          router.push("/dashboard")
        }, 800)
      } else {
        setError(data.detail || data.message || "Connexion refusee")
      }
    } catch {
      setError("Erreur de connexion au serveur")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-3">
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-14 pl-11 rounded-xl bg-card border-border text-base focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="h-14 pl-11 rounded-xl bg-card border-border text-base focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      {error && (
        <div className="p-3 bg-destructive/10 rounded-xl">
          <p className="text-sm text-destructive text-center">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="p-3 bg-primary/10 rounded-xl flex items-center justify-center gap-2">
          <Check className="w-4 h-4 text-primary" />
          <p className="text-sm text-primary font-medium">{success}</p>
        </div>
      )}

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-14 rounded-xl text-base font-semibold gap-2"
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            Connexion...
          </>
        ) : (
          <>
            Se connecter
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </Button>
    </form>
  )
}
