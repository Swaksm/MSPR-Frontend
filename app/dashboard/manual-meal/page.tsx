"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
    .slice(0, 10);

  return (
    <main className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <Link href="/dashboard" className="text-lg font-semibold tracking-tight text-foreground">
          Jarmy
        </Link>
      </header>

      {/* Content */}
      <section className="flex-1 flex flex-col px-6 py-8">
        <div className="max-w-md mx-auto w-full space-y-6">
          {/* Title */}
          <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Ajouter manuellement
            </h1>
            <p className="text-muted-foreground text-sm">
              Composez votre repas aliment par aliment
            </p>
          </div>

          {/* Add aliment */}
          <div className="space-y-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher un aliment"
                value={alimentInput}
                onChange={(e) => {
                  setAlimentInput(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="w-full h-12 px-4 bg-background border border-border rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                autoComplete="off"
              />
              {showSuggestions && alimentInput && filteredAliments.length > 0 && (
                <ul className="absolute z-10 w-full mt-1 bg-card border border-border rounded-xl shadow-lg max-h-48 overflow-y-auto">
                  {filteredAliments.map((a, idx) => (
                    <li
                      key={idx}
                      className="px-4 py-3 text-sm cursor-pointer hover:bg-muted transition-colors first:rounded-t-xl last:rounded-b-xl"
                      onMouseDown={() => {
                        setSelectedAliment(a.nom);
                        setCalories100g(String(a.calories_100g));
                        setAlimentInput(a.nom);
                        setShowSuggestions(false);
                      }}
                    >
                      <span className="text-foreground">{a.nom}</span>
                      <span className="text-muted-foreground ml-2">{a.calories_100g} kcal/100g</span>
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
                className="h-12 px-4 bg-background border border-border rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <input
                type="number"
                min="0"
                placeholder="Kcal/100g"
                value={calories100g}
                onChange={(e) => setCalories100g(e.target.value)}
                className="h-12 px-4 bg-background border border-border rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <Button
              type="button"
              onClick={addItem}
              className="w-full h-12 rounded-xl"
              disabled={!selectedAliment || !quantite || !calories100g}
            >
              Ajouter l&apos;aliment
            </Button>
          </div>

          {/* Items list */}
          {items.length > 0 && (
            <div className="p-4 bg-secondary rounded-xl border border-border space-y-2">
              <p className="text-sm font-medium text-foreground mb-2">Aliments ajoutes</p>
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span className="text-foreground">
                    {item.aliment_nom} - {item.quantite_g}g
                  </span>
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Meal details */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <select
                value={typeRepas}
                onChange={(e) => setTypeRepas(e.target.value)}
                className="h-12 px-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="petit_dejeuner">Petit-dejeuner</option>
                <option value="dejeuner">Dejeuner</option>
                <option value="diner">Diner</option>
                <option value="collation">Collation</option>
              </select>
              <input
                type="date"
                value={dateRepas}
                onChange={(e) => setDateRepas(e.target.value)}
                className="h-12 px-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <textarea
              placeholder="Notes (optionnel)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-20 p-4 bg-background border border-border rounded-xl text-sm resize-none placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <Button
              type="submit"
              className="w-full h-12 rounded-xl"
              disabled={loading || items.length === 0}
            >
              {loading ? "Ajout en cours..." : "Enregistrer le repas"}
            </Button>
          </form>

          {error && <p className="text-destructive text-sm text-center">{error}</p>}
          {success && <p className="text-foreground text-sm text-center font-medium">{success}</p>}

          {/* Back link */}
          <Link
            href="/dashboard"
            className="block text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Retour au menu
          </Link>
        </div>
      </section>
    </main>
  );
}
