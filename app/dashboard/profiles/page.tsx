"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { User as UserIcon, Shield, Sparkles, LogOut, Trash2, ChevronRight, Watch, AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n-context";
import { apiFetch } from "@/lib/api";

export default function ProfilePage() {
  const router = useRouter();
  const { t, lang, setLang } = useTranslation();
  const [user, setUser] = useState({ name: "User", email: "", abonnement: "freemium" });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    setUser({
      name: localStorage.getItem("user_name") || "User",
      email: localStorage.getItem("user_email") || "",
      abonnement: localStorage.getItem("user_abonnement") || "freemium",
    });
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  const handleDeleteAccount = async () => {
    const userId = localStorage.getItem("user_id");
    if (!userId) return;
    setDeleting(true);
    setDeleteError("");
    try {
      const res = await apiFetch(`${process.env.NEXT_PUBLIC_JARMY_API_URL || "http://localhost:8000"}/meal/users/${userId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      localStorage.clear();
      router.push("/login");
    } catch {
      setDeleteError(t("profile_delete_error"));
      setDeleting(false);
    }
  };

  const PLAN_LABELS: Record<string, string> = {
    freemium: lang === "fr" ? "Plan Basique (Gratuit)" : "Basic Plan (Free)",
    premium: "Premium",
    premium_plus: "Premium+",
  };

  return (
    <main className="min-h-screen bg-background animate-fade-in pb-20">
      <header className="px-5 py-5 bg-background sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("profile_title")}</h1>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
            <UserIcon className="w-5 h-5 text-primary" />
          </div>
        </div>
      </header>

      <div className="p-5 space-y-6 max-w-md mx-auto w-full">
        {/* Info Utilisateur */}
        <div className="flex items-center gap-4 p-5 bg-card border border-border rounded-3xl">
          <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center text-primary">
            <UserIcon className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{user.name}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        {/* Language switcher */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-2">{t("lang_label")}</h3>
          <div className="flex gap-2 p-1 bg-secondary rounded-2xl">
            <button
              onClick={() => setLang("en")}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${
                lang === "en" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              🇬🇧 {t("lang_en")}
            </button>
            <button
              onClick={() => setLang("fr")}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${
                lang === "fr" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              🇫🇷 {t("lang_fr")}
            </button>
          </div>
        </div>

        {/* Abonnement */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-2">{t("profile_subscription")}</h3>
          <div className={`p-6 border-2 rounded-3xl relative overflow-hidden ${
            user.abonnement === "freemium" ? "bg-card border-border" : "bg-primary/5 border-primary shadow-lg shadow-primary/10"
          }`}>
            <div className="relative z-10 flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {user.abonnement === "premium_plus" ? (
                    <Watch className="w-5 h-5 text-primary" />
                  ) : (
                    <Shield className="w-5 h-5 text-primary" />
                  )}
                  <p className="font-bold text-lg">
                    {user.abonnement === "freemium" ? t("profile_basic") : PLAN_LABELS[user.abonnement] ?? user.abonnement}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {user.abonnement === "freemium" ? t("profile_limited") : t("profile_premium_desc")}
                </p>
              </div>
              {user.abonnement !== "freemium" && (
                <div className="px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full">{t("profile_active")}</div>
              )}
            </div>

            {user.abonnement === "freemium" && (
              <Link href="/dashboard/subscribe" className="block mt-6 relative z-10">
                <Button className="w-full h-12 rounded-xl font-bold gap-2 bg-gradient-to-r from-primary to-emerald-400">
                  <Sparkles className="w-4 h-4" /> {t("profile_go_premium")}
                </Button>
              </Link>
            )}
            {user.abonnement === "premium" && (
              <Link href="/dashboard/subscribe" className="block mt-6 relative z-10">
                <Button variant="outline" className="w-full h-12 rounded-xl font-bold gap-2 border-primary text-primary hover:bg-primary/10">
                  <Watch className="w-4 h-4" /> {t("profile_unlock_plus")}
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Menu */}
        <div className="space-y-2 bg-card border border-border rounded-3xl p-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-4 hover:bg-accent rounded-2xl transition-colors"
          >
            <div className="flex items-center gap-3">
              <LogOut className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium">{t("profile_signout")}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full flex items-center justify-between p-4 hover:bg-destructive/10 text-destructive rounded-2xl transition-colors"
          >
            <div className="flex items-center gap-3">
              <Trash2 className="w-5 h-5" />
              <span className="font-medium">{t("profile_delete")}</span>
            </div>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-card rounded-3xl border border-border shadow-xl animate-slide-up overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-destructive/10">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                </div>
                <h2 className="font-bold text-lg">{t("profile_delete_title")}</h2>
              </div>
              <button onClick={() => { setShowDeleteConfirm(false); setDeleteError(""); }} className="p-2 rounded-xl hover:bg-accent transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-5">
              <p className="text-sm text-muted-foreground leading-relaxed">{t("profile_delete_desc")}</p>
              {deleteError && <p className="text-sm text-destructive text-center">{deleteError}</p>}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 h-12 rounded-xl"
                  onClick={() => { setShowDeleteConfirm(false); setDeleteError(""); }}
                  disabled={deleting}
                >
                  {t("cancel")}
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1 h-12 rounded-xl"
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                >
                  {deleting ? t("profile_deleting") : t("confirm")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
