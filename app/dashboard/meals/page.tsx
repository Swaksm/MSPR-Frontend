"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Salad,
  ArrowLeft,
  History,
  Plus,
  X,
  Trash2,
  Utensils,
  Calendar,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n-context";
import { apiFetch } from "@/lib/api";

interface MealItem {
  aliment_nom: string;
  quantite_g: number;
  calories_100g: number;
}

interface Meal {
  id: number;
  type_repas: string;
  date_repas: string;
  notes?: string;
  items: MealItem[];
}

function calcTotalKcal(items: MealItem[]): number {
  if (!Array.isArray(items)) return 0;
  return Math.round(
    items.reduce((sum, item) => sum + (item.calories_100g * item.quantite_g) / 100, 0)
  );
}

export default function MealsPage() {
  const { t, lang } = useTranslation();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const REPAS_LABELS: Record<string, string> = {
    petit_dejeuner: t("meal_type_breakfast"),
    dejeuner: t("meal_type_lunch"),
    diner: t("meal_type_dinner"),
    collation: t("meal_type_snack"),
  };

  useEffect(() => {
    setLoading(true);
    const userId = localStorage.getItem("user_id") || "1";
    apiFetch(`http://localhost:8000/meal/users/${userId}/meals`)
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : (data.meals ?? data.items ?? []);
        setMeals(list);
      })
      .catch(() => setError(t("meals_load_error")))
      .finally(() => setLoading(false));
  }, []);

  const handleShowDetails = (meal: Meal) => {
    setSelectedMeal(meal);
    setShowPopup(true);
    setDeleteError("");
  };

  const handleDelete = async (mealId: number) => {
    setDeleting(true);
    try {
      const res = await apiFetch(`http://localhost:8000/meal/meals/${mealId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setMeals((prev) => prev.filter((m) => m.id !== mealId));
      setShowPopup(false);
      setSelectedMeal(null);
    } catch {
      setDeleteError(t("meals_delete_error"));
    } finally {
      setDeleting(false);
    }
  };

  const groupedMeals = meals.reduce((acc, meal) => {
    const date = meal.date_repas;
    if (!acc[date]) acc[date] = [];
    acc[date].push(meal);
    return acc;
  }, {} as Record<string, Meal[]>);

  const sortedDates = Object.keys(groupedMeals).sort((a, b) => b.localeCompare(a));
  const locale = lang === "fr" ? "fr-FR" : "en-US";

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
        <Link href="/dashboard/manual-meal" className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
          <Plus className="w-4 h-4" />
          <span>{t("meals_add")}</span>
        </Link>
      </header>

      <section className="flex-1 flex flex-col px-5 py-6 animate-fade-in">
        <div className="max-w-md mx-auto w-full space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-4">
              <History className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">{t("meals_title")}</h1>
            <p className="text-muted-foreground text-sm">{t("meals_subtitle")}</p>
          </div>

          {loading ? (
            <div className="py-16 flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              <p className="text-muted-foreground text-sm">{t("meals_loading")}</p>
            </div>
          ) : error ? (
            <div className="py-16 text-center">
              <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                <X className="w-7 h-7 text-destructive" />
              </div>
              <p className="text-destructive text-sm">{error}</p>
            </div>
          ) : meals.length === 0 ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mx-auto">
                <Utensils className="w-7 h-7 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <p className="font-medium text-foreground">{t("meals_none_title")}</p>
                <p className="text-sm text-muted-foreground">{t("meals_none_subtitle")}</p>
              </div>
              <Link href="/dashboard/manual-meal" className="inline-flex items-center justify-center gap-2 h-12 px-6 bg-primary text-primary-foreground font-medium rounded-xl transition-all hover:shadow-lg hover:shadow-primary/25">
                <Plus className="w-4 h-4" />
                {t("meals_add_cta")}
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {sortedDates.map((date) => (
                <div key={date} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm font-semibold text-muted-foreground">
                      {new Date(date).toLocaleDateString(locale, {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })}
                    </p>
                  </div>
                  <ul className="space-y-2">
                    {groupedMeals[date].map((meal) => (
                      <li
                        key={meal.id}
                        className="p-4 bg-card border border-border rounded-2xl cursor-pointer hover:border-primary/30 hover:shadow-sm transition-all active:scale-[0.99]"
                        onClick={() => handleShowDetails(meal)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shrink-0">
                            <Utensils className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-foreground">
                              {REPAS_LABELS[meal.type_repas] ?? meal.type_repas}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {meal.items.length} {lang === "fr" ? `aliment${meal.items.length > 1 ? "s" : ""}` : `food${meal.items.length > 1 ? "s" : ""}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 rounded-full">
                            <Flame className="w-3.5 h-3.5 text-primary" />
                            <span className="text-sm font-bold text-primary">{calcTotalKcal(meal.items)}</span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {showPopup && selectedMeal && (
        <div
          className="fixed inset-0 bg-foreground/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4 animate-fade-in"
          onClick={() => setShowPopup(false)}
        >
          <div
            className="bg-card w-full max-w-md rounded-3xl p-6 space-y-5 max-h-[85vh] overflow-y-auto animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                  <Utensils className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-bold text-foreground">{REPAS_LABELS[selectedMeal.type_repas] ?? selectedMeal.type_repas}</h2>
                  <p className="text-xs text-muted-foreground">{selectedMeal.date_repas}</p>
                </div>
              </div>
              <button onClick={() => setShowPopup(false)} className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-primary/10 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-primary" />
                <span className="font-medium text-foreground">{t("meals_total_calories")}</span>
              </div>
              <span className="text-2xl font-bold text-primary">{calcTotalKcal(selectedMeal.items)} kcal</span>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{t("meals_foods")}</p>
              <ul className="space-y-2">
                {selectedMeal.items.map((item, idx) => {
                  const kcal = Math.round((item.calories_100g * item.quantite_g) / 100);
                  return (
                    <li key={idx} className="flex items-center justify-between p-3 bg-secondary rounded-xl">
                      <span className="font-medium text-foreground">{item.aliment_nom}</span>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-foreground">{kcal} kcal</p>
                        <p className="text-xs text-muted-foreground">{item.quantite_g}g</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            {selectedMeal.notes && (
              <div className="p-3 bg-accent rounded-xl">
                <p className="text-xs text-muted-foreground mb-1">{t("meals_notes")}</p>
                <p className="text-sm text-foreground">{selectedMeal.notes}</p>
              </div>
            )}

            <Button
              onClick={() => handleDelete(selectedMeal.id)}
              disabled={deleting}
              variant="destructive"
              className="w-full h-12 rounded-xl gap-2"
            >
              {deleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-destructive-foreground/30 border-t-destructive-foreground rounded-full animate-spin" />
                  {t("meals_deleting")}
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  {t("meals_delete")}
                </>
              )}
            </Button>
            {deleteError && <p className="text-destructive text-sm text-center">{deleteError}</p>}
          </div>
        </div>
      )}
    </main>
  );
}
