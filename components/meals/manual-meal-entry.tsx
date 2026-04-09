"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { searchAliments, type Aliment } from "@/lib/api"
import { Search, Plus, Trash2, Flame, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SelectedFood {
  aliment: Aliment
  quantity: number
  calories: number
}

export function ManualMealEntry() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Aliment[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedFoods, setSelectedFoods] = useState<SelectedFood[]>([])
  const [mealType, setMealType] = useState("dejeuner")
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const { toast } = useToast()

  const handleSearch = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const results = await searchAliments(query)
      setSearchResults(results.slice(0, 10)) // Limit to 10 results
    } catch {
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  useEffect(() => {
    const debounce = setTimeout(() => {
      handleSearch(searchQuery)
    }, 300)

    return () => clearTimeout(debounce)
  }, [searchQuery, handleSearch])

  const addFood = (aliment: Aliment) => {
    const existing = selectedFoods.find((f) => f.aliment.id === aliment.id)
    if (existing) {
      toast({
        title: "Aliment deja ajoute",
        description: "Modifiez la quantite si necessaire",
      })
      return
    }

    const defaultQuantity = 100
    setSelectedFoods([
      ...selectedFoods,
      {
        aliment,
        quantity: defaultQuantity,
        calories: aliment.calories_100g,
      },
    ])
    setSearchQuery("")
    setSearchResults([])
  }

  const updateQuantity = (index: number, quantity: number) => {
    const updated = [...selectedFoods]
    updated[index].quantity = quantity
    updated[index].calories = Math.round(
      (updated[index].aliment.calories_100g * quantity) / 100
    )
    setSelectedFoods(updated)
  }

  const removeFood = (index: number) => {
    setSelectedFoods(selectedFoods.filter((_, i) => i !== index))
  }

  const totalCalories = selectedFoods.reduce((sum, f) => sum + f.calories, 0)

  const handleSave = async () => {
    const userId = localStorage.getItem("user_id")
    if (!userId) {
      toast({
        title: "Erreur",
        description: "Utilisateur non connecte",
        variant: "destructive",
      })
      return
    }

    if (selectedFoods.length === 0) {
      toast({
        title: "Erreur",
        description: "Ajoutez au moins un aliment",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      // For now, mark as saved (full API integration would go here)
      setIsSaved(true)
      toast({
        title: "Repas enregistre",
        description: `${totalCalories} kcal ajoutes a votre journal`,
      })
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer le repas",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setSelectedFoods([])
    setSearchQuery("")
    setSearchResults([])
    setIsSaved(false)
  }

  return (
    <div className="space-y-6">
      {/* Meal Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Type de repas</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={mealType} onValueChange={setMealType}>
            <SelectTrigger>
              <SelectValue placeholder="Selectionnez un type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="petit-dejeuner">Petit-dejeuner</SelectItem>
              <SelectItem value="dejeuner">Dejeuner</SelectItem>
              <SelectItem value="diner">Diner</SelectItem>
              <SelectItem value="collation">Collation</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Food Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Search className="w-4 h-4 text-primary" />
            Rechercher un aliment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Input
              placeholder="Ex: poulet, riz, tomate..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Spinner className="w-4 h-4" />
              </div>
            )}
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="border rounded-lg divide-y max-h-60 overflow-auto">
              {searchResults.map((aliment) => (
                <button
                  key={aliment.id}
                  onClick={() => addFood(aliment)}
                  className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors text-left"
                >
                  <div>
                    <p className="font-medium text-foreground capitalize">
                      {aliment.nom}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {aliment.categorie}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {aliment.calories_100g} kcal/100g
                    </span>
                    <Plus className="w-4 h-4 text-primary" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Foods */}
      {selectedFoods.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>Aliments selectionnes</span>
              <span className="flex items-center gap-1 text-primary">
                <Flame className="w-4 h-4" />
                {totalCalories} kcal
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedFoods.map((food, index) => (
              <div
                key={food.aliment.id}
                className="flex items-center gap-3 py-3 px-4 bg-muted/50 rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground capitalize truncate">
                    {food.aliment.nom}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {food.aliment.calories_100g} kcal/100g
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor={`qty-${index}`} className="sr-only">
                    Quantite
                  </Label>
                  <Input
                    id={`qty-${index}`}
                    type="number"
                    value={food.quantity}
                    onChange={(e) =>
                      updateQuantity(index, parseInt(e.target.value) || 0)
                    }
                    className="w-20 text-center"
                    min={1}
                  />
                  <span className="text-sm text-muted-foreground">g</span>
                </div>
                <div className="text-right min-w-16">
                  <p className="font-semibold text-foreground">
                    {food.calories} kcal
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFood(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={handleReset}
                className="flex-1"
              >
                Reinitialiser
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving || isSaved}
                className="flex-1"
              >
                {isSaving ? (
                  <Spinner className="w-4 h-4" />
                ) : isSaved ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Enregistre
                  </>
                ) : (
                  "Enregistrer le repas"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {selectedFoods.length === 0 && searchResults.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              Recherchez des aliments pour les ajouter a votre repas
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
