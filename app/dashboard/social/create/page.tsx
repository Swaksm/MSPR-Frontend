"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const API = process.env.NEXT_PUBLIC_JARMY_API_URL || "http://localhost:8000";

export default function CreatePostPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<number>(0);
  const [userName, setUserName] = useState<string>("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const uid = localStorage.getItem("user_id");
    const name = localStorage.getItem("user_name") || "Utilisateur";
    if (!uid) { router.replace("/login"); return; }
    setUserId(parseInt(uid));
    setUserName(name);
  }, [router]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !file) {
      setError("Ajoute du texte ou une photo.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("user_id", String(userId));
      formData.append("user_name", userName);
      formData.append("content", content);
      if (file) formData.append("file", file);

      const res = await fetch(`${API}/social/posts/with-media`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Erreur lors de la publication.");
      }

      router.replace("/dashboard/social");
    } catch (e: any) {
      setError(e.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-5 pt-6 pb-6 space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-accent transition-colors">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground">Nouvelle publication</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-primary font-bold text-sm">
                {userName?.charAt(0)?.toUpperCase() || "?"}
              </span>
            </div>
            <span className="font-semibold text-sm text-foreground">{userName}</span>
          </div>

          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Quoi de neuf ? Partage ton repas, ta séance, tes progrès…"
            rows={4}
            maxLength={500}
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground resize-none outline-none"
          />

          {preview && (
            <div className="relative rounded-xl overflow-hidden">
              {file?.type.startsWith("video") ? (
                <video src={preview} className="w-full max-h-60 object-cover" />
              ) : (
                <img src={preview} alt="preview" className="w-full max-h-60 object-cover" />
              )}
              <button
                type="button"
                onClick={removeFile}
                className="absolute top-2 right-2 bg-black/60 rounded-full p-1 text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFile}
          className="hidden"
        />

        {!preview && (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-border text-muted-foreground hover:border-primary/50 hover:text-primary transition-all text-sm"
          >
            <ImagePlus className="w-4 h-4" />
            Ajouter une photo ou vidéo
          </button>
        )}

        {error && (
          <p className="text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-xl">{error}</p>
        )}

        <Button
          type="submit"
          disabled={loading || (!content.trim() && !file)}
          className="w-full h-12 rounded-xl font-semibold"
        >
          {loading ? "Publication…" : "Publier"}
        </Button>
      </form>
    </div>
  );
}
