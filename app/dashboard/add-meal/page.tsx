"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

// --- Formulaire pour ajouter le repas analysé ---
function AddAnalyzedMealForm({
  analyzedItems,
  onClose,
}: {
  analyzedItems: { food: string; grams: number; kcal: number }[];
  onClose: () => void;
}) {
  const [typeRepas, setTypeRepas] = useState("dejeuner");
  const [dateRepas, setDateRepas] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  async function handleAdd(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
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
      setSuccess("Repas ajouté !");
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
    <div className="mt-6 space-y-3 bg-gray-50 p-4 rounded">
      <div className="flex gap-2">
        <select
          value={typeRepas}
          onChange={(e) => setTypeRepas(e.target.value)}
          className="flex-1 p-2 border rounded"
        >
          <option value="dejeuner">Déjeuner</option>
          <option value="diner">Dîner</option>
          <option value="petit-dejeuner">Petit-déjeuner</option>
          <option value="collation">Collation</option>
        </select>
        <input
          type="date"
          value={dateRepas}
          onChange={(e) => setDateRepas(e.target.value)}
          className="flex-1 p-2 border rounded"
          required
        />
      </div>
      <textarea
        placeholder="Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="w-full p-2 border rounded"
      />
      <div className="flex gap-2">
        <Button type="button" className="flex-1" disabled={loading} onClick={handleAdd}>
          {loading ? "Ajout..." : "Valider"}
        </Button>
        <Button
          type="button"
          className="flex-1"
          variant="secondary"
          onClick={onClose}
        >
          Annuler
        </Button>
      </div>
      {error && <div className="text-red-500 text-center">{error}</div>}
      {success && <div className="text-green-600 text-center">{success}</div>}
    </div>
  );
}

// --- Composant pour afficher le résultat de l'analyse ---
function AddMealResult({
  result,
}: {
  result: { total_kcal: number; message: string; items: any[] };
}) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="mt-4 text-center">
      <div className="font-semibold">{result.message || "Réponse reçue"}</div>
      {typeof result.total_kcal !== "undefined" && (
        <div className="text-lg">
          Total kcal :{" "}
          <span className="font-bold">{result.total_kcal}</span>
        </div>
      )}
      {Array.isArray(result.items) && result.items.length > 0 ? (
        <ul className="mt-2">
          {result.items.map((item, idx) => (
            <li key={idx}>
              {item.food} : {item.grams}g, {item.kcal} kcal
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-muted-foreground mt-2">Aucun aliment trouvé.</div>
      )}
      {!showForm && Array.isArray(result.items) && result.items.length > 0 && (
        <Button className="mt-4" onClick={() => setShowForm(true)}>
          Ajouter ce repas à mon journal
        </Button>
      )}
      {showForm && (
        <AddAnalyzedMealForm
          analyzedItems={result.items}
          onClose={() => setShowForm(false)}
        />
      )}
      {!Array.isArray(result.items) && (
        <pre className="mt-4 text-xs bg-gray-100 p-2 rounded text-left">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}

// --- Page principale ---
export default function AddMealPage() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<null | {
    total_kcal: number;
    message: string;
    items: any[];
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
    } catch (err) {
      setError("Erreur lors de l'analyse du repas");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
      <form
        onSubmit={handleAnalyze}
        className="space-y-6 w-full max-w-md bg-white/80 p-8 rounded-xl shadow"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">
          Analyser un repas
        </h2>
        <textarea
          className="w-full h-24 p-2 border rounded"
          placeholder="Décris ton repas en anglais..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Analyse..." : "Analyser"}
        </Button>
        {error && <div className="text-red-500 text-center">{error}</div>}
        {result && <AddMealResult result={result} />}
        <a
          href="/dashboard"
          className="block mt-4 text-center text-primary underline"
        >
          Retour au menu
        </a>
      </form>
    </main>
  );
}
