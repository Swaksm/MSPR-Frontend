"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"

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
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="h-12 rounded-xl bg-background border-border focus:ring-2 focus:ring-ring"
        />
        <Input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="h-12 rounded-xl bg-background border-border focus:ring-2 focus:ring-ring"
        />
      </div>

      {error && (
        <p className="text-sm text-destructive text-center">{error}</p>
      )}
      {success && (
        <p className="text-sm text-foreground text-center font-medium">{success}</p>
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
