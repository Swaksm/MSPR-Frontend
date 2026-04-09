"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AiMealAnalyzer } from "@/components/meals/ai-meal-analyzer"
import { ManualMealEntry } from "@/components/meals/manual-meal-entry"
import { MessageSquare, List } from "lucide-react"

export default function AddMealPage() {
  const [activeTab, setActiveTab] = useState("ai")

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Ajouter un repas</h1>
        <p className="text-muted-foreground">
          Decrivez votre repas ou ajoutez des aliments manuellement
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Par description
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <List className="w-4 h-4" />
            Manuel
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai" className="mt-6">
          <AiMealAnalyzer />
        </TabsContent>

        <TabsContent value="manual" className="mt-6">
          <ManualMealEntry />
        </TabsContent>
      </Tabs>
    </div>
  )
}
