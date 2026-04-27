"use client"

import { useState } from "react"
import { LoginForm } from "@/components/auth/login-form"
import { RegisterForm } from "@/components/auth/register-form"
import { useTranslation } from "@/lib/i18n-context"

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const { t, lang, setLang } = useTranslation()

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <header className="flex items-center justify-between px-5 py-4 bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="w-16" />
        <img src="/JARMY-logo.svg" alt="Jarmy" className="h-8" />
        <button
          onClick={() => setLang(lang === "en" ? "fr" : "en")}
          className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors bg-secondary px-3 py-1.5 rounded-full"
        >
          {lang === "en" ? "FR" : "EN"}
        </button>
      </header>

      <section className="flex-1 flex flex-col items-center justify-center px-5 py-8 animate-fade-in">
        <div className="w-full max-w-sm space-y-8">
          <div className="flex justify-center">
            <img src="/JARMY-logo-02.svg" alt="Jarmy" className="h-16" />
          </div>

          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {isLogin ? t("login_welcome") : t("register_title")}
            </h1>
            <p className="text-muted-foreground text-sm">
              {isLogin ? t("login_subtitle") : t("register_subtitle")}
            </p>
          </div>

          <div className="flex gap-1 p-1 bg-secondary rounded-xl">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                isLogin
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("signin")}
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                !isLogin
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("signup")}
            </button>
          </div>

          <div className="animate-scale-in">
            {isLogin ? (
              <LoginForm />
            ) : (
              <RegisterForm onSuccess={() => setIsLogin(true)} />
            )}
          </div>
        </div>
      </section>

      <footer className="flex flex-col px-5 py-4">
        <p className="text-xs text-muted-foreground text-center mb-3">
          {lang === "en"
            ? "By continuing, you accept our terms of use"
            : "En continuant, vous acceptez nos conditions d'utilisation"}
        </p>
        <div className="flex justify-end">
          <button
            onClick={() => window.location.href = "/admin"}
            className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors bg-secondary px-3 py-1.5 rounded-full"
          >
            Admin
          </button>
        </div>
      </footer>
    </main>
  )
}
