"use client"

import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Flame, Target, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const { user } = useAuth()

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Bonjour"
    if (hour < 18) return "Bon apres-midi"
    return "Bonsoir"
  }

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Greeting */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">
          {greeting()}, {user?.prenom || "Coach"}
        </h1>
        <p className="text-muted-foreground">
          Suivez votre alimentation et atteignez vos objectifs
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Flame className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">0</p>
                <p className="text-xs text-muted-foreground">kcal aujourd&apos;hui</p>
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
                <p className="text-2xl font-bold text-foreground">2000</p>
                <p className="text-xs text-muted-foreground">objectif kcal</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Progression du jour
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-3 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: "0%" }}
              />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              0 / 2000 kcal (0%)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Actions rapides</h2>
        <div className="grid grid-cols-1 gap-3">
          <Link href="/dashboard/add-meal">
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                  <Plus className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">Ajouter un repas</h3>
                  <p className="text-sm text-muted-foreground">
                    Decrivez votre repas ou ajoutez des aliments
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Recent Meals Placeholder */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Repas recents</h2>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              Aucun repas enregistre aujourd&apos;hui
            </p>
            <Button asChild className="mt-4">
              <Link href="/dashboard/add-meal">Ajouter votre premier repas</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
