"use client"

import { useState } from "react"
import Link from "next/link"
import { LoginForm } from "@/components/auth/login-form"
import { RegisterForm } from "@/components/auth/register-form"

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <main className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center px-6 py-4 border-b border-border">
        <Link href="/" className="text-lg font-semibold tracking-tight text-foreground">
          Jarmy
        </Link>
      </header>

      {/* Content */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div className="w-full max-w-sm space-y-8">
          {/* Title */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {isLogin ? "Connexion" : "Creer un compte"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {isLogin
                ? "Connectez-vous pour acceder a votre espace"
                : "Rejoignez Jarmy pour suivre votre nutrition"}
            </p>
          </div>

          {/* Form */}
          {isLogin ? (
            <LoginForm />
          ) : (
            <RegisterForm onSuccess={() => setIsLogin(true)} />
          )}

          {/* Toggle */}
          <div className="text-center pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground"
            >
              {isLogin ? (
                <>
                  Pas encore de compte ?{" "}
                  <span className="text-foreground font-medium underline underline-offset-4">
                    S&apos;inscrire
                  </span>
                </>
              ) : (
                <>
                  Deja un compte ?{" "}
                  <span className="text-foreground font-medium underline underline-offset-4">
                    Se connecter
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}
