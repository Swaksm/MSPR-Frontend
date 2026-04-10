"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Shield,
  Users,
  Trash2,
  LogOut,
  Search,
  AlertTriangle,
  X,
  Salad,
  RefreshCw,
  UserCircle2,
  ChevronRight,
} from "lucide-react"

type User = {
  id: number | string
  name?: string
  email?: string
  username?: string
  created_at?: string
}

export default function AdminPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [filtered, setFiltered] = useState<User[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteSuccess, setDeleteSuccess] = useState("")
  const [mounted, setMounted] = useState(false)

  // Guard auth
  useEffect(() => {
    setMounted(true)
    const auth = sessionStorage.getItem("admin_auth")
    if (!auth) {
      router.replace("/admin/login")
    }
  }, [router])

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("http://localhost:8004/users")
      if (!res.ok) throw new Error("Erreur serveur")
      const data = await res.json()
      const list: User[] = Array.isArray(data)
        ? data
        : data.users ?? data.items ?? []
      setUsers(list)
      setFiltered(list)
    } catch {
      setError("Impossible de charger les utilisateurs. Verifiez que le serveur est actif.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (mounted) fetchUsers()
  }, [mounted, fetchUsers])

  // Filter on search
  useEffect(() => {
    const q = search.toLowerCase()
    if (!q) {
      setFiltered(users)
    } else {
      setFiltered(
        users.filter(
          (u) =>
            (u.name ?? "").toLowerCase().includes(q) ||
            (u.email ?? "").toLowerCase().includes(q) ||
            (u.username ?? "").toLowerCase().includes(q)
        )
      )
    }
  }, [search, users])

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`http://localhost:8004/users/${deleteTarget.id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error()
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id))
      setDeleteSuccess(
        `L'utilisateur "${deleteTarget.name ?? deleteTarget.email ?? deleteTarget.username}" a ete supprime.`
      )
      setTimeout(() => setDeleteSuccess(""), 4000)
    } catch {
      setError("Erreur lors de la suppression.")
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  function handleLogout() {
    sessionStorage.removeItem("admin_auth")
    router.replace("/admin/login")
  }

  function getUserLabel(user: User) {
    return user.name ?? user.username ?? user.email ?? `User #${user.id}`
  }

  function getUserInitial(user: User) {
    const label = getUserLabel(user)
    return label.charAt(0).toUpperCase()
  }

  function formatDate(dateStr?: string) {
    if (!dateStr) return null
    try {
      return new Date(dateStr).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    } catch {
      return null
    }
  }

  if (!mounted) return null

  return (
    <main className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-card/90 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-destructive/10 flex items-center justify-center">
            <Shield className="w-4 h-4 text-destructive" />
          </div>
          <div>
            <span className="text-base font-semibold tracking-tight text-foreground">Admin</span>
            <span className="text-xs text-muted-foreground ml-1.5">Jarmy</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchUsers}
            className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Actualiser"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive transition-colors px-3 py-2 rounded-xl hover:bg-destructive/10"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Deconnexion</span>
          </button>
        </div>
      </header>

      <section className="flex-1 px-5 py-6 animate-fade-in">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Stats banner */}
          <div className="flex items-center gap-4 p-4 bg-card rounded-2xl border border-border">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{users.length}</p>
              <p className="text-sm text-muted-foreground">
                {users.length <= 1 ? "utilisateur enregistre" : "utilisateurs enregistres"}
              </p>
            </div>
            <div className="ml-auto">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 rounded-xl">
                <Salad className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-medium text-primary">Jarmy</span>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-12 pl-11 pr-4 rounded-2xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Success toast */}
          {deleteSuccess && (
            <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-2xl border border-primary/20 animate-scale-in">
              <Shield className="w-4 h-4 text-primary shrink-0" />
              <p className="text-sm text-primary">{deleteSuccess}</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-2xl border border-destructive/20">
              <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* User list */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Utilisateurs
              </h2>
              {search && (
                <span className="text-xs text-muted-foreground">
                  {filtered.length} resultat{filtered.length > 1 ? "s" : ""}
                </span>
              )}
            </div>

            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-20 bg-card rounded-2xl border border-border animate-pulse-soft"
                  />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center">
                  <Users className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">Aucun utilisateur trouve</p>
                <p className="text-xs text-muted-foreground">
                  {search ? "Essayez un autre terme de recherche" : "La liste est vide"}
                </p>
              </div>
            ) : (
              <ul className="space-y-2">
                {filtered.map((user) => (
                  <li key={user.id}>
                    <div className="group flex items-center gap-4 p-4 bg-card rounded-2xl border border-border hover:border-primary/30 hover:shadow-sm transition-all animate-fade-in">
                      {/* Avatar */}
                      <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-base font-bold text-primary">
                          {getUserInitial(user)}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground truncate">
                          {getUserLabel(user)}
                        </p>
                        {user.email && user.name && (
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        )}
                        {formatDate(user.created_at) && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Inscrit le {formatDate(user.created_at)}
                          </p>
                        )}
                      </div>

                      {/* ID badge */}
                      <div className="hidden sm:flex items-center gap-1 shrink-0">
                        <span className="text-xs text-muted-foreground bg-accent px-2 py-1 rounded-lg">
                          #{user.id}
                        </span>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => setDeleteTarget(user)}
                        className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                        aria-label={`Supprimer ${getUserLabel(user)}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* Confirm delete modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-foreground/30 backdrop-blur-sm animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeleteTarget(null)
          }}
        >
          <div className="w-full max-w-sm bg-card rounded-3xl border border-border shadow-xl animate-slide-up p-6 space-y-5">
            {/* Icon */}
            <div className="flex items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
                <Trash2 className="w-8 h-8 text-destructive" />
              </div>
            </div>

            {/* Text */}
            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-foreground">Supprimer cet utilisateur ?</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                L&apos;utilisateur{" "}
                <span className="font-semibold text-foreground">
                  {getUserLabel(deleteTarget)}
                </span>{" "}
                sera definitivement supprime. Cette action est irreversible.
              </p>
            </div>

            {/* User card preview */}
            <div className="flex items-center gap-3 p-3 bg-accent rounded-2xl">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <UserCircle2 className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {getUserLabel(deleteTarget)}
                </p>
                {deleteTarget.email && (
                  <p className="text-xs text-muted-foreground truncate">{deleteTarget.email}</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 h-12 rounded-2xl border border-border text-sm font-semibold text-foreground hover:bg-accent transition-all disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 h-12 rounded-2xl bg-destructive text-destructive-foreground text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60"
              >
                {deleting ? (
                  <div className="w-4 h-4 border-2 border-destructive-foreground/30 border-t-destructive-foreground rounded-full animate-spin" />
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Supprimer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
