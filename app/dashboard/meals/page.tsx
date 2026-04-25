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

function formatTypeRepas(type: string): string {
  const labels: Record<string, string> = {
    petit_dejeuner: "Petit-dejeuner",
    dejeuner: "Dejeuner",
    diner: "Diner",
    collation: "Collation",
  };
  return labels[type] || type;
}

function getTypeIcon(type: string) {
  const icons: Record<string, string> = {
    petit_dejeuner: "sunrise",
    dejeuner: "sun",
    diner: "moon",
    collation: "cookie",
  };
  return icons[type] || "utensils";
}

export default function MealsPage() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    setLoading(true);
    const userId = localStorage.getItem("user_id") || "1";
    fetch(`http://localhost:8003/users/${userId}/meals`)
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : (data.meals ?? data.items ?? []);
        setMeals(list);
      })
      .catch(() => setError("Erreur lors du chargement des repas"))
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
      const res = await fetch(`http://localhost:8003/meals/${mealId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setMeals((prev) => prev.filter((m) => m.id !== mealId));
      setShowPopup(false);
      setSelectedMeal(null);
    } catch {
      setDeleteError("Erreur lors de la suppression.");
    } finally {
      setDeleting(false);
    }
  };

  // Group meals by date
  const groupedMeals = meals.reduce((acc, meal) => {
    const date = meal.date_repas;
    if (!acc[date]) acc[date] = [];
    acc[date].push(meal);
    return acc;
  }, {} as Record<string, Meal[]>);

  const sortedDates = Object.keys(groupedMeals).sort((a, b) => b.localeCompare(a));

  return (
    <main className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4 bg-card/80 backdrop-blur-sm sticky top-0 z-10 border-b border-border">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Retour</span>
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
            <Salad className="w-4 h-4 text-primary-foreground" />
          </div>
        </div>
        <Link
          href="/dashboard/manual-meal"
          className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter</span>
        </Link>
      </header>

      {/* Content */}
      <section className="flex-1 flex flex-col px-5 py-6 animate-fade-in">
        <div className="max-w-md mx-auto w-full space-y-6">
          {/* Title */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-4">
              <History className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Historique
            </h1>
            <p className="text-muted-foreground text-sm">
              Tous vos repas enregistres
            </p>
          </div>

          {/* List */}
          {loading ? (
            <div className="py-16 flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              <p className="text-muted-foreground text-sm">Chargement...</p>
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
                <p className="font-medium text-foreground">Aucun repas enregistre</p>
                <p className="text-sm text-muted-foreground">
                  Commencez a suivre votre alimentation
                </p>
              </div>
              <Link
                href="/dashboard/manual-meal"
                className="inline-flex items-center justify-center gap-2 h-12 px-6 bg-primary text-primary-foreground font-medium rounded-xl transition-all hover:shadow-lg hover:shadow-primary/25"
              >
                <Plus className="w-4 h-4" />
                Ajouter un repas
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {sortedDates.map((date) => (
                <div key={date} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm font-semibold text-muted-foreground">
                      {new Date(date).toLocaleDateString("fr-FR", {
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
                              {formatTypeRepas(meal.type_repas)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {meal.items.length} aliment{meal.items.length > 1 ? "s" : ""}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 rounded-full">
                            <Flame className="w-3.5 h-3.5 text-primary" />
                            <span className="text-sm font-bold text-primary">
                              {calcTotalKcal(meal.items)}
                            </span>
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

      {/* Popup */}
      {showPopup && selectedMeal && (
        <div
          className="fixed inset-0 bg-foreground/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4 animate-fade-in"
          onClick={() => setShowPopup(false)}
        >
          <div
            className="bg-card w-full max-w-md rounded-3xl p-6 space-y-5 max-h-[85vh] overflow-y-auto animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                  <Utensils className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-bold text-foreground">
                    {formatTypeRepas(selectedMeal.type_repas)}
                  </h2>
                  <p className="text-xs text-muted-foreground">{selectedMeal.date_repas}</p>
                </div>
              </div>
              <button
                onClick={() => setShowPopup(false)}
                className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Total */}
            <div className="p-4 bg-primary/10 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-primary" />
                <span className="font-medium text-foreground">Total calories</span>
              </div>
              <span className="text-2xl font-bold text-primary">
                {calcTotalKcal(selectedMeal.items)} kcal
              </span>
            </div>

            {/* Items */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Aliments
              </p>
              <ul className="space-y-2">
                {selectedMeal.items.map((item, idx) => {
                  const kcal = Math.round((item.calories_100g * item.quantite_g) / 100);
                  return (
                    <li
                      key={idx}
                      className="flex items-center justify-between p-3 bg-secondary rounded-xl"
                    >
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

            {/* Notes */}
            {selectedMeal.notes && (
              <div className="p-3 bg-accent rounded-xl">
                <p className="text-xs text-muted-foreground mb-1">Notes</p>
                <p className="text-sm text-foreground">{selectedMeal.notes}</p>
              </div>
            )}

            {/* Delete */}
            <Button
              onClick={() => handleDelete(selectedMeal.id)}
              disabled={deleting}
              variant="destructive"
              className="w-full h-12 rounded-xl gap-2"
            >
              {deleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-destructive-foreground/30 border-t-destructive-foreground rounded-full animate-spin" />
                  Suppression...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Supprimer ce repas
                </>
              )}
            </Button>
            {deleteError && (
              <p className="text-destructive text-sm text-center">{deleteError}</p>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
