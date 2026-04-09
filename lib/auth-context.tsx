"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  email: string
  nom?: string
  prenom?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is already logged in
    const storedUserId = localStorage.getItem("user_id")
    const storedEmail = localStorage.getItem("user_email")
    const storedNom = localStorage.getItem("user_nom")
    const storedPrenom = localStorage.getItem("user_prenom")
    
    if (storedUserId && storedEmail) {
      setUser({
        id: storedUserId,
        email: storedEmail,
        nom: storedNom || undefined,
        prenom: storedPrenom || undefined,
      })
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
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
        const newUser: User = {
          id: data.user_id,
          email: data.email,
          nom: data.nom,
          prenom: data.prenom,
        }
        setUser(newUser)
        localStorage.setItem("user_id", data.user_id)
        localStorage.setItem("user_email", data.email)
        if (data.nom) localStorage.setItem("user_nom", data.nom)
        if (data.prenom) localStorage.setItem("user_prenom", data.prenom)
        
        return { success: true, message: data.message }
      } else {
        return { success: false, message: data.detail || data.message || "Connexion refusée" }
      }
    } catch {
      return { success: false, message: "Erreur de connexion au serveur" }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user_id")
    localStorage.removeItem("user_email")
    localStorage.removeItem("user_nom")
    localStorage.removeItem("user_prenom")
    router.push("/login")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
