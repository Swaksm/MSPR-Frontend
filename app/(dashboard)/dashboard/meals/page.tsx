"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { getUserMeals, deleteMeal, type Meal } from "@/lib/api"
import { Calendar, Trash2, Flame, Plus } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

export default function MealsPage() {
  const [meals, setMeals] = useState<Meal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    const fetchMeals = async () => {
      const userId = localStorage.getItem("user_id")
      if (!userId) {
        setError("Utilisateur non connecte")
        setIsLoading(false)
        return
      }

      try {
        const data = await getUserMeals(userId)
        setMeals(data)
      } catch {
        setError("Impossible de charger les repas")
      } finally {
        setIsLoading(false)
      }
    }

    fetchMeals()
  }, [])

  const handleDelete = async (mealId: number) => {
    try {
      await deleteMeal(mealId)
      setMeals(meals.filter((m) => m.id !== mealId))
      toast({
        title: "Repas supprime",
        description: "Le repas a ete supprime avec succes",
      })
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le repas",
        variant: "destructive",
      })
    }
  }

  const getMealTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      "petit-dejeuner": "Petit-dejeuner",
      dejeuner: "Dejeuner",
      diner: "Diner",
      collation: "Collation",
    }
    return types[type] || type
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="w-8 h-8 text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-4 py-6">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Mes repas</h1>
          <p className="text-muted-foreground">
            Historique de vos repas enregistres
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/dashboard/add-meal">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter
          </Link>
        </Button>
      </div>

      {meals.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              Aucun repas enregistre
            </p>
            <Button asChild>
              <Link href="/dashboard/add-meal">Ajouter votre premier repas</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {meals.map((meal) => (
            <Card key={meal.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>{getMealTypeLabel(meal.type_repas)}</span>
                  <span className="flex items-center gap-1 text-primary font-semibold">
                    <Flame className="w-4 h-4" />
                    {meal.total_calories} kcal
                  </span>
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(meal.date_repas), "EEEE d MMMM yyyy", {
                    locale: fr,
                  })}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {meal.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-foreground capitalize">
                      {item.aliment_nom}
                    </span>
                    <span className="text-muted-foreground">
                      {item.quantite_g}g - {item.calories_calculees} kcal
                    </span>
                  </div>
                ))}
                <div className="flex justify-end pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(meal.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
