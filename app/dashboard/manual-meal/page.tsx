"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Salad,
  ArrowLeft,
  Search,
  Plus,
  X,
  Check,
  PenLine,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface AlimentItem {
  aliment_nom: string;
  quantite_g: number;
  calories_100g: number;
}

interface Aliment {
  nom: string;
  calories_100g: number;
}

export default function ManualMealPage() {
  const [aliments, setAliments] = useState<Aliment[]>([]);
  const [selectedAliment, setSelectedAliment] = useState("");
  const [alimentInput, setAlimentInput] = useState("");
  const [quantite, setQuantite] = useState("");
  const [calories100g, setCalories100g] = useState("");
  const [items, setItems] = useState<AlimentItem[]>([]);
  const [typeRepas, setTypeRepas] = useState("dejeuner");
  const today = new Date().toISOString().slice(0, 10);
  const [dateRepas, setDateRepas] = useState(today);
  const [notes, setNotes] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    fetch("http://localhost:8003/aliments")
      .then((res) => res.json())
      .then((data) => setAliments(data))
      .catch(() => setError("Erreur lors du chargement des aliments"));
  }, []);

  function addItem() {
    if (!selectedAliment || !quantite || !calories100g) return;
    setItems([
      ...items,
      {
        aliment_nom: selectedAliment,
        quantite_g: Number(quantite),
        calories_100g: Number(calories100g),
      },
    ]);
    setSelectedAliment("");
    setAlimentInput("");
    setQuantite("");
    setCalories100g("");
  }

  function removeItem(idx: number) {
    setItems(items.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!dateRepas) {
      setError("Veuillez renseigner la date du repas.");
      return;
    }
    if (!typeRepas) {
      setError("Veuillez selectionner le type de repas.");
      return;
    }
    if (!items.length) {
      setError("Veuillez ajouter au moins un aliment.");
      return;
    }
    setLoading(true);
    try {
      const userId = localStorage.getItem("user_id") || "1";
      const res = await fetch(`http://localhost:8003/users/${userId}/meals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type_repas: typeRepas,
          date_repas: dateRepas,
          notes,
          items,
        }),
      });
      if (!res.ok) throw new Error();
      setSuccess("Repas ajoute !");
      setItems([]);
      setNotes("");
      setDateRepas(today);
    } catch {
      setError("Erreur lors de l'ajout du repas");
    } finally {
      setLoading(false);
    }
  }

  const filteredAliments = aliments
    .filter((a) => a.nom.toLowerCase().includes(alimentInput.toLowerCase()))
    .slice(0, 8);

  const totalKcal = Math.round(
    items.reduce((sum, item) => sum + (item.calories_100g * item.quantite_g) / 100, 0)
  );

  const mealTypes = [
    { value: "petit_dejeuner", label: "Petit-dej" },
    { value: "dejeuner", label: "Dejeuner" },
    { value: "diner", label: "Diner" },
    { value: "collation", label: "Collation" },
  ];

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
        <div className="w-16" />
      </header>

      {/* Content */}
      <section className="flex-1 flex flex-col px-5 py-6 animate-fade-in">
        <div className="max-w-md mx-auto w-full space-y-6">
          {/* Title */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-4">
              <PenLine className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Ajout manuel
            </h1>
            <p className="text-muted-foreground text-sm">
              Composez votre repas aliment par aliment
            </p>
          </div>

          {/* Search aliment */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Rechercher un aliment..."
                value={alimentInput}
                onChange={(e) => {
                  setAlimentInput(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="w-full h-12 pl-11 pr-4 bg-card border border-border rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
                autoComplete="off"
              />
              {showSuggestions && alimentInput && filteredAliments.length > 0 && (
                <ul className="absolute z-20 w-full mt-2 bg-card border border-border rounded-xl shadow-lg max-h-64 overflow-y-auto animate-scale-in">
                  {filteredAliments.map((a, idx) => (
                    <li
                      key={idx}
                      className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-accent transition-colors first:rounded-t-xl last:rounded-b-xl"
                      onMouseDown={() => {
                        setSelectedAliment(a.nom);
                        setCalories100g(String(a.calories_100g));
                        setAlimentInput(a.nom);
                        setShowSuggestions(false);
                      }}
                    >
                      <span className="font-medium text-foreground">{a.nom}</span>
                      <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                        {a.calories_100g} kcal/100g
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                min="1"
                placeholder="Quantite (g)"
                value={quantite}
                onChange={(e) => setQuantite(e.target.value)}
                className="h-12 px-4 bg-card border border-border rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <input
                type="number"
                min="0"
                placeholder="Kcal/100g"
                value={calories100g}
                onChange={(e) => setCalories100g(e.target.value)}
                className="h-12 px-4 bg-card border border-border rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <Button
              type="button"
              onClick={addItem}
              className="w-full h-12 rounded-xl gap-2"
              disabled={!selectedAliment || !quantite || !calories100g}
            >
              <Plus className="w-4 h-4" />
              Ajouter l&apos;aliment
            </Button>
          </div>

          {/* Items list */}
          {items.length > 0 && (
            <div className="p-4 bg-card rounded-2xl border border-border space-y-3 animate-slide-up">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">
                  Aliments ({items.length})
                </p>
                <p className="text-sm font-bold text-primary">{totalKcal} kcal</p>
              </div>
              <ul className="space-y-2">
                {items.map((item, idx) => {
                  const kcal = Math.round((item.calories_100g * item.quantite_g) / 100);
                  return (
                    <li
                      key={idx}
                      className="flex items-center justify-between py-2 border-b border-border last:border-0"
                    >
                      <div>
                        <p className="font-medium text-foreground">{item.aliment_nom}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.quantite_g}g - {kcal} kcal
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Meal details */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Details du repas
            </p>

            {/* Meal type pills */}
            <div className="flex flex-wrap gap-2">
              {mealTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setTypeRepas(type.value)}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
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
              className="w-full h-12 px-4 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />

            <textarea
              placeholder="Notes (optionnel)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-20 p-4 bg-card border border-border rounded-xl text-sm resize-none placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />

            <Button
              type="submit"
              className="w-full h-14 rounded-2xl gap-2 text-base font-semibold"
              disabled={loading || items.length === 0}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Enregistrer le repas
                </>
              )}
            </Button>
          </form>

          {error && (
            <div className="p-4 bg-destructive/10 rounded-xl">
              <p className="text-destructive text-sm text-center">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-4 bg-primary/10 rounded-xl flex items-center justify-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              <p className="text-primary text-sm font-medium">{success}</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
