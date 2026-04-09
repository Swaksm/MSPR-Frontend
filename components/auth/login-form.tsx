"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("http://localhost:8004/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (data.success) {
        // Stocker les infos utilisateur
        if (data.user_id && data.email) {
          localStorage.setItem("user_id", data.user_id)
          localStorage.setItem("user_email", data.email)
          if (data.nom) localStorage.setItem("user_nom", data.nom)
          if (data.prenom) localStorage.setItem("user_prenom", data.prenom)
        }
        // Redirection vers le dashboard
        router.push("/dashboard")
      } else {
        setError(data.detail || data.message || "Connexion refusée")
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
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="h-12 rounded-xl bg-card border-border/50 focus:border-primary"
        />
        <Input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="h-12 rounded-xl bg-card border-border/50 focus:border-primary"
        />
      </div>

      {error && (
        <p className="text-sm text-destructive text-center">{error}</p>
      )}

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-12 rounded-xl text-base font-medium"
      >
        {isLoading ? (
          <Spinner className="w-5 h-5" />
        ) : (
          "Se connecter"
        )}
      </Button>
    </form>
  )
}
