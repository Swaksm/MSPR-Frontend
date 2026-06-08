"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, LogOut, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";

const API = process.env.NEXT_PUBLIC_JARMY_API_URL || "http://localhost:8000";

export default function SettingsPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<number>(0);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const uid = localStorage.getItem("user_id");
    const name = localStorage.getItem("user_name") || "";
    if (!uid) { router.replace("/login"); return; }
    const id = parseInt(uid);
    setUserId(id);
    setDisplayName(name);

    apiFetch(`${API}/social/users/${id}/profile`)
      .then(r => r.json())
      .then(data => {
        if (data.display_name) setDisplayName(data.display_name);
        if (data.bio) setBio(data.bio);
        if (data.avatar_url) setAvatarUrl(data.avatar_url);
      });
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await apiFetch(`${API}/social/users/${userId}/profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        display_name: displayName || null,
        bio: bio || null,
        avatar_url: avatarUrl || null,
      }),
    });
    localStorage.setItem("user_name", displayName);
    setSaved(true);
    setLoading(false);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = () => {
    ["user_id", "user_email", "user_name", "user_abonnement", "lang", "pending_onboarding"]
      .forEach(k => localStorage.removeItem(k));
    router.replace("/login");
  };

  return (
    <div className="max-w-md mx-auto px-5 pt-6 pb-6 space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-accent transition-colors">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground">Paramètres</h1>
      </div>

      <div className="flex flex-col items-center gap-3 py-4">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
          {avatarUrl ? (
            <img src={avatarUrl} alt="avatar" className="w-full h-full rounded-2xl object-cover" />
          ) : (
            <User className="w-8 h-8 text-primary" />
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {localStorage.getItem("user_email") || ""}
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Nom affiché
          </label>
          <input
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            placeholder="Ton prénom ou pseudo"
            className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 transition-colors"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Bio
          </label>
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            placeholder="Parle de toi en quelques mots…"
            rows={3}
            maxLength={160}
            className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 transition-colors resize-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            URL photo de profil
          </label>
          <input
            value={avatarUrl}
            onChange={e => setAvatarUrl(e.target.value)}
            placeholder="https://…"
            className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 transition-colors"
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-xl font-semibold gap-2"
        >
          {saved ? <><Check className="w-4 h-4" /> Sauvegardé</> : loading ? "Sauvegarde…" : "Sauvegarder"}
        </Button>
      </form>

      <div className="pt-4">
        <Button
          variant="outline"
          onClick={handleLogout}
          className="w-full h-12 rounded-xl gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
        >
          <LogOut className="w-4 h-4" />
          Se déconnecter
        </Button>
      </div>
    </div>
  );
}
