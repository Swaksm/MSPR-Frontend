"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { User, Mail, Lock, Check, ArrowRight } from "lucide-react"
import { useTranslation } from "@/lib/i18n-context"
import { apiFetch } from "@/lib/api"

interface RegisterFormProps {
  onSuccess?: () => void
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const { t } = useTranslation();
  const [nom, setNom] = useState("")
  const [prenom, setPrenom] = useState("")
  const [sexe, setSexe] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!nom || !prenom || !sexe) {
      setError(t("error_fill_all"))
      return
    }
    if (password !== confirmPassword) {
      setError(t("error_passwords_mismatch"))
      return
    }
    if (password.length < 6) {
      setError(t("error_password_short"))
      return
    }
    setIsLoading(true)
    try {
      const response = await apiFetch("http://localhost:8000/meal/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom, prenom, email, password, sexe }),
      })
      const data = await response.json()
      if (response.ok) {
        setSuccess(t("signup_success"))
        sessionStorage.setItem("pending_onboarding", "true")
        setTimeout(() => {
          onSuccess?.()
        }, 2000)
      } else {
        setError(data.detail || t("error_signup"))
      }
    } catch {
      setError(t("error_server"))
    } finally {
      setIsLoading(false)
    }
  }

  const sexeOptions = [
    { value: "femme", label: t("gender_female") },
    { value: "homme", label: t("gender_male") },
    { value: "autre", label: t("gender_other") },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t("field_lastname")}
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              required
              className="h-14 pl-11 rounded-xl bg-card border-border text-base focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <Input
            type="text"
            placeholder={t("field_firstname")}
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
            required
            className="h-14 px-4 rounded-xl bg-card border-border text-base focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div className="flex gap-2 p-1 bg-secondary rounded-xl">
          {sexeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setSexe(option.value)}
              className={`flex-1 py-3 text-sm font-medium rounded-lg transition-all ${
                sexe === option.value
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="email"
            placeholder={t("field_email")}
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
            placeholder={t("field_password")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="h-14 pl-11 rounded-xl bg-card border-border text-base focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="password"
            placeholder={t("field_confirm_password")}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
            {t("signup_submitting")}
          </>
        ) : (
          <>
            {t("signup_submit")}
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </Button>
    </form>
  )
}
