"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, Lock, ArrowRight, Check } from "lucide-react"
import { useTranslation } from "@/lib/i18n-context"
import { apiFetch } from "@/lib/api"
import { GoogleLogin } from "@react-oauth/google"

export function LoginForm() {
  const router = useRouter();
  const { t } = useTranslation();
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setIsLoading(true);
    setError("");
    try {
      const response = await apiFetch("http://localhost:8000/auth/google-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });
      const data = await response.json();
      if (data.success) {
        localStorage.setItem("user_id", String(data.user_id));
        localStorage.setItem("user_email", data.email);
        localStorage.setItem("user_name", data.prenom && data.nom ? `${data.prenom} ${data.nom}` : data.email);
        localStorage.setItem("user_abonnement", data.abonnement || "freemium");
        
        setSuccess("Connexion Google réussie !");
        setTimeout(() => {
            router.push("/dashboard");
        }, 1000);
      } else {
        setError(data.detail || "Erreur Google Login");
      }
    } catch {
      setError("Erreur serveur lors du login Google");
    } finally {
      setIsLoading(false);
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await apiFetch("http://localhost:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (data.success && data.user_id) {
        localStorage.setItem("user_id", String(data.user_id))
        localStorage.setItem("user_email", data.email ?? email)
        localStorage.setItem("user_name", data.prenom && data.nom ? `${data.prenom} ${data.nom}` : data.email ?? email)
        localStorage.setItem("user_abonnement", data.abonnement ?? "freemium")
        setSuccess(data.message)
        const destination = sessionStorage.getItem("pending_onboarding") === "true" ? "/onboarding" : "/dashboard"
        setTimeout(() => {
          router.push(destination)
        }, 800)
      } else {
        setError(data.detail || data.message || t("error_signin"))
      }
    } catch {
      setError(t("error_server"))
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
            {t("signin_submitting")}
          </>
        ) : (
          <>
            {t("signin_submit")}
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </Button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">OU</span>
        </div>
      </div>

      <div className="flex justify-center w-full overflow-hidden">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => setError("Google Login Failed")}
          theme="filled_blue"
          shape="pill"
          size="large"
          text="signin_with"
          width="360"
        />
      </div>
    </form>
  )
}
