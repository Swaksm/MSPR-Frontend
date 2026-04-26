"use client";

import { useState, useEffect } from "react";
import { Salad, Users, Utensils, Trash2, LogOut, ChevronRight, ChevronDown, Calendar, Ruler, Weight, BadgeInfo, Database } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const AUTH_API_URL = "http://localhost:8000/auth";
const MEAL_API_URL = "http://localhost:8000/meal";

interface Meal {
  id: number;
  date_repas: string;
  type_repas: string;
  total_calories: number;
  notes?: string;
}

interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  sexe: string;
  abonnement: string;
  date_inscription: string;
  date_naissance?: string;
  poids_initial_kg?: number;
  taille_cm?: number;
  actif: boolean;
  meals?: Meal[];
}

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedUser, setExpandedUser] = useState<number | null>(null);

  useEffect(() => {
    if (isLoggedIn) {
      fetchUsers();
    }
  }, [isLoggedIn]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "admin" && password === "admin") {
      setIsLoggedIn(true);
      toast.success("Connexion réussie");
    } else {
      toast.error("Identifiants incorrects");
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${AUTH_API_URL}/users`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        toast.error("Erreur lors de la récupération des utilisateurs");
      }
    } catch (error) {
      toast.error("Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserMeals = async (userId: number) => {
    try {
      const res = await fetch(`${MEAL_API_URL}/users/${userId}/meals`);
      if (res.ok) {
        const meals = await res.json();
        setUsers(users.map(u => u.id === userId ? { ...u, meals } : u));
      }
    } catch (error) {
      toast.error("Erreur lors de la récupération des repas");
    }
  };

  const toggleUserExpanded = (userId: number) => {
    if (expandedUser === userId) {
      setExpandedUser(null);
    } else {
      setExpandedUser(userId);
      const user = users.find(u => u.id === userId);
      if (user && !user.meals) {
        fetchUserMeals(userId);
      }
    }
  };

  const deleteUser = async (userId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur et tous ses repas ?")) return;
    
    try {
      const res = await fetch(`${AUTH_API_URL}/users/${userId}`, { method: "DELETE" });
      if (res.ok) {
        setUsers(users.filter(u => u.id !== userId));
        toast.success("Utilisateur supprimé");
      } else {
        toast.error("Erreur lors de la suppression");
      }
    } catch (error) {
      toast.error("Erreur réseau");
    }
  };

  const deleteMeal = async (userId: number, mealId: number) => {
    if (!confirm("Supprimer ce repas ?")) return;
    
    try {
      const res = await fetch(`${MEAL_API_URL}/meals/${mealId}`, { method: "DELETE" });
      if (res.ok) {
        setUsers(users.map(u => {
          if (u.id === userId && u.meals) {
            return { ...u, meals: u.meals.filter(m => m.id !== mealId) };
          }
          return u;
        }));
        toast.success("Repas supprimé");
      } else {
        toast.error("Erreur lors de la suppression");
      }
    } catch (error) {
      toast.error("Erreur réseau");
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
        <Link 
          href="/login" 
          className="absolute top-8 left-8 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          <span className="text-sm font-medium">Retour à la connexion</span>
        </Link>
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center">
                <Salad className="w-6 h-6 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl">Administration Jarmy</CardTitle>
            <CardDescription>Connectez-vous pour gérer le système</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="Nom d'utilisateur"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
              <Button type="submit" className="w-full">Connexion</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      <header className="flex items-center justify-between px-6 py-4 bg-card border-b sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Salad className="w-5 h-5 text-primary" />
          <span className="font-semibold text-lg">Admin Dashboard</span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild className="gap-2 border-primary/20 hover:bg-primary/5 text-primary">
            <a href="http://localhost:8080" target="_blank" rel="noopener noreferrer">
              <Database className="w-4 h-4" />
              Base de données
            </a>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setIsLoggedIn(false)} className="gap-2 text-muted-foreground">
            <LogOut className="w-4 h-4" />
            Déconnexion
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 pt-8">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Utilisateurs</h1>
            <p className="text-muted-foreground">Gérez les utilisateurs et leurs journaux de repas</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-accent rounded-full text-xs font-medium">
            <Users className="w-3.5 h-3.5 text-primary" />
            <span>{users.length} Utilisateurs</span>
          </div>
        </div>

        {loading && users.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">Chargement...</div>
        ) : (
          <div className="grid gap-4">
            {users.map((user) => (
              <Card key={user.id} className="overflow-hidden">
                <div 
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => toggleUserExpanded(user.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{user.prenom} {user.nom}</h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${user.abonnement === 'premium' || user.abonnement === 'premium_plus' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                          {user.abonnement}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteUser(user.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    {expandedUser === user.id ? <ChevronDown className="w-5 h-5 text-muted-foreground" /> : <ChevronRight className="w-5 h-5 text-muted-foreground" />}
                  </div>
                </div>

                {expandedUser === user.id && (
                  <CardContent className="border-t bg-accent/20 px-4 py-6 space-y-6">
                    {/* User Info Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Naissance</span>
                        </div>
                        <p className="text-sm font-medium">{user.date_naissance ? new Date(user.date_naissance).toLocaleDateString() : 'Non renseigné'}</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <BadgeInfo className="w-3.5 h-3.5" />
                          <span>Sexe</span>
                        </div>
                        <p className="text-sm font-medium capitalize">{user.sexe.replace('_', ' ')}</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Weight className="w-3.5 h-3.5" />
                          <span>Poids initial</span>
                        </div>
                        <p className="text-sm font-medium">{user.poids_initial_kg ? `${user.poids_initial_kg} kg` : 'Non renseigné'}</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Ruler className="w-3.5 h-3.5" />
                          <span>Taille</span>
                        </div>
                        <p className="text-sm font-medium">{user.taille_cm ? `${user.taille_cm} cm` : 'Non renseigné'}</p>
                      </div>
                    </div>

                    <div className="pt-2">
                      <div className="flex items-center gap-2 mb-4 text-sm font-semibold">
                        <Utensils className="w-4 h-4" />
                        <h4>Historique des repas</h4>
                      </div>
                      
                      {!user.meals ? (
                        <div className="text-center py-4 text-sm text-muted-foreground">Chargement des repas...</div>
                      ) : user.meals.length === 0 ? (
                        <div className="text-center py-4 text-sm text-muted-foreground">Aucun repas enregistré</div>
                      ) : (
                        <div className="space-y-2">
                          {user.meals.map((meal) => (
                            <div key={meal.id} className="flex items-center justify-between p-3 bg-card rounded-lg border border-border">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium capitalize">{meal.type_repas.replace('_', ' ')}</span>
                                  <span className="text-xs text-muted-foreground">• {new Date(meal.date_repas).toLocaleDateString()}</span>
                                </div>
                                <p className="text-xs text-primary font-semibold">{meal.total_calories} kcal</p>
                                {meal.notes && <p className="text-xs text-muted-foreground mt-1 italic">"{meal.notes}"</p>}
                              </div>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => deleteMeal(user.id, meal.id)}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
