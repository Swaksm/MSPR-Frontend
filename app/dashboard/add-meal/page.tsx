"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Salad,
  ArrowLeft,
  Sparkles,
  Check,
  Plus,
  X,
  Utensils,
  Lock,
  Camera,
  Upload,
  ImageIcon,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n-context";
import { apiFetch } from "@/lib/api";

function AddAnalyzedMealForm({
  analyzedItems,
  onClose,
}: {
  analyzedItems: { food: string; grams: number; kcal: number }[];
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [typeRepas, setTypeRepas] = useState("petit_dejeuner");
  const today = new Date().toISOString().slice(0, 10);
  const [dateRepas, setDateRepas] = useState(today);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  async function handleAdd() {
    setError("");
    setSuccess("");
    if (!dateRepas) { setError(t("add_meal_register_date_error")); return; }
    setLoading(true);
    try {
      const userId = localStorage.getItem("user_id") || "1";
      const items = analyzedItems.map((item) => ({
        aliment_nom: item.food,
        quantite_g: item.grams,
        calories_100g: item.kcal && item.grams ? Math.round((item.kcal / item.grams) * 100) : 0,
      }));
      const res = await apiFetch(`http://localhost:8003/users/${userId}/meals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type_repas: typeRepas, date_repas: dateRepas, notes, items }),
      });
      if (!res.ok) throw new Error();
      setSuccess(t("add_meal_register_success"));
      setTimeout(() => { setSuccess(""); onClose(); }, 1200);
    } catch {
      setError(t("add_meal_register_error"));
    } finally {
      setLoading(false);
    }
  }

  const mealTypes = [
    { value: "petit_dejeuner", label: t("meal_type_breakfast") },
    { value: "dejeuner", label: t("meal_type_lunch") },
    { value: "diner", label: t("meal_type_dinner") },
    { value: "collation", label: t("meal_type_snack") },
  ];

  return (
    <div className="mt-6 space-y-4 p-4 bg-card rounded-2xl border border-border animate-scale-in">
      <h3 className="font-semibold text-foreground flex items-center gap-2">
        <Plus className="w-4 h-4 text-primary" />
        {t("add_meal_register")}
      </h3>

      <div className="flex flex-wrap gap-2">
        {mealTypes.map((type) => (
          <button
            key={type.value}
            type="button"
            onClick={() => setTypeRepas(type.value)}
            className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all ${
              typeRepas === type.value
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-accent"
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      <input
        type="date"
        value={dateRepas}
        onChange={(e) => setDateRepas(e.target.value)}
        className="w-full h-12 px-4 bg-input border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />

      <textarea
        placeholder={t("notes_placeholder")}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="w-full h-20 p-4 bg-input border border-border rounded-xl text-sm resize-none placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />

      <div className="flex gap-3">
        <Button
          type="button"
          className="flex-1 h-12 rounded-xl gap-2"
          disabled={loading}
          onClick={handleAdd}
        >
          {loading ? t("add_meal_register_saving") : <><Check className="w-4 h-4" /> {t("add_meal_register_validate")}</>}
        </Button>
        <Button type="button" className="h-12 px-4 rounded-xl" variant="secondary" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {error && <p className="text-destructive text-sm text-center">{error}</p>}
      {success && (
        <div className="flex items-center justify-center gap-2 text-primary text-sm font-medium">
          <Check className="w-4 h-4" />
          {success}
        </div>
      )}
    </div>
  );
}

function AddMealResult({
  result,
}: {
  result: {
    total_kcal: number;
    message: string;
    items: { food: string; grams: number; kcal: number }[];
  };
}) {
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="mt-6 space-y-4 animate-slide-up">
      <div className="p-5 bg-card rounded-2xl border border-border space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <p className="font-medium text-foreground">
            {result.message || t("add_meal_result_done")}
          </p>
        </div>

        {typeof result.total_kcal !== "undefined" && (
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-foreground">{result.total_kcal}</span>
            <span className="text-lg text-muted-foreground">kcal</span>
          </div>
        )}

        {Array.isArray(result.items) && result.items.length > 0 ? (
          <ul className="space-y-2 pt-2 border-t border-border">
            {result.items.map((item, idx) => (
              <li key={idx} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                    <Utensils className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-medium text-foreground">{item.food}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">{item.kcal} kcal</p>
                  <p className="text-xs text-muted-foreground">{item.grams}g</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm">{t("add_meal_no_food")}</p>
        )}
      </div>

      {!showForm && Array.isArray(result.items) && result.items.length > 0 && (
        <Button type="button" className="w-full h-14 rounded-2xl gap-2 text-base" onClick={() => setShowForm(true)}>
          <Plus className="w-5 h-5" />
          {t("add_meal_save_meal")}
        </Button>
      )}

      {showForm && <AddAnalyzedMealForm analyzedItems={result.items} onClose={() => setShowForm(false)} />}
    </div>
  );
}

function PhotoAnalyzer({
  onResult,
}: {
  onResult: (result: { total_kcal: number; message: string; items: { food: string; grams: number; kcal: number }[] }) => void;
}) {
  const { t } = useTranslation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(file: File | null) {
    if (!file) return;
    setSelectedFile(file);
    setError("");
    const url = URL.createObjectURL(file);
    setPreview(url);
  }

  async function handleAnalyze() {
    if (!selectedFile) return;
    setLoading(true);
    setError("");
    try {
      const apiUrl = process.env.NEXT_PUBLIC_JARMY_API_URL || "http://localhost:8000";
      const formData = new FormData();
      formData.append("file", selectedFile);
      const res = await fetch(`${apiUrl}/analyze-image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_KCAL_TOKEN}`,
        },
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.detail || "error");
      }
      const data = await res.json();
      onResult(data);
    } catch {
      setError(t("add_meal_photo_error"));
    } finally {
      setLoading(false);
    }
  }

  function clearPhoto() {
    setSelectedFile(null);
    setPreview(null);
    setError("");
  }

  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-4">
          <Camera className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">{t("add_meal_photo_title")}</h1>
        <p className="text-muted-foreground text-sm">{t("add_meal_photo_subtitle")}</p>
      </div>

      {preview ? (
        <div className="relative rounded-2xl overflow-hidden border border-border bg-card">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="meal preview"
            className="w-full max-h-64 object-cover"
          />
          <button
            type="button"
            onClick={clearPhoto}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="absolute bottom-0 left-0 right-0 px-4 py-2 bg-gradient-to-t from-black/60 to-transparent">
            <p className="text-white text-xs font-medium">{t("add_meal_photo_preview")}</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-3 p-6 bg-card border-2 border-dashed border-border rounded-2xl hover:border-primary hover:bg-accent/50 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Upload className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm font-medium text-foreground text-center">{t("add_meal_photo_upload")}</span>
          </button>

          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-3 p-6 bg-card border-2 border-dashed border-border rounded-2xl hover:border-primary hover:bg-accent/50 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Camera className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm font-medium text-foreground text-center">{t("add_meal_photo_camera")}</span>
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
      />

      {selectedFile && (
        <Button
          type="button"
          className="w-full h-14 rounded-2xl gap-2 text-base font-semibold"
          disabled={loading}
          onClick={handleAnalyze}
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              {t("add_meal_photo_analyzing")}
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              {t("add_meal_photo_analyze")}
            </>
          )}
        </Button>
      )}

      {error && (
        <div className="p-4 bg-destructive/10 rounded-xl">
          <p className="text-destructive text-sm text-center">{error}</p>
        </div>
      )}
    </div>
  );
}

export default function AddMealPage() {
  const { t } = useTranslation();
  const [mode, setMode] = useState<"text" | "photo">("text");
  const [text, setText] = useState("");
  const [result, setResult] = useState<null | {
    total_kcal: number;
    message: string;
    items: { food: string; grams: number; kcal: number }[];
  }>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPremium, setIsPremium] = useState<boolean | null>(null);

  useEffect(() => {
    const abonnement = localStorage.getItem("user_abonnement");
    setIsPremium(abonnement === "premium" || abonnement === "premium_plus");
  }, []);

  function handleModeChange(newMode: "text" | "photo") {
    setMode(newMode);
    setResult(null);
    setError("");
  }

  async function handleAnalyze(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_JARMY_API_URL || "http://localhost:8000";
      const res = await apiFetch(`${apiUrl}/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_KCAL_TOKEN}`,
        },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error();
      setResult(await res.json());
    } catch {
      setError(t("add_meal_error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <header className="flex items-center justify-between px-5 py-4 bg-card/80 backdrop-blur-sm sticky top-0 z-10 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">{t("back")}</span>
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
            <Salad className="w-4 h-4 text-primary-foreground" />
          </div>
        </div>
        <div className="w-16" />
      </header>

      <section className="flex-1 flex flex-col px-5 py-6 animate-fade-in">
        <div className="max-w-md mx-auto w-full space-y-6">
          {isPremium === false ? (
            <div className="flex flex-col items-center justify-center p-8 bg-card border border-border rounded-3xl text-center space-y-6 mt-10 animate-scale-in">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold">{t("add_meal_paywall_title")}</h2>
                <p className="text-muted-foreground text-sm">{t("add_meal_paywall_desc")}</p>
              </div>
              <ul className="text-sm text-left space-y-3 w-full border-t border-b border-border py-4">
                <li className="flex gap-2 items-center"><Check className="w-4 h-4 text-primary"/> {t("add_meal_paywall_feat1")}</li>
                <li className="flex gap-2 items-center"><Check className="w-4 h-4 text-primary"/> {t("add_meal_paywall_feat2")}</li>
                <li className="flex gap-2 items-center"><Check className="w-4 h-4 text-primary"/> {t("add_meal_paywall_feat3")}</li>
              </ul>
              <Link href="/dashboard/subscribe" className="w-full">
                <Button className="w-full h-14 rounded-2xl text-base font-semibold shadow-lg shadow-primary/20">
                  {t("add_meal_paywall_cta")}
                </Button>
              </Link>
              <Link href="/dashboard/manual-meal">
                <Button variant="ghost" className="w-full text-muted-foreground">
                  {t("add_meal_manual_free")}
                </Button>
              </Link>
            </div>
          ) : isPremium === true ? (
            <>
              {/* Mode selector */}
              <div className="flex bg-card border border-border rounded-2xl p-1 gap-1">
                <button
                  type="button"
                  onClick={() => handleModeChange("text")}
                  className={`flex-1 flex items-center justify-center gap-2 h-10 rounded-xl text-sm font-medium transition-all ${
                    mode === "text"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  {t("add_meal_mode_text")}
                </button>
                <button
                  type="button"
                  onClick={() => handleModeChange("photo")}
                  className={`flex-1 flex items-center justify-center gap-2 h-10 rounded-xl text-sm font-medium transition-all ${
                    mode === "photo"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  {t("add_meal_mode_photo")}
                </button>
              </div>

              {mode === "text" ? (
                <>
                  <div className="text-center space-y-2">
                    <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="w-7 h-7 text-primary" />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-foreground">{t("add_meal_title")}</h1>
                    <p className="text-muted-foreground text-sm">{t("add_meal_subtitle")}</p>
                  </div>

                  <form onSubmit={handleAnalyze} className="space-y-4">
                    <div className="relative">
                      <textarea
                        className="w-full h-36 p-4 bg-card border border-border rounded-2xl text-sm resize-none placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
                        placeholder={t("add_meal_placeholder")}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        required
                      />
                      <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
                        {text.length}/500
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-14 rounded-2xl gap-2 text-base font-semibold"
                      disabled={loading || !text.trim()}
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                          {t("add_meal_analyzing")}
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          {t("add_meal_analyze")}
                        </>
                      )}
                    </Button>
                  </form>

                  {error && (
                    <div className="p-4 bg-destructive/10 rounded-xl">
                      <p className="text-destructive text-sm text-center">{error}</p>
                    </div>
                  )}

                  {result && <AddMealResult result={result} />}
                </>
              ) : (
                <>
                  <PhotoAnalyzer onResult={(r) => setResult(r)} />
                  {result && <AddMealResult result={result} />}
                </>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center p-20 space-y-4">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">{t("add_meal_checking")}</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
