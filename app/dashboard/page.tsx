"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Salad,
  Camera,
  PenLine,
  History,
  LogOut,
  ChevronRight,
  Flame,
  TrendingUp,
  Target,
} from "lucide-react";
import { DailyGoal } from "@/components/dashboard/daily-goal";

export default function Dashboard() {
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [meals, setMeals] = useState([]);
  const [kcalGoal, setKcalGoal] = useState(2000);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const storedUserId = localStorage.getItem("user_id");
    if (!storedUserId) {
      router.replace("/login");
      return;
    }
    const id = parseInt(storedUserId);
    setUserId(id);
    const name = localStorage.getItem("user_name") || "Utilisateur";
    setUserName(name.split(" ")[0]);

    // Fetch user data for goal
    fetch(`http://localhost:8000/auth/users/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.kcal_objectif) setKcalGoal(data.kcal_objectif);
      })
      .catch(err => console.error("Error fetching user goal", err));

    // Fetch meals for stats
    setLoading(true);
    fetch(`http://localhost:8000/meal/users/${id}/meals`)
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : (data.meals ?? data.items ?? []);
        setMeals(list);
      })
      .catch(() => setMeals([]))
      .finally(() => setLoading(false));
  }, [router]);

  if (!mounted) return null;

  function handleLogout() {
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_name");
    router.replace("/login");
  }

  // Calculs
  function calcTotalKcal(meals: Array<{ items: Array<{ calories_calculees: number; quantite_g: number }> }>): number {
    if (!Array.isArray(meals)) return 0;
    return meals.reduce((sum: number, meal) => {
      if (!Array.isArray(meal.items)) return sum;
      return (
        sum + meal.items.reduce((s: number, item: { calories_calculees: number; quantite_g: number }) => s + Number(item.calories_calculees), 0)
      );
    }, 0);
  }
  const totalCalories = Math.round(calcTotalKcal(meals));
  const totalRepas = meals.length;

  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12 ? "Bonjour" : currentHour < 18 ? "Bon après-midi" : "Bonsoir";

  return (
    <main className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4 bg-card/80 backdrop-blur-sm sticky top-0 z-10 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
            <Salad className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-foreground">Jarmy</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Déconnexion</span>
        </button>
      </header>

      {/* Content */}
      <section className="flex-1 flex flex-col px-5 py-6 animate-fade-in">
        <div className="max-w-md mx-auto w-full space-y-6">
          {/* Greeting */}
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{greeting}</p>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {userName} !
            </h1>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-3">
            <StatCard
              icon={<Flame className="w-4 h-4" />}
              value={loading ? "..." : totalCalories.toString()}
              label="Calories"
              color="primary"
            />
            <StatCard
              icon={<TrendingUp className="w-4 h-4" />}
              value={loading ? "..." : totalRepas.toString()}
              label="Repas"
              color="success"
            />
            <StatCard
              icon={<Target className="w-4 h-4" />}
              value={loading ? "..." : kcalGoal.toString()}
              label="Objectif"
              color="warning"
            />
          </div>

          {/* Goal Management */}
          {userId && (
            <DailyGoal 
              userId={userId} 
              initialGoal={kcalGoal} 
              onGoalUpdated={(newGoal) => setKcalGoal(newGoal)}
            />
          )}

          {/* Quick Actions */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Actions rapides
            </h2>
            <nav className="space-y-2">
              <ActionCard
                href="/dashboard/add-meal"
                icon={<Camera className="w-5 h-5" />}
                title="Analyser un repas"
                description="Utilisez l'IA pour estimer les calories"
                primary
              />
              <ActionCard
                href="/dashboard/manual-meal"
                icon={<PenLine className="w-5 h-5" />}
                title="Ajouter manuellement"
                description="Composez votre repas aliment par aliment"
              />
              <ActionCard
                href="/dashboard/meals"
                icon={<History className="w-5 h-5" />}
                title="Historique"
                description="Consultez vos repas enregistrés"
              />
            </nav>
          </div>

          {/* Tip */}
          <div className="p-4 bg-accent rounded-2xl border border-border">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Salad className="w-4 h-4 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Conseil du jour</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Pensez à boire au moins 2 litres d&apos;eau par jour pour maintenir une bonne hydratation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Nav */}
      <nav className="flex items-center justify-around px-5 py-3 bg-card border-t border-border">
        <NavItem href="/dashboard" icon={<Salad className="w-5 h-5" />} label="Accueil" active />
        <NavItem href="/dashboard/add-meal" icon={<Camera className="w-5 h-5" />} label="Analyser" />
        <NavItem href="/dashboard/meals" icon={<History className="w-5 h-5" />} label="Historique" />
      </nav>
    </main>
  );
}

function StatCard({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  color: "primary" | "success" | "warning";
}) {
  const colors = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
  };

  return (
    <div className="p-3 bg-card rounded-2xl border border-border">
      <div className={`w-8 h-8 rounded-xl ${colors[color]} flex items-center justify-center mb-2`}>
        {icon}
      </div>
      <p className="text-xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function ActionCard({
  href,
  icon,
  title,
  description,
  primary = false,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group flex items-center gap-4 p-4 rounded-2xl transition-all active:scale-[0.99] ${
        primary
          ? "bg-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/25"
          : "bg-card border border-border hover:border-primary/30 hover:shadow-sm"
      }`}
    >
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
          primary ? "bg-primary-foreground/20" : "bg-accent"
        }`}
      >
        <span className={primary ? "text-primary-foreground" : "text-primary"}>{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className={`font-semibold ${primary ? "" : "text-foreground"}`}>{title}</h3>
        <p className={`text-sm ${primary ? "opacity-80" : "text-muted-foreground"}`}>
          {description}
        </p>
      </div>
      <ChevronRight
        className={`w-5 h-5 shrink-0 transition-transform group-hover:translate-x-0.5 ${
          primary ? "opacity-80" : "text-muted-foreground"
        }`}
      />
    </Link>
  );
}

function NavItem({
  href,
  icon,
  label,
  active = false,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-colors ${
        active ? "text-primary" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </Link>
  );
}
