"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Salad, ArrowRight, TrendingDown, TrendingUp, Moon, Activity,
  Zap, Target, Ruler, Weight, Calendar, Flame, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/lib/i18n-context";
import { apiFetch } from "@/lib/api";

export default function OnboardingPage() {
  const router = useRouter();
  const { t } = useTranslation();

  const OBJECTIVES = [
    { id: "perte_de_poids", labelKey: "obj_weight_loss" as const, icon: TrendingDown, color: "text-rose-500 bg-rose-500/10 border-rose-500/30" },
    { id: "prise_de_masse", labelKey: "obj_muscle_gain" as const, icon: TrendingUp, color: "text-blue-500 bg-blue-500/10 border-blue-500/30" },
    { id: "maintien_forme", labelKey: "obj_maintenance" as const, icon: Activity, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30" },
    { id: "amelioration_sommeil", labelKey: "obj_sleep" as const, icon: Moon, color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/30" },
    { id: "endurance", labelKey: "obj_endurance" as const, icon: Zap, color: "text-amber-500 bg-amber-500/10 border-amber-500/30" },
  ];

  const ACTIVITY_LEVELS = [
    { id: "sedentaire", labelKey: "activity_sedentary" as const, descKey: "activity_sedentary_desc" as const },
    { id: "leger", labelKey: "activity_light" as const, descKey: "activity_light_desc" as const },
    { id: "modere", labelKey: "activity_moderate" as const, descKey: "activity_moderate_desc" as const },
    { id: "actif", labelKey: "activity_active" as const, descKey: "activity_active_desc" as const },
    { id: "tres_actif", labelKey: "activity_very_active" as const, descKey: "activity_very_active_desc" as const },
  ];

  const [step, setStep] = useState(0);
  const [firstName, setFirstName] = useState("you");
  const [selectedObjective, setSelectedObjective] = useState<string | null>(null);
  const [age, setAge] = useState("");
  const [poids, setPoids] = useState("");
  const [taille, setTaille] = useState("");
  const [activite, setActivite] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const name = localStorage.getItem("user_name") || "";
    if (name) setFirstName(name.split(" ")[0]);
  }, []);

  function skip() {
    sessionStorage.removeItem("pending_onboarding");
    router.push("/dashboard");
  }

  async function finish() {
    setSaving(true);
    sessionStorage.removeItem("pending_onboarding");

    const userId = localStorage.getItem("user_id");

    if (age) localStorage.setItem("user_age", age);
    if (poids) localStorage.setItem("user_poids", poids);
    if (taille) localStorage.setItem("user_taille", taille);
    if (activite) localStorage.setItem("user_activite", activite);

    if (userId && selectedObjective) {
      try {
        const availRes = await apiFetch(`${process.env.NEXT_PUBLIC_JARMY_API_URL || "http://localhost:8000"}/meal/objectifs`);
        if (availRes.ok) {
          const available: { id: number; libelle: string }[] = await availRes.json();
          const match = available.find((o) => o.libelle === selectedObjective);
          if (match) {
            await apiFetch(`${process.env.NEXT_PUBLIC_JARMY_API_URL || "http://localhost:8000"}/meal/users/${userId}/objectives`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ objectif_id: match.id }),
            });
          }
        }
      } catch {
        // silently continue
      }
    }

    router.push("/dashboard");
  }

  const totalSteps = 4;
  const progress = ((step + 1) / totalSteps) * 100;

  const selectedObj = OBJECTIVES.find((o) => o.id === selectedObjective);
  const selectedAct = ACTIVITY_LEVELS.find((a) => a.id === activite);

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <div className="h-1 w-full bg-secondary">
        <div className="h-full bg-primary transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
      </div>

      <header className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
            <Salad className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-base font-semibold tracking-tight">Jarmy</span>
        </div>
        <button onClick={skip} className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
          {t("skip")}
        </button>
      </header>

      <section className="flex-1 flex flex-col items-center justify-center px-5 py-8 animate-fade-in">
        <div className="w-full max-w-sm space-y-8">

          {/* Step dots */}
          <div className="flex justify-center gap-2">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step ? "w-8 bg-primary" : i < step ? "w-4 bg-primary/40" : "w-4 bg-secondary"
                }`}
              />
            ))}
          </div>

          {/* STEP 0: Welcome */}
          {step === 0 && (
            <div className="space-y-8 text-center">
              <div className="flex justify-center">
                <div className="w-24 h-24 rounded-3xl bg-accent flex items-center justify-center animate-scale-in">
                  <Salad className="w-12 h-12 text-primary" />
                </div>
              </div>
              <div className="space-y-3">
                <h1 className="text-3xl font-black tracking-tight">
                  {t("onboarding_welcome")} {firstName} !
                </h1>
                <p className="text-muted-foreground text-base leading-relaxed">{t("onboarding_welcome_desc")}</p>
              </div>
              <div className="space-y-3 text-left">
                {[
                  { icon: Target, key: "onboarding_feature_goals" as const },
                  { icon: Flame, key: "onboarding_feature_calories" as const },
                  { icon: Activity, key: "onboarding_feature_reco" as const },
                ].map(({ icon: Icon, key }) => (
                  <div key={key} className="flex items-center gap-3 p-3 bg-card border border-border rounded-2xl">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium">{t(key)}</span>
                  </div>
                ))}
              </div>
              <Button className="w-full h-14 rounded-xl text-base font-semibold gap-2" onClick={() => setStep(1)}>
                {t("onboarding_lets_go")} <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* STEP 1: Goal */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-black tracking-tight">{t("onboarding_objective_title")}</h2>
                <p className="text-muted-foreground text-sm">{t("onboarding_objective_subtitle")}</p>
              </div>
              <div className="space-y-3">
                {OBJECTIVES.map(({ id, labelKey, icon: Icon, color }) => (
                  <button
                    key={id}
                    onClick={() => setSelectedObjective(id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                      selectedObjective === id
                        ? "border-primary bg-primary/5"
                        : "border-border bg-card hover:border-primary/30"
                    }`}
                  >
                    <div className={`p-3 rounded-xl border ${color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-semibold text-sm">{t(labelKey)}</span>
                    {selectedObjective === id && (
                      <div className="ml-auto w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                        <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 h-12 rounded-xl" onClick={() => setStep(2)}>
                  {t("skip")}
                </Button>
                <Button className="flex-1 h-12 rounded-xl gap-2" disabled={!selectedObjective} onClick={() => setStep(2)}>
                  {t("next")} <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: Physical info */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-black tracking-tight">{t("onboarding_physical_title")}</h2>
                <p className="text-muted-foreground text-sm">{t("onboarding_physical_subtitle")}</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-3 h-3" /> {t("onboarding_age")}
                  </label>
                  <Input
                    type="number"
                    placeholder="28"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    min={10} max={100}
                    className="h-14 px-4 rounded-xl bg-card border-border text-base"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Weight className="w-3 h-3" /> {t("onboarding_weight")}
                    </label>
                    <Input
                      type="number"
                      placeholder="72"
                      value={poids}
                      onChange={(e) => setPoids(e.target.value)}
                      min={30} max={300}
                      className="h-14 px-4 rounded-xl bg-card border-border text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Ruler className="w-3 h-3" /> {t("onboarding_height")}
                    </label>
                    <Input
                      type="number"
                      placeholder="175"
                      value={taille}
                      onChange={(e) => setTaille(e.target.value)}
                      min={100} max={250}
                      className="h-14 px-4 rounded-xl bg-card border-border text-base"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    {t("onboarding_activity")}
                  </label>
                  <div className="space-y-2">
                    {ACTIVITY_LEVELS.map(({ id, labelKey, descKey }) => (
                      <button
                        key={id}
                        onClick={() => setActivite(id)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all text-left ${
                          activite === id ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/30"
                        }`}
                      >
                        <span className="text-sm font-semibold">{t(labelKey)}</span>
                        <span className="text-xs text-muted-foreground">{t(descKey)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 h-12 rounded-xl" onClick={() => setStep(3)}>
                  {t("skip")}
                </Button>
                <Button className="flex-1 h-12 rounded-xl gap-2" onClick={() => setStep(3)}>
                  {t("next")} <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: All set */}
          {step === 3 && (
            <div className="space-y-8 text-center">
              <div className="flex justify-center">
                <div className="relative w-24 h-24">
                  <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center">
                    <Salad className="w-12 h-12 text-primary" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
                    <span className="text-lg">🎉</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <h2 className="text-3xl font-black tracking-tight">{t("onboarding_ready_title")}</h2>
                <p className="text-muted-foreground text-base leading-relaxed">{t("onboarding_ready_desc")}</p>
              </div>
              <div className="p-4 bg-card border border-primary/20 rounded-2xl space-y-3 text-left">
                {selectedObj && (
                  <div className="flex items-center gap-3">
                    <Target className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-sm font-medium">{t("onboarding_goal_label")} {t(selectedObj.labelKey)}</span>
                  </div>
                )}
                {poids && taille && (
                  <div className="flex items-center gap-3">
                    <Activity className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-sm font-medium">
                      {poids} kg · {taille} cm{age ? ` · ${age} ${age === "1" ? "yr" : "yrs"}` : ""}
                    </span>
                  </div>
                )}
                {selectedAct && (
                  <div className="flex items-center gap-3">
                    <Flame className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-sm font-medium">{t("onboarding_activity_label")} {t(selectedAct.labelKey)}</span>
                  </div>
                )}
                {!selectedObj && !poids && !selectedAct && (
                  <p className="text-sm text-muted-foreground">{t("onboarding_no_data")}</p>
                )}
              </div>
              <Button className="w-full h-14 rounded-xl text-base font-semibold gap-2" disabled={saving} onClick={finish}>
                {saving ? (
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <>{t("onboarding_discover")} <ArrowRight className="w-4 h-4" /></>
                )}
              </Button>
            </div>
          )}

        </div>
      </section>
    </main>
  );
}
