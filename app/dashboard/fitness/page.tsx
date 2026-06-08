"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Dumbbell, Zap, Clock, Calendar, RefreshCw, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n-context";

interface WorkoutResult {
  workout_type: string;
  intensity: string;
  duration_hours: number;
  frequency_per_week: number;
  recommendation_id: string;
}

interface FormState {
  age: string;
  weight_kg: string;
  height_m: string;
  sex: "male" | "female" | "";
  fat_percentage: string;
  resting_bpm: string;
  experience_level: "1" | "2" | "3";
}

const INTENSITY_COLORS: Record<string, string> = {
  Low: "text-blue-500",
  Medium: "text-yellow-500",
  High: "text-orange-500",
  "Very High": "text-red-500",
};

export default function FitnessPage() {
  const { t } = useTranslation();
  const [result, setResult] = useState<WorkoutResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(true);

  const [form, setForm] = useState<FormState>({
    age: "",
    weight_kg: "",
    height_m: "",
    sex: "",
    fat_percentage: "",
    resting_bpm: "",
    experience_level: "1",
  });

  useEffect(() => {
    const age = localStorage.getItem("user_age") || "";
    const poids = localStorage.getItem("user_poids") || "";
    const taille = localStorage.getItem("user_taille") || "";
    setForm((prev) => ({
      ...prev,
      age,
      weight_kg: poids,
      height_m: taille ? (parseFloat(taille) / 100).toFixed(2) : "",
    }));
  }, []);

  function set(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  const isFormValid =
    form.age && form.weight_kg && form.height_m && form.sex;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isFormValid) return;
    setLoading(true);
    setError("");
    try {
      const apiUrl = process.env.NEXT_PUBLIC_RECOMMENDATION_API_URL || "http://localhost:8000";
      const apiKey = process.env.NEXT_PUBLIC_RECOMMENDATION_API_KEY || "";

      const body: Record<string, unknown> = {
        age: parseInt(form.age),
        weight_kg: parseFloat(form.weight_kg),
        height_m: parseFloat(form.height_m),
        sex: form.sex,
        experience_level: parseInt(form.experience_level),
      };
      if (form.fat_percentage) body.fat_percentage = parseFloat(form.fat_percentage);
      if (form.resting_bpm) body.resting_bpm = parseInt(form.resting_bpm);

      const res = await fetch(`${apiUrl}/recommend/workout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.detail || "error");
      }

      const data: WorkoutResult = await res.json();
      setResult(data);
      setShowForm(false);
    } catch {
      setError(t("fitness_error"));
    } finally {
      setLoading(false);
    }
  }

  const inputCls =
    "w-full h-12 px-4 bg-input border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow";

  const levelOptions = [
    { value: "1", label: t("fitness_level_beginner") },
    { value: "2", label: t("fitness_level_intermediate") },
    { value: "3", label: t("fitness_level_advanced") },
  ];

  return (
    <main className="min-h-screen flex flex-col bg-background pb-24">
      <header className="flex items-center justify-between px-5 py-4 bg-card/80 backdrop-blur-sm sticky top-0 z-10 border-b border-border">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">{t("back")}</span>
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
            <Dumbbell className="w-4 h-4 text-primary-foreground" />
          </div>
        </div>
        <div className="w-16" />
      </header>

      <section className="flex-1 px-5 py-6 animate-fade-in">
        <div className="max-w-md mx-auto w-full space-y-6">

          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">{t("fitness_title")}</h1>
            <p className="text-muted-foreground text-sm">{t("fitness_subtitle")}</p>
          </div>

          {/* Result card */}
          {result && (
            <div className="p-5 bg-card rounded-3xl border border-border space-y-5 animate-scale-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <h2 className="font-bold text-lg text-foreground">{t("fitness_result_title")}</h2>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-accent rounded-2xl space-y-1">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{t("fitness_workout_type")}</p>
                  <p className="font-bold text-foreground text-base">{result.workout_type}</p>
                </div>
                <div className="p-4 bg-accent rounded-2xl space-y-1">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{t("fitness_intensity")}</p>
                  <p className={`font-bold text-base ${INTENSITY_COLORS[result.intensity] ?? "text-foreground"}`}>
                    {result.intensity}
                  </p>
                </div>
                <div className="p-4 bg-accent rounded-2xl space-y-1 flex flex-col">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {t("fitness_duration")}
                  </p>
                  <p className="font-bold text-foreground text-base">
                    {result.duration_hours}{" "}
                    <span className="text-xs font-normal text-muted-foreground">{t("fitness_duration_unit")}</span>
                  </p>
                </div>
                <div className="p-4 bg-accent rounded-2xl space-y-1 flex flex-col">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {t("fitness_frequency")}
                  </p>
                  <p className="font-bold text-foreground text-base">
                    {result.frequency_per_week}{" "}
                    <span className="text-xs font-normal text-muted-foreground">{t("fitness_frequency_unit")}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowForm((v) => !v)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                {t("fitness_retry")}
                <ChevronDown className={`w-4 h-4 transition-transform ${showForm ? "rotate-180" : ""}`} />
              </button>
            </div>
          )}

          {/* Form */}
          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-4 animate-slide-up">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-1">
                {t("fitness_form_title")}
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground ml-1">{t("fitness_age")}</label>
                  <input
                    type="number"
                    min={10}
                    max={120}
                    value={form.age}
                    onChange={(e) => set("age", e.target.value)}
                    placeholder="25"
                    className={inputCls}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground ml-1">{t("fitness_weight")}</label>
                  <input
                    type="number"
                    min={20}
                    max={300}
                    step={0.1}
                    value={form.weight_kg}
                    onChange={(e) => set("weight_kg", e.target.value)}
                    placeholder="70"
                    className={inputCls}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground ml-1">{t("fitness_height")}</label>
                  <input
                    type="number"
                    min={1.0}
                    max={2.5}
                    step={0.01}
                    value={form.height_m}
                    onChange={(e) => set("height_m", e.target.value)}
                    placeholder="1.75"
                    className={inputCls}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground ml-1">{t("fitness_sex")}</label>
                  <div className="flex gap-2 h-12">
                    <button
                      type="button"
                      onClick={() => set("sex", "male")}
                      className={`flex-1 rounded-xl text-sm font-medium border transition-all ${
                        form.sex === "male"
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-input border-border text-foreground hover:bg-accent"
                      }`}
                    >
                      {t("fitness_sex_male")}
                    </button>
                    <button
                      type="button"
                      onClick={() => set("sex", "female")}
                      className={`flex-1 rounded-xl text-sm font-medium border transition-all ${
                        form.sex === "female"
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-input border-border text-foreground hover:bg-accent"
                      }`}
                    >
                      {t("fitness_sex_female")}
                    </button>
                  </div>
                </div>
              </div>

              {/* Experience level */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground ml-1">{t("fitness_level")}</label>
                <div className="flex gap-2">
                  {levelOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => set("experience_level", opt.value as FormState["experience_level"])}
                      className={`flex-1 h-10 rounded-xl text-sm font-medium border transition-all ${
                        form.experience_level === opt.value
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-input border-border text-foreground hover:bg-accent"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional fields */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground ml-1">{t("fitness_fat")}</label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    step={0.1}
                    value={form.fat_percentage}
                    onChange={(e) => set("fat_percentage", e.target.value)}
                    placeholder="—"
                    className={inputCls}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground ml-1">{t("fitness_bpm")}</label>
                  <input
                    type="number"
                    min={30}
                    max={120}
                    value={form.resting_bpm}
                    onChange={(e) => set("resting_bpm", e.target.value)}
                    placeholder="—"
                    className={inputCls}
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 bg-destructive/10 rounded-xl">
                  <p className="text-destructive text-sm text-center">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-14 rounded-2xl gap-2 text-base font-semibold"
                disabled={loading || !isFormValid}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    {t("fitness_loading")}
                  </>
                ) : (
                  <>
                    <Dumbbell className="w-5 h-5" />
                    {t("fitness_get_reco")}
                  </>
                )}
              </Button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
