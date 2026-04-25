"use client";

import { useState, useEffect } from "react";
import { Target, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const AUTH_API_URL = "http://localhost:8000/auth";

interface DailyGoalProps {
  userId: number;
  initialGoal: number;
  onGoalUpdated?: (newGoal: number) => void;
  children: React.ReactNode;
}

export function DailyGoal({ userId, initialGoal, onGoalUpdated, children }: DailyGoalProps) {
  const [open, setOpen] = useState(false);
  const [tempGoal, setTempGoal] = useState(initialGoal);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTempGoal(initialGoal);
  }, [initialGoal, open]);

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
        toast.success("Objectif mis à jour !");
        if (onGoalUpdated) onGoalUpdated(tempGoal);
        setOpen(false);
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="cursor-pointer transition-transform active:scale-95">
          {children}
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Target className="w-4 h-4" />
            </div>
            <DialogTitle>Objectif quotidien</DialogTitle>
          </div>
          <DialogDescription>
            Définissez votre cible de calories journalière pour adapter votre suivi nutritionnel.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 space-y-2">
              <label htmlFor="goal" className="text-sm font-medium leading-none">
                Calories (kcal)
              </label>
              <Input
                id="goal"
                type="number"
                value={tempGoal}
                onChange={(e) => setTempGoal(parseInt(e.target.value) || 0)}
                className="col-span-3 text-lg font-bold"
                min={500}
                max={10000}
              />
            </div>
          </div>
        </div>
        <DialogFooter className="flex flex-row gap-2 sm:justify-end">
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={loading}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={loading} className="gap-2">
            {loading ? "Mise à jour..." : "Enregistrer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
