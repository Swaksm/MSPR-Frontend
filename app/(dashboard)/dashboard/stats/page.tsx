"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Flame, Target, TrendingUp } from "lucide-react"

export default function StatsPage() {
  return (
    <div className="px-4 py-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Statistiques</h1>
        <p className="text-muted-foreground">
          Suivez votre progression nutritionnelle
        </p>
      </div>

      {/* Weekly Summary */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Flame className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">0</p>
                <p className="text-xs text-muted-foreground">kcal cette semaine</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-accent/5 border-accent/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">0</p>
                <p className="text-xs text-muted-foreground">repas enregistres</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            Calories par jour
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center bg-muted/50 rounded-lg">
            <p className="text-muted-foreground text-sm">
              Les statistiques s&apos;afficheront ici
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Tendances
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Moyenne quotidienne</span>
            <span className="font-semibold text-foreground">0 kcal</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Objectif atteint</span>
            <span className="font-semibold text-foreground">0 jours</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-muted-foreground">Serie en cours</span>
            <span className="font-semibold text-foreground">0 jours</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
