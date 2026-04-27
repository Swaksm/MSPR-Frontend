"use client";

import { useState, useEffect, useMemo } from "react";
import {
  BarChart2, Flame, Scale, TrendingDown, TrendingUp,
  Plus, Check, ChevronDown, ChevronUp,
} from "lucide-react";
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n-context";
import { apiFetch } from "@/lib/api";

interface MealResponse {
  id: number;
  date_repas: string;
  type_repas: string;
  total_calories: number;
}

interface Metric {
  date_mesure: string;
  poids_kg: number | null;
  heures_sommeil: number | null;
  bpm_repos: number | null;
}

interface DayCalories {
  date: string;
  date_display: string;
  kcal: number;
}

type Period = "7j" | "15j" | "1m" | "3m" | "6m" | "1an";

const PERIODS: { key: Period; label: string; days: number }[] = [
  { key: "7j", label: "7d", days: 7 },
  { key: "15j", label: "15d", days: 15 },
  { key: "1m", label: "1m", days: 30 },
  { key: "3m", label: "3m", days: 90 },
  { key: "6m", label: "6m", days: 180 },
  { key: "1an", label: "1y", days: 365 },
];

function buildCaloriesHistory(meals: MealResponse[], days: number, locale: string): DayCalories[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days + 1);
  cutoff.setHours(0, 0, 0, 0);

  const byDay: Record<string, number> = {};
  for (const m of meals) {
    const d = m.date_repas?.slice(0, 10);
    if (!d) continue;
    if (new Date(d) < cutoff) continue;
    byDay[d] = (byDay[d] || 0) + (m.total_calories || 0);
  }

  if (days <= 30) {
    return Object.entries(byDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, kcal]) => ({
        date,
        date_display: new Date(date).toLocaleDateString(locale, { day: "2-digit", month: "2-digit" }),
        kcal: Math.round(kcal),
      }));
  }

  if (days <= 180) {
    const byWeek: Record<string, { total: number; count: number; label: string }> = {};
    for (const [date, kcal] of Object.entries(byDay)) {
      const d = new Date(date);
      const monday = new Date(d);
      monday.setDate(d.getDate() - d.getDay() + (d.getDay() === 0 ? -6 : 1));
      const key = monday.toISOString().slice(0, 10);
      if (!byWeek[key]) {
        byWeek[key] = {
          total: 0, count: 0,
          label: monday.toLocaleDateString(locale, { day: "2-digit", month: "2-digit" }),
        };
      }
      byWeek[key].total += kcal;
      byWeek[key].count++;
    }
    return Object.entries(byWeek)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, v]) => ({
        date,
        date_display: `W. ${v.label}`,
        kcal: Math.round(v.total / v.count),
      }));
  }

  const byMonth: Record<string, { total: number; count: number }> = {};
  for (const [date, kcal] of Object.entries(byDay)) {
    const key = date.slice(0, 7);
    if (!byMonth[key]) byMonth[key] = { total: 0, count: 0 };
    byMonth[key].total += kcal;
    byMonth[key].count++;
  }
  return Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, v]) => {
      const [y, m] = key.split("-");
      return {
        date: key,
        date_display: new Date(Number(y), Number(m) - 1).toLocaleDateString(locale, { month: "short" }),
        kcal: Math.round(v.total / v.count),
      };
    });
}

function filterMetrics(metrics: Metric[], days: number) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days + 1);
  cutoff.setHours(0, 0, 0, 0);
  return metrics.filter((m) => new Date(m.date_mesure) >= cutoff);
}

export default function StatsPage() {
  const { t, lang } = useTranslation();
  const locale = lang === "fr" ? "fr-FR" : "en-US";

  const [meals, setMeals] = useState<MealResponse[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [calPeriod, setCalPeriod] = useState<Period>("1m");
  const [weightPeriod, setWeightPeriod] = useState<Period>("3m");

  const today = new Date().toISOString().slice(0, 10);
  const [formDate, setFormDate] = useState(today);
  const [formPoids, setFormPoids] = useState("");
  const [formSommeil, setFormSommeil] = useState("");
  const [formBpm, setFormBpm] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    if (!userId) { setLoading(false); return; }

    Promise.all([
      apiFetch(`http://localhost:8000/meal/users/${userId}/meals`).then((r) => r.json()),
      apiFetch(`http://localhost:8000/meal/users/${userId}/metrics`).then((r) => r.json()),
    ])
      .then(([mealsData, metricsData]) => {
        setMeals(Array.isArray(mealsData) ? mealsData : []);
        setMetrics(Array.isArray(metricsData) ? metricsData : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleAddMetric(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    if (!formPoids && !formSommeil && !formBpm) { setFormError(t("stats_fill_one")); return; }
    setFormLoading(true);
    try {
      const userId = localStorage.getItem("user_id") || "1";
      const body: Record<string, unknown> = { date_mesure: formDate };
      if (formPoids) body.poids_kg = Number(formPoids);
      if (formSommeil) body.heures_sommeil = Number(formSommeil);
      if (formBpm) body.bpm_repos = Number(formBpm);

      const res = await apiFetch(`http://localhost:8000/meal/users/${userId}/metrics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      const updated: Metric = await res.json();
      setMetrics((prev) => {
        const filtered = prev.filter((m) => m.date_mesure?.slice(0, 10) !== updated.date_mesure?.slice(0, 10));
        return [...filtered, updated].sort((a, b) => (a.date_mesure || "").localeCompare(b.date_mesure || ""));
      });
      setFormSuccess(t("stats_saved"));
      setFormPoids(""); setFormSommeil(""); setFormBpm("");
      setTimeout(() => { setFormSuccess(""); setShowForm(false); }, 1500);
    } catch {
      setFormError(t("stats_save_error"));
    } finally {
      setFormLoading(false);
    }
  }

  const calDays = PERIODS.find((p) => p.key === calPeriod)!.days;
  const weightDays = PERIODS.find((p) => p.key === weightPeriod)!.days;

  const caloriesHistory = useMemo(() => buildCaloriesHistory(meals, calDays, locale), [meals, calDays, locale]);
  const weightData = useMemo(() =>
    filterMetrics(metrics, weightDays)
      .filter((m) => m.poids_kg)
      .map((m) => ({
        date_display: new Date(m.date_mesure).toLocaleDateString(locale, { day: "2-digit", month: "2-digit" }),
        poids_kg: m.poids_kg,
      })),
    [metrics, weightDays, locale]
  );

  const avgKcal = caloriesHistory.length
    ? Math.round(caloriesHistory.reduce((s, d) => s + d.kcal, 0) / caloriesHistory.length)
    : 0;
  const allWeightData = metrics.filter((m) => m.poids_kg);
  const lastWeight = allWeightData[allWeightData.length - 1]?.poids_kg ?? null;
  const firstWeight = allWeightData[0]?.poids_kg ?? null;
  const weightDelta = lastWeight !== null && firstWeight !== null
    ? Math.round((lastWeight - firstWeight) * 10) / 10
    : null;
  const totalMeals = meals.length;

  const MEAL_LABELS: Record<string, string> = {
    petit_dejeuner: t("meal_type_breakfast"),
    dejeuner: t("meal_type_lunch"),
    diner: t("meal_type_dinner"),
    collation: t("meal_type_snack"),
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="px-5 pt-6 pb-4">
        <div className="flex justify-between items-start max-w-md mx-auto">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("stats_title")}</h1>
            <p className="text-xs text-muted-foreground">{t("stats_subtitle")}</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
            <BarChart2 className="w-5 h-5 text-primary" />
          </div>
        </div>
      </header>

      <section className="px-5 pb-24 space-y-5 animate-fade-in max-w-md mx-auto">
        {/* KPIs */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-card rounded-2xl border border-border text-center space-y-1">
            <Flame className="w-5 h-5 text-orange-500 mx-auto" />
            <p className="text-lg font-bold">{loading ? "..." : avgKcal}</p>
            <p className="text-[10px] text-muted-foreground">{t("stats_avg_kcal")}</p>
          </div>
          <div className="p-3 bg-card rounded-2xl border border-border text-center space-y-1">
            <Scale className="w-5 h-5 text-emerald-500 mx-auto" />
            <p className="text-lg font-bold">{loading ? "..." : lastWeight ? `${lastWeight} kg` : "--"}</p>
            <p className="text-[10px] text-muted-foreground">{t("stats_current_weight")}</p>
          </div>
          <div className="p-3 bg-card rounded-2xl border border-border text-center space-y-1">
            {weightDelta !== null && weightDelta < 0
              ? <TrendingDown className="w-5 h-5 text-rose-500 mx-auto" />
              : <TrendingUp className="w-5 h-5 text-blue-500 mx-auto" />}
            <p className="text-lg font-bold">
              {loading ? "..." : weightDelta !== null ? `${weightDelta > 0 ? "+" : ""}${weightDelta} kg` : "--"}
            </p>
            <p className="text-[10px] text-muted-foreground">{t("stats_change")}</p>
          </div>
        </div>

        {/* Log progress button */}
        <button
          onClick={() => setShowForm((v) => !v)}
          className="w-full flex items-center justify-between p-4 bg-card border border-border rounded-2xl hover:border-primary/50 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Plus className="w-4 h-4 text-primary" />
            </div>
            <span className="font-semibold text-sm">{t("stats_log_progress")}</span>
          </div>
          {showForm ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </button>

        {showForm && (
          <form onSubmit={handleAddMetric} className="p-4 bg-card border border-primary/20 rounded-2xl space-y-4 animate-scale-in">
            <h3 className="font-semibold text-sm">{t("stats_new_entry")}</h3>
            <input
              type="date"
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
              className="w-full h-11 px-4 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-muted-foreground">{t("stats_weight")}</label>
                <input
                  type="number" step="0.1" min="20" max="300" placeholder="70.5"
                  value={formPoids} onChange={(e) => setFormPoids(e.target.value)}
                  className="w-full h-11 px-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-muted-foreground">{t("stats_sleep")}</label>
                <input
                  type="number" step="0.5" min="0" max="24" placeholder="7.5"
                  value={formSommeil} onChange={(e) => setFormSommeil(e.target.value)}
                  className="w-full h-11 px-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-muted-foreground">{t("stats_bpm")}</label>
                <input
                  type="number" min="30" max="250" placeholder="62"
                  value={formBpm} onChange={(e) => setFormBpm(e.target.value)}
                  className="w-full h-11 px-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            {formError && <p className="text-destructive text-sm">{formError}</p>}
            {formSuccess && (
              <div className="flex items-center gap-2 text-primary text-sm font-medium">
                <Check className="w-4 h-4" /> {formSuccess}
              </div>
            )}
            <Button type="submit" className="w-full h-11 rounded-xl" disabled={formLoading}>
              {formLoading ? t("stats_saving") : t("stats_save")}
            </Button>
          </form>
        )}

        {/* Calories chart */}
        <div className="p-5 bg-card border border-border rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <h3 className="font-semibold text-sm">{t("stats_calories_chart")}</h3>
            </div>
            <div className="flex gap-1">
              {PERIODS.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setCalPeriod(p.key)}
                  className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all ${
                    calPeriod === p.key ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          {loading ? (
            <div className="h-48 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : caloriesHistory.length === 0 ? (
            <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
              {t("stats_no_data_period")}
            </div>
          ) : (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={caloriesHistory}>
                  <defs>
                    <linearGradient id="kcalGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="date_display" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} interval="preserveStartEnd" />
                  <YAxis hide domain={[0, "dataMax + 300"]} />
                  <Tooltip
                    contentStyle={{ borderRadius: "12px", border: "none", backgroundColor: "hsl(var(--card))", color: "hsl(var(--foreground))", fontSize: 12 }}
                    formatter={(v: number) => [`${v} kcal`, calDays > 30 ? t("stats_avg_label") : t("stats_calories_chart")]}
                  />
                  <Area type="monotone" dataKey="kcal" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#kcalGrad)" dot={false} activeDot={{ r: 5 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
          {calDays > 30 && (
            <p className="text-[10px] text-muted-foreground text-center">
              {calDays <= 180 ? t("stats_avg_week") : t("stats_avg_month")}
            </p>
          )}
        </div>

        {/* Weight chart */}
        <div className="p-5 bg-card border border-border rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-500" />
              <h3 className="font-semibold text-sm">{t("stats_weight_chart")}</h3>
              {lastWeight && <span className="text-sm font-bold text-emerald-500">{lastWeight} kg</span>}
            </div>
            <div className="flex gap-1">
              {PERIODS.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setWeightPeriod(p.key)}
                  className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all ${
                    weightPeriod === p.key ? "bg-emerald-500 text-white" : "bg-secondary text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          {loading ? (
            <div className="h-48 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : weightData.length < 2 ? (
            <div className="h-32 flex flex-col items-center justify-center gap-2 text-muted-foreground text-sm text-center">
              <p>{t("stats_add_weight")}</p>
              <button onClick={() => setShowForm(true)} className="text-primary font-semibold text-xs underline">
                {t("stats_log_cta")}
              </button>
            </div>
          ) : (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="date_display" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} interval="preserveStartEnd" />
                  <YAxis domain={["dataMin - 2", "dataMax + 2"]} hide />
                  <Tooltip
                    contentStyle={{ borderRadius: "12px", border: "none", backgroundColor: "hsl(var(--card))", color: "hsl(var(--foreground))", fontSize: 12 }}
                    formatter={(v: number) => [`${v} kg`, t("stats_weight_chart")]}
                  />
                  <Line type="monotone" dataKey="poids_kg" stroke="#10b981" strokeWidth={3} dot={{ r: 3, strokeWidth: 2, fill: "#10b981" }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Meal breakdown */}
        {!loading && meals.length > 0 && (
          <div className="p-5 bg-card border border-border rounded-2xl space-y-4">
            <h3 className="font-semibold">{t("stats_meals_recorded")}</h3>
            <div className="grid grid-cols-2 gap-3">
              {(["petit_dejeuner", "dejeuner", "diner", "collation"] as const).map((type) => {
                const count = meals.filter((m) => m.type_repas === type).length;
                const pct = totalMeals ? Math.round((count / totalMeals) * 100) : 0;
                return (
                  <div key={type} className="p-3 bg-background rounded-xl border border-border space-y-1">
                    <p className="text-xs font-bold text-muted-foreground uppercase">{MEAL_LABELS[type]}</p>
                    <p className="text-xl font-black">{count}</p>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-[10px] text-muted-foreground">{pct}%</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
