"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  Plus,
  Flame,
  History,
  ChevronRight,
  Zap,
  Watch,
  TrendingUp,
  Target,
  Dumbbell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n-context";
import { apiFetch } from "@/lib/api";

interface MealLineResponse {
  calories_calculees: number;
}

interface MealResponse {
  id: number;
  date_repas: string;
  type_repas: string;
  notes?: string;
  total_calories: number;
  items: MealLineResponse[];
}

interface Objective {
  id: number;
  libelle: string;
  actif: boolean;
}

function calcStreak(meals: MealResponse[]): number {
  if (!meals.length) return 0;
  const dates = new Set(meals.map((m) => m.date_repas).filter(Boolean));
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    if (dates.has(dateStr)) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export default function Dashboard() {
  const router = useRouter();
  const { t, lang } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [userName, setUserName] = useState("Jarmy");
  const [abonnement, setAbonnement] = useState("freemium");
  const [meals, setMeals] = useState<MealResponse[]>([]);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    const userId = localStorage.getItem("user_id");
    if (!userId) {
      router.replace("/login");
      return;
    }
    setUserName(localStorage.getItem("user_name") || "Jarmy");
    setAbonnement(localStorage.getItem("user_abonnement") || "freemium");

    Promise.all([
      apiFetch(`${process.env.NEXT_PUBLIC_JARMY_API_URL || "http://localhost:8000"}/meal/users/${userId}/meals`).then((r) => r.json()),
      apiFetch(`${process.env.NEXT_PUBLIC_JARMY_API_URL || "http://localhost:8000"}/meal/users/${userId}/objectives`).then((r) => r.json()),
    ])
      .then(([mealsData, objData]) => {
        setMeals(Array.isArray(mealsData) ? mealsData : []);
        setObjectives(Array.isArray(objData) ? objData : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    // Exécuté une seule fois au montage : router.replace est stable, et le
    // garder en dépendance relançait l'effet à chaque render (boucle de fetch).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!mounted) return null;

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayMeals = meals.filter((m) => m.date_repas === todayStr);
  const caloriesTarget = 2100;
  const caloriesConsumed = loading
    ? 0
    : Math.round(todayMeals.reduce((sum, m) => sum + (m.total_calories || 0), 0));
  const progressPercentage = Math.min((caloriesConsumed / caloriesTarget) * 100, 100);

  const streak = loading ? 0 : calcStreak(meals);
  const activeObjective = objectives.find((o) => o.actif);

  const OBJ_LABELS: Record<string, string> = {
    perte_de_poids: t("obj_weight_loss"),
    prise_de_masse: t("obj_muscle_gain"),
    amelioration_sommeil: t("obj_sleep"),
    maintien_forme: t("obj_maintenance"),
    endurance: t("obj_endurance"),
  };

  const objectiveLabel = activeObjective
    ? (OBJ_LABELS[activeObjective.libelle] ?? activeObjective.libelle)
    : "--";

  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12 ? t("greeting_morning") : currentHour < 18 ? t("greeting_afternoon") : t("greeting_evening");
  const firstName = userName.split(" ")[0];

  const REPAS_LABELS: Record<string, string> = {
    petit_dejeuner: t("meal_type_breakfast"),
    dejeuner: t("meal_type_lunch"),
    diner: t("meal_type_dinner"),
    collation: t("meal_type_snack"),
  };

  const recentMeals = [...meals].sort((a, b) => b.id - a.id).slice(0, 3);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="px-5 pt-6 pb-4">
        <div className="flex justify-between items-start max-w-md mx-auto">
          <div>
            <p className="text-muted-foreground text-sm font-medium">{greeting},</p>
            <h1 className="text-2xl font-bold tracking-tight">{firstName} 👋</h1>
          </div>
          <Link href="/dashboard/profiles">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
              <img src="/JARMY-logo-02.svg" alt="Jarmy" className="w-5 h-5" />
            </div>
          </Link>
        </div>
      </header>

      <section className="px-5 pb-6 space-y-5 animate-fade-in max-w-md mx-auto">
        {abonnement === "freemium" ? (
          <div className="relative overflow-hidden p-5 bg-gradient-to-br from-primary to-primary/80 rounded-3xl shadow-lg shadow-primary/20 text-primary-foreground">
            <div className="relative z-10 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-widest opacity-90">{t("dashboard_special_offer")}</span>
              </div>
              <h2 className="text-xl font-black leading-tight">{t("dashboard_unlock_ai")}</h2>
              <p className="text-sm opacity-90 max-w-[200px]">{t("dashboard_unlock_ai_desc")}</p>
              <Link href="/dashboard/subscribe" className="block pt-2">
                <Button variant="secondary" className="w-full rounded-2xl font-bold gap-2 text-primary">
                  {t("dashboard_go_premium")} <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <Zap className="absolute -bottom-4 -right-4 w-32 h-32 opacity-10 rotate-12" />
          </div>
        ) : (
          <div className="p-4 bg-card border border-primary/20 rounded-3xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                {abonnement === "premium_plus" ? (
                  <Watch className="w-5 h-5 text-primary" />
                ) : (
                  <Sparkles className="w-5 h-5 text-primary" />
                )}
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{t("dashboard_account_status")}</p>
                <p className="text-sm font-bold capitalize">{abonnement.replace("_", " ")}</p>
              </div>
            </div>
            <Link href="/dashboard/subscribe">
              <Button variant="ghost" size="sm" className="text-xs text-primary font-bold">{t("manage")}</Button>
            </Link>
          </div>
        )}

        {/* Résumé Calories */}
        <div className="p-6 bg-card border border-border rounded-3xl space-y-5">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-500" />
                {t("dashboard_calories_today")}
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black">{loading ? "..." : caloriesConsumed}</span>
                <span className="text-muted-foreground font-medium">/ {caloriesTarget} kcal</span>
              </div>
            </div>
            <div className="w-14 h-14 relative shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r="20" fill="none" stroke="hsl(var(--muted))" strokeWidth="4" />
                <circle
                  cx="24" cy="24" r="20"
                  fill="none" stroke="hsl(var(--primary))" strokeWidth="4"
                  strokeDasharray={`${Math.min(progressPercentage, 100) * 1.2566} 125.66`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
                {Math.round(progressPercentage)}%
              </span>
            </div>
          </div>
          <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all duration-1000 ease-out" style={{ width: `${progressPercentage}%` }} />
          </div>
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-card rounded-2xl border border-border text-center">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2 mx-auto">
              <Flame className="w-4 h-4" />
            </div>
            <p className="text-xl font-bold">{loading ? "..." : todayMeals.length}</p>
            <p className="text-xs text-muted-foreground">{t("dashboard_meals")}</p>
          </div>
          <div className="p-3 bg-card rounded-2xl border border-border text-center">
            <div className="w-8 h-8 rounded-xl bg-success/10 text-success flex items-center justify-center mb-2 mx-auto">
              <TrendingUp className="w-4 h-4" />
            </div>
            <p className="text-xl font-bold">{loading ? "..." : streak}</p>
            <p className="text-xs text-muted-foreground">{t("dashboard_streak")}</p>
          </div>
          <Link href="/dashboard/objectives" className="block">
            <div className="p-3 bg-card rounded-2xl border border-border text-center h-full">
              <div className="w-8 h-8 rounded-xl bg-warning/10 text-warning flex items-center justify-center mb-2 mx-auto">
                <Target className="w-4 h-4" />
              </div>
              <p className="text-xl font-bold truncate text-xs leading-tight mt-1">{loading ? "..." : objectiveLabel}</p>
              <p className="text-xs text-muted-foreground">{t("dashboard_goal")}</p>
            </div>
          </Link>
        </div>

        {/* Bannière Fitness IA — Premium uniquement */}
        {abonnement !== "freemium" && (
          <Link href="/dashboard/fitness" className="block">
            <div className="relative overflow-hidden flex items-center gap-4 p-4 bg-card border border-border rounded-3xl hover:border-primary/50 transition-all active:scale-[0.99]">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <Dumbbell className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm">{t("fitness_title")}</p>
                <p className="text-xs text-muted-foreground truncate">{t("fitness_subtitle")}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </div>
          </Link>
        )}

        {/* Actions Rapides */}
        <div className="grid grid-cols-3 gap-3">
          <Link href="/dashboard/manual-meal" className="contents">
            <button className="flex flex-col items-center justify-center p-4 bg-card border border-border rounded-3xl gap-2 hover:border-primary/50 transition-all active:scale-95">
              <div className="w-11 h-11 rounded-2xl bg-secondary flex items-center justify-center text-foreground">
                <Plus className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-center leading-tight">{t("dashboard_manual_entry")}</span>
            </button>
          </Link>
          <Link href="/dashboard/add-meal" className="contents">
            <button className="flex flex-col items-center justify-center p-4 bg-card border border-border rounded-3xl gap-2 hover:border-primary/50 transition-all active:scale-95">
              <div className="w-11 h-11 rounded-2xl bg-accent flex items-center justify-center text-primary">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-center leading-tight">{t("dashboard_ai_analysis")}</span>
            </button>
          </Link>
          <Link href="/dashboard/fitness" className="contents">
            <button className="flex flex-col items-center justify-center p-4 bg-card border border-border rounded-3xl gap-2 hover:border-primary/50 transition-all active:scale-95">
              <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Dumbbell className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-center leading-tight">{t("fitness_title")}</span>
            </button>
          </Link>
        </div>

        {/* Historique récent */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-bold flex items-center gap-2">
              <History className="w-4 h-4 text-muted-foreground" />
              {t("dashboard_recent_history")}
            </h3>
            <Link href="/dashboard/meals" className="text-xs font-bold text-primary hover:underline">
              {t("dashboard_see_all")}
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center p-6">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : recentMeals.length === 0 ? (
            <div className="text-center p-8 bg-card border border-dashed border-border rounded-2xl space-y-2">
              <p className="text-muted-foreground text-sm">{t("dashboard_no_meals")}</p>
              <Link href="/dashboard/manual-meal">
                <Button variant="outline" size="sm" className="rounded-xl mt-2">{t("dashboard_add_meal")}</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentMeals.map((meal, i) => (
                <div key={meal.id} className="flex items-center justify-between p-4 bg-card border border-border rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 text-xs font-bold shrink-0">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold truncate">
                        {REPAS_LABELS[meal.type_repas] ?? meal.type_repas}
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase font-medium">
                        {new Date(meal.date_repas).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US")}
                      </p>
                    </div>
                  </div>
                  <p className="font-bold shrink-0 ml-2">{Math.round(meal.total_calories)} kcal</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
