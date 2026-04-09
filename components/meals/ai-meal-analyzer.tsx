"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import { analyzeText, type AnalyzedFood } from "@/lib/api"
import { Sparkles, Check, AlertCircle, Flame } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function AiMealAnalyzer() {
  const [text, setText] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analyzedItems, setAnalyzedItems] = useState<AnalyzedFood[]>([])
  const [totalKcal, setTotalKcal] = useState(0)
  const [error, setError] = useState("")
  const [isSaved, setIsSaved] = useState(false)
  const { toast } = useToast()

  const handleAnalyze = async () => {
    if (!text.trim()) return

    setIsAnalyzing(true)
    setError("")
    setAnalyzedItems([])
    setIsSaved(false)

    try {
      const result = await analyzeText(text)
      setAnalyzedItems(result.items)
      setTotalKcal(result.total_kcal)
    } catch {
      setError("Erreur lors de l'analyse. Verifiez votre connexion.")
    } finally {
      setIsAnalyzing(false)
    }
  }

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

    // For now, just mark as saved (API integration would go here)
    setIsSaved(true)
    toast({
      title: "Repas enregistre",
      description: `${totalKcal} kcal ajoutes a votre journal`,
    })
  }

  const handleReset = () => {
    setText("")
    setAnalyzedItems([])
    setTotalKcal(0)
    setError("")
    setIsSaved(false)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Decrivez votre repas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Ex: J'ai mange un poulet grille, 200g de riz, 2 tomates et un yaourt nature"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            className="resize-none"
            disabled={analyzedItems.length > 0}
          />
          <p className="text-xs text-muted-foreground">
            Decrivez ce que vous avez mange avec les quantites si possible
          </p>

          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {analyzedItems.length === 0 && (
            <Button
              onClick={handleAnalyze}
              disabled={!text.trim() || isAnalyzing}
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <Spinner className="w-4 h-4 mr-2" />
                  Analyse en cours...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Analyser mon repas
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {analyzedItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                Resultat de l&apos;analyse
              </span>
              <span className="flex items-center gap-1 text-primary">
                <Flame className="w-4 h-4" />
                {totalKcal} kcal
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {analyzedItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-3 px-4 bg-muted/50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-foreground capitalize">
                      {item.food}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {item.grams}g
                    </p>
                  </div>
                  <span className="font-semibold text-foreground">
                    {item.kcal} kcal
                  </span>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleReset}
                className="flex-1"
              >
                Nouvelle analyse
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaved}
                className="flex-1"
              >
                {isSaved ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Enregistre
                  </>
                ) : (
                  "Enregistrer"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
