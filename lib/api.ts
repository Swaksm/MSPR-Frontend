const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8004"
const JARMY_API_URL = process.env.NEXT_PUBLIC_JARMY_API_URL || "http://localhost:8000"

// Types
export interface Aliment {
  id: number
  nom: string
  calories_100g: number
  categorie: string
  source_dataset: string
  created_at: string
}

export interface MealItem {
  id: number
  aliment_id: number
  aliment_nom: string
  quantite_g: number
  calories_calculees: number
  calories_100g: number
  categorie: string
  source_dataset: string
}

export interface Meal {
  id: number
  utilisateur_id: number
  date_repas: string
  type_repas: string
  notes: string
  created_at: string
  total_calories: number
  items: MealItem[]
}

export interface AnalyzedFood {
  food: string
  grams: number
  kcal: number
}

export interface AnalyzeResponse {
  total_kcal: number
  message: string
  items: AnalyzedFood[]
}

// API Functions
export async function searchAliments(query: string): Promise<Aliment[]> {
  const response = await fetch(`${API_BASE_URL}/aliments?query=${encodeURIComponent(query)}`)
  if (!response.ok) throw new Error("Erreur lors de la recherche d'aliments")
  return response.json()
}

export async function analyzeText(text: string): Promise<AnalyzeResponse> {
  const response = await fetch(`${JARMY_API_URL}/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  })
  if (!response.ok) throw new Error("Erreur lors de l'analyse du texte")
  return response.json()
}

export async function getUserMeals(userId: string): Promise<Meal[]> {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/meals`)
  if (!response.ok) throw new Error("Erreur lors de la récupération des repas")
  return response.json()
}

export async function createMeal(
  userId: string,
  data: {
    date_repas: string
    type_repas: string
    notes?: string
    items: { aliment_id: number; quantite_g: number }[]
  }
): Promise<Meal> {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/meals`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error("Erreur lors de la création du repas")
  return response.json()
}

export async function deleteMeal(mealId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/meals/${mealId}`, {
    method: "DELETE",
  })
  if (!response.ok) throw new Error("Erreur lors de la suppression du repas")
}
