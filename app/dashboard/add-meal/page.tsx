"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function AddAnalyzedMealForm({
  analyzedItems,
  onClose,
}: {
  analyzedItems: { food: string; grams: number; kcal: number }[];
  onClose: () => void;
}) {
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
    if (!dateRepas) {
      setError("Veuillez renseigner la date du repas.");
      return;
    }
    setLoading(true);
    try {
      const userId = localStorage.getItem("user_id") || "1";
      const items = analyzedItems.map((item) => ({
        aliment_nom: item.food,
        quantite_g: item.grams,
        calories_100g:
          item.kcal && item.grams
            ? Math.round((item.kcal / item.grams) * 100)
            : 0,
      }));
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
      setTimeout(() => {
        setSuccess("");
        onClose();
      }, 1200);
    } catch {
      setError("Erreur lors de l'ajout du repas");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 space-y-4 bg-secondary p-4 rounded-xl border border-border">
      <div className="grid grid-cols-2 gap-3">
        <select
          value={typeRepas}
          onChange={(e) => setTypeRepas(e.target.value)}
          className="h-12 px-3 bg-background border border-border rounded-xl text-sm"
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
          className="h-12 px-3 bg-background border border-border rounded-xl text-sm"
        />
      </div>
      <textarea
        placeholder="Notes (optionnel)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="w-full h-20 p-3 bg-background border border-border rounded-xl text-sm resize-none"
      />
      <div className="flex gap-3">
        <Button
          type="button"
          className="flex-1 h-12 rounded-xl"
          disabled={loading}
          onClick={handleAdd}
        >
          {loading ? "Ajout..." : "Valider"}
        </Button>
        <Button
          type="button"
          className="flex-1 h-12 rounded-xl"
          variant="secondary"
          onClick={onClose}
        >
          Annuler
        </Button>
      </div>
      {error && <p className="text-destructive text-sm text-center">{error}</p>}
      {success && <p className="text-foreground text-sm text-center">{success}</p>}
    </div>
  );
}

function AddMealResult({
  result,
}: {
  result: { total_kcal: number; message: string; items: { food: string; grams: number; kcal: number }[] };
}) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="mt-6 space-y-4">
      <div className="p-4 bg-secondary rounded-xl border border-border space-y-3">
        <p className="font-medium text-foreground">{result.message || "Analyse terminee"}</p>
        {typeof result.total_kcal !== "undefined" && (
          <p className="text-2xl font-semibold text-foreground">
            {result.total_kcal} <span className="text-sm font-normal text-muted-foreground">kcal</span>
          </p>
        )}
        {Array.isArray(result.items) && result.items.length > 0 ? (
          <ul className="space-y-2">
            {result.items.map((item, idx) => (
              <li key={idx} className="flex justify-between text-sm">
                <span className="text-foreground">{item.food}</span>
                <span className="text-muted-foreground">{item.grams}g - {item.kcal} kcal</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm">Aucun aliment trouve.</p>
        )}
      </div>

      {!showForm && Array.isArray(result.items) && result.items.length > 0 && (
        <Button
          type="button"
          className="w-full h-12 rounded-xl"
          onClick={() => setShowForm(true)}
        >
          Ajouter ce repas
        </Button>
      )}

      {showForm && (
        <AddAnalyzedMealForm
          analyzedItems={result.items}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}

export default function AddMealPage() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<null | {
    total_kcal: number;
    message: string;
    items: { food: string; grams: number; kcal: number }[];
  }>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAnalyze(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_JARMY_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/kcal/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer clesecrete",
        },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error("Erreur lors de l'analyse du repas");
      const data = await res.json();
      setResult(data);
    } catch {
      setError("Erreur lors de l'analyse du repas");
    } finally {
      setLoading(false);
    }
  }

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
              Analyser un repas
            </h1>
            <p className="text-muted-foreground text-sm">
              Decrivez votre repas pour obtenir une estimation calorique
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleAnalyze} className="space-y-4">
            <textarea
              className="w-full h-32 p-4 bg-background border border-border rounded-xl text-sm resize-none placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Ex: 200g de riz, 150g de poulet grille, salade verte..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
            />
            <Button type="submit" className="w-full h-12 rounded-xl" disabled={loading}>
              {loading ? "Analyse en cours..." : "Analyser"}
            </Button>
          </form>

          {error && <p className="text-destructive text-sm text-center">{error}</p>}
          {result && <AddMealResult result={result} />}

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
