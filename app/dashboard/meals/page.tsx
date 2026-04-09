"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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

  return (
    <main className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <Link href="/dashboard" className="text-lg font-semibold tracking-tight text-foreground">
          Jarmy
        </Link>
        <Link
          href="/dashboard/manual-meal"
          className="text-sm font-medium text-foreground hover:text-muted-foreground transition-colors"
        >
          Ajouter
        </Link>
      </header>

      {/* Content */}
      <section className="flex-1 flex flex-col px-6 py-8">
        <div className="max-w-md mx-auto w-full space-y-6">
          {/* Title */}
          <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">Mes repas</h1>
            <p className="text-muted-foreground text-sm">Historique de vos repas enregistres</p>
          </div>

          {/* List */}
          {loading ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground text-sm">Chargement...</p>
            </div>
          ) : error ? (
            <div className="py-12 text-center">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          ) : meals.length === 0 ? (
            <div className="py-12 text-center space-y-4">
              <p className="text-muted-foreground text-sm">Aucun repas enregistre</p>
              <Link
                href="/dashboard/manual-meal"
                className="inline-flex items-center justify-center h-10 px-6 bg-primary text-primary-foreground text-sm font-medium rounded-xl transition-opacity hover:opacity-90"
              >
                Ajouter un repas
              </Link>
            </div>
          ) : (
            <ul className="space-y-2">
              {meals.map((meal) => (
                <li
                  key={meal.id}
                  className="p-4 bg-card border border-border rounded-xl cursor-pointer hover:bg-muted transition-colors active:scale-[0.99]"
                  onClick={() => handleShowDetails(meal)}
                >
                  <div className="flex justify-between items-center">
                    <div className="space-y-0.5">
                      <p className="font-medium text-foreground text-sm">
                        {formatTypeRepas(meal.type_repas)}
                      </p>
                      <p className="text-muted-foreground text-xs">{meal.date_repas}</p>
                    </div>
                    <p className="font-semibold text-foreground">{calcTotalKcal(meal.items)} kcal</p>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Back link */}
          <Link
            href="/dashboard"
            className="block text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Retour au menu
          </Link>
        </div>
      </section>

      {/* Popup */}
      {showPopup && selectedMeal && (
        <div
          className="fixed inset-0 bg-foreground/40 flex items-end sm:items-center justify-center z-50 p-4"
          onClick={() => setShowPopup(false)}
        >
          <div
            className="bg-background w-full max-w-md rounded-2xl p-6 space-y-4 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Details du repas</h2>
              <button
                onClick={() => setShowPopup(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Info */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="text-foreground">{selectedMeal.date_repas}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type</span>
                <span className="text-foreground">{formatTypeRepas(selectedMeal.type_repas)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="text-foreground font-semibold">{calcTotalKcal(selectedMeal.items)} kcal</span>
              </div>
              {selectedMeal.notes && (
                <div className="pt-2 border-t border-border">
                  <span className="text-muted-foreground">Notes: </span>
                  <span className="text-foreground">{selectedMeal.notes}</span>
                </div>
              )}
            </div>

            {/* Items */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Aliments</p>
              <ul className="space-y-2">
                {selectedMeal.items.map((item, idx) => {
                  const kcal = Math.round((item.calories_100g * item.quantite_g) / 100);
                  return (
                    <li key={idx} className="flex justify-between text-sm">
                      <span className="text-foreground">{item.aliment_nom}</span>
                      <span className="text-muted-foreground">{item.quantite_g}g - {kcal} kcal</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Delete */}
            <Button
              onClick={() => handleDelete(selectedMeal.id)}
              disabled={deleting}
              variant="destructive"
              className="w-full h-12 rounded-xl"
            >
              {deleting ? "Suppression..." : "Supprimer ce repas"}
            </Button>
            {deleteError && <p className="text-destructive text-sm text-center">{deleteError}</p>}
          </div>
        </div>
      )}
    </main>
  );
}
