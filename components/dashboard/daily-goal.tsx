"use client";

import { useState } from "react";
import { Target, Edit2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

const AUTH_API_URL = "http://localhost:8000/auth";

interface DailyGoalProps {
  userId: number;
  initialGoal: number;
  onGoalUpdated?: (newGoal: number) => void;
}

export function DailyGoal({ userId, initialGoal, onGoalUpdated }: DailyGoalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [goal, setGoal] = useState(initialGoal);
  const [tempGoal, setTempGoal] = useState(initialGoal);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (tempGoal < 500 || tempGoal > 10000) {
      toast.error("L'objectif doit être entre 500 et 10000 kcal");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${AUTH_API_URL}/users/${userId}/goal`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kcal_objectif: tempGoal }),
      });

      if (res.ok) {
        setGoal(tempGoal);
        setIsEditing(false);
        toast.success("Objectif mis à jour !");
        if (onGoalUpdated) onGoalUpdated(tempGoal);
      } else {
        toast.error("Erreur lors de la mise à jour");
      }
    } catch (error) {
      toast.error("Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="overflow-hidden border-primary/20 bg-primary/5">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Objectif quotidien</p>
              {isEditing ? (
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    type="number"
                    value={tempGoal}
                    onChange={(e) => setTempGoal(parseInt(e.target.value) || 0)}
                    className="w-24 h-8 text-lg font-bold"
                    min={500}
                    max={10000}
                  />
                  <span className="text-sm font-semibold text-foreground">kcal</span>
                </div>
              ) : (
                <p className="text-xl font-bold text-foreground">
                  {goal} <span className="text-sm font-normal text-muted-foreground">kcal / jour</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            {isEditing ? (
              <>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                  onClick={handleSave}
                  disabled={loading}
                >
                  <Check className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    setTempGoal(goal);
                    setIsEditing(false);
                  }}
                  disabled={loading}
                >
                  <X className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
