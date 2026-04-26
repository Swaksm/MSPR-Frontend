"use client"

import { useState } from "react"
import Link from "next/link"
import { Salad, ArrowLeft } from "lucide-react"
import { LoginForm } from "@/components/auth/login-form"
import { RegisterForm } from "@/components/auth/register-form"

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <main className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4 bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Retour</span>
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
            <Salad className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-foreground">Jarmy</span>
        </div>
        <div className="w-16" />
      </header>

      {/* Content */}
      <section className="flex-1 flex flex-col items-center justify-center px-5 py-8 animate-fade-in">
        <div className="w-full max-w-sm space-y-8">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center">
              <Salad className="w-8 h-8 text-primary" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {isLogin ? "Bon retour !" : "Rejoignez Jarmy"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {isLogin
                ? "Connectez-vous pour continuer votre suivi"
                : "Creez votre compte pour commencer"}
            </p>
          </div>

          {/* Tabs */}
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
              Connexion
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
              Inscription
            </button>
          </div>

          {/* Form */}
          <div className="animate-scale-in">
            {isLogin ? (
              <LoginForm />
            ) : (
              <RegisterForm onSuccess={() => setIsLogin(true)} />
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-5 py-4 relative">
        <p className="text-center text-xs text-muted-foreground">
          En continuant, vous acceptez nos conditions d&apos;utilisation
        </p>
        <Link 
          href="/admin" 
          className="absolute bottom-4 right-5 text-[10px] text-muted-foreground/20 hover:text-muted-foreground transition-colors"
        >
          Admin
        </Link>
      </footer>
    </main>
  )
}
