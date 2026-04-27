"use client";

import { useState, useEffect } from "react";
import { 
  Salad, Users, Utensils, Trash2, LogOut, ChevronRight, ChevronDown, 
  Calendar, Ruler, Weight, BadgeInfo, Database, Crown, TrendingUp, 
  Zap, PieChart, Activity, Search, ShieldCheck, FileText, ExternalLink
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
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
  activity?: UserActivity;
}

interface UserActivity {
  nb_seances: number;
  total_minutes: number;
  total_calories_depensees?: number;
  nb_exercices_differents?: number;
}

interface GlobalStats {
  total_utilisateurs: number;
  nb_freemium: number;
  nb_premium: number;
  nb_premium_plus: number;
  taux_conversion_pct: number;
  age_moyen: number;
  utilisateurs_actifs: number;
  total_repas: number;
  total_aliments: number;
}

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedUser, setExpandedUser] = useState<number | null>(null);

  useEffect(() => {
    if (isLoggedIn) {
      fetchData();
    }
  }, [isLoggedIn]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "admin" && password === "admin") {
      setIsLoggedIn(true);
      toast.success("Administration déverrouillée");
    } else {
      toast.error("Identifiants incorrects");
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, statsRes] = await Promise.all([
        fetch(`${AUTH_API_URL}/users`),
        fetch(`${AUTH_API_URL}/stats/global`)
      ]);
      
      if (usersRes.ok) setUsers(await usersRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
    } catch (error) {
      toast.error("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserExtra = async (userId: number) => {
    try {
      const [mealsRes, activityRes] = await Promise.all([
        fetch(`${MEAL_API_URL}/users/${userId}/meals`),
        fetch(`${AUTH_API_URL}/stats/users/${userId}/activity`)
      ]);
      
      const meals = mealsRes.ok ? await mealsRes.json() : [];
      const activity = activityRes.ok ? await activityRes.json() : null;
      
      setUsers(users.map(u => u.id === userId ? { ...u, meals, activity } : u));
    } catch (error) {
      console.error("Error fetching user details", error);
    }
  };

  const toggleUserExpanded = (userId: number) => {
    if (expandedUser === userId) {
      setExpandedUser(null);
    } else {
      setExpandedUser(userId);
      const user = users.find(u => u.id === userId);
      if (user && !user.meals) {
        fetchUserExtra(userId);
      }
    }
  };

  const updateSubscription = async (userId: number, newSub: string) => {
    try {
      const res = await fetch(`${AUTH_API_URL}/users/${userId}/subscription`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ abonnement: newSub }),
      });
      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, abonnement: newSub } : u));
        toast.success("Abonnement mis à jour");
        // Refresh global stats
        fetch(`${AUTH_API_URL}/stats/global`).then(r => r.json()).then(s => setStats(s));
      }
    } catch (error) {
      toast.error("Erreur réseau");
    }
  };

  const deleteUser = async (userId: number) => {
    if (!confirm("Supprimer définitivement cet utilisateur ?")) return;
    try {
      const res = await fetch(`${AUTH_API_URL}/users/${userId}`, { method: "DELETE" });
      if (res.ok) {
        setUsers(users.filter(u => u.id !== userId));
        toast.success("Utilisateur supprimé");
      }
    } catch (error) {
      toast.error("Erreur réseau");
    }
  };

  const filteredUsers = users.filter(u => 
    `${u.prenom} ${u.nom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fdf9] p-4">
        <Card className="w-full max-w-md border-none shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-3xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <ShieldCheck className="w-8 h-8 text-primary-foreground" />
              </div>
            </div>
            <div className="space-y-1">
              <CardTitle className="text-2xl font-black">JARMY ADMIN</CardTitle>
              <CardDescription>Accès restreint au personnel autorisé</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                placeholder="Identifiant"
                className="h-12 rounded-xl"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <Input
                type="password"
                placeholder="Mot de passe"
                className="h-12 rounded-xl"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button type="submit" className="w-full h-12 rounded-xl font-bold text-base bg-primary hover:bg-primary/90 transition-all">
                Se connecter
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-900 pb-20">
      {/* Sidebar/Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Salad className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-xl tracking-tighter">JARMY <span className="text-primary">PRO</span></span>
          </div>
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 rounded-xl border-slate-200">
                  <FileText className="w-4 h-4 text-primary" />
                  Documentation API
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-xl border-slate-200">
                <DropdownMenuLabel className="text-xs uppercase text-slate-400 font-bold tracking-widest">Microservices</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <ApiDocLink label="Gateway (Central)" url="http://localhost:8000/docs" />
                <ApiDocLink label="Auth Service" url="http://localhost:8004/docs" />
                <ApiDocLink label="Meal Service" url="http://localhost:8003/docs" />
                <ApiDocLink label="Kcal IA Service" url="http://localhost:8001/docs" />
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="outline" size="sm" asChild className="hidden md:flex gap-2 rounded-xl border-slate-200">
              <a href="http://localhost:8080" target="_blank" rel="noopener noreferrer">
                <Database className="w-4 h-4 text-slate-500" />
                SQL Admin
              </a>
            </Button>
            <div className="h-6 w-px bg-slate-200 hidden md:block" />
            <Button variant="ghost" size="sm" onClick={() => setIsLoggedIn(false)} className="gap-2 text-slate-500 hover:text-red-600 rounded-xl">
              <LogOut className="w-4 h-4" />
              Quitter
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-8 space-y-8">
        {/* KPI Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard 
            title="Utilisateurs" 
            value={stats?.total_utilisateurs || 0} 
            subtitle={`${stats?.utilisateurs_actifs || 0} actifs`}
            icon={<Users className="w-5 h-5 text-blue-600" />}
            color="bg-blue-50"
          />
          <KpiCard 
            title="Premium" 
            value={(stats?.nb_premium || 0) + (stats?.nb_premium_plus || 0)} 
            subtitle={`${stats?.taux_conversion_pct || 0}% de conversion`}
            icon={<Crown className="w-5 h-5 text-amber-600" />}
            color="bg-amber-50"
          />
          <KpiCard 
            title="Repas Analysés" 
            value={stats?.total_repas || 0} 
            subtitle="Total historique"
            icon={<PieChart className="w-5 h-5 text-green-600" />}
            color="bg-green-50"
          />
          <KpiCard 
            title="Âge Moyen" 
            value={stats ? Math.round(stats.age_moyen) : 0} 
            subtitle="Ans"
            icon={<Activity className="w-5 h-5 text-purple-600" />}
            color="bg-purple-50"
          />
        </div>

        {/* Aliments Count Banner */}
        <div className="bg-primary rounded-3xl p-6 text-white flex items-center justify-between shadow-lg shadow-primary/20">
          <div className="space-y-1">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Zap className="w-6 h-6 fill-white" />
              Base de données nutritionnelle
            </h2>
            <p className="opacity-80 text-sm">Le pipeline ETL a synchronisé {stats?.total_aliments || 0} aliments depuis les datasets Kaggle.</p>
          </div>
          <Button variant="secondary" className="rounded-xl font-bold">Gérer le catalogue</Button>
        </div>

        {/* User Management Section */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight text-slate-800">Gestion des comptes</h2>
              <p className="text-slate-500 text-sm">Visualisez, modifiez et gérez les utilisateurs de la plateforme</p>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Rechercher un nom ou un email..." 
                className="pl-10 h-11 rounded-xl bg-white border-slate-200 shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {loading && users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <p className="text-slate-500 font-medium">Récupération des données...</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredUsers.map((user) => (
                <Card key={user.id} className={`overflow-hidden border-slate-200 transition-all ${expandedUser === user.id ? 'ring-2 ring-primary/20 shadow-md' : 'hover:border-slate-300 shadow-sm'}`}>
                  <div 
                    className="flex items-center justify-between p-4 cursor-pointer"
                    onClick={() => toggleUserExpanded(user.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                        {user.prenom[0]}{user.nom[0]}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800">{user.prenom} {user.nom}</h3>
                        <p className="text-sm text-slate-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`hidden sm:block text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider ${
                        user.abonnement === 'premium' || user.abonnement === 'premium_plus' 
                        ? 'bg-amber-100 text-amber-700' 
                        : 'bg-slate-100 text-slate-500'
                      }`}>
                        {user.abonnement.replace('_', ' ')}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteUser(user.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <div className={`p-1 rounded-lg transition-colors ${expandedUser === user.id ? 'bg-primary/10 text-primary' : 'text-slate-400'}`}>
                        {expandedUser === user.id ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>

                  {expandedUser === user.id && (
                    <CardContent className="border-t border-slate-100 bg-slate-50/50 p-6 space-y-8 animate-in fade-in duration-300">
                      {/* Detailed Stats Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                        <UserDetailItem icon={<Crown className="w-4 h-4" />} label="Offre">
                          <select 
                            value={user.abonnement}
                            onChange={(e) => updateSubscription(user.id, e.target.value)}
                            className="bg-transparent font-bold text-primary outline-none cursor-pointer border-b border-dashed border-primary/40 hover:border-primary text-sm"
                          >
                            <option value="freemium">Freemium</option>
                            <option value="premium">Premium</option>
                            <option value="premium_plus">Premium Plus</option>
                          </select>
                        </UserDetailItem>
                        <UserDetailItem icon={<Calendar className="w-4 h-4" />} label="Âge" value={user.date_naissance ? `${Math.floor((new Date().getTime() - new Date(user.date_naissance).getTime()) / 31557600000)} ans` : '--'} />
                        <UserDetailItem icon={<BadgeInfo className="w-4 h-4" />} label="Sexe" value={user.sexe.replace('_', ' ')} capitalize />
                        <UserDetailItem icon={<Weight className="w-4 h-4" />} label="Poids" value={user.poids_initial_kg ? `${user.poids_initial_kg} kg` : '--'} />
                        <UserDetailItem icon={<Ruler className="w-4 h-4" />} label="Taille" value={user.taille_cm ? `${user.taille_cm} cm` : '--'} />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* activity */}
                        <div className="space-y-4">
                          <h4 className="text-sm font-bold flex items-center gap-2 text-slate-700">
                            <TrendingUp className="w-4 h-4 text-primary" />
                            Activité Sportive
                          </h4>
                          <div className="bg-white rounded-2xl p-4 border border-slate-200 grid grid-cols-2 gap-4">
                            <div className="text-center py-2">
                              <p className="text-2xl font-black text-slate-800">{user.activity?.nb_seances || 0}</p>
                              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Séances</p>
                            </div>
                            <div className="text-center py-2 border-l border-slate-100">
                              <p className="text-2xl font-black text-slate-800">{user.activity?.total_minutes || 0}</p>
                              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Minutes</p>
                            </div>
                          </div>
                        </div>

                        {/* Recent Meals */}
                        <div className="space-y-4">
                          <h4 className="text-sm font-bold flex items-center gap-2 text-slate-700">
                            <Utensils className="w-4 h-4 text-primary" />
                            Derniers Repas
                          </h4>
                          <div className="space-y-2">
                            {!user.meals || user.meals.length === 0 ? (
                              <div className="bg-white rounded-2xl p-6 border border-dashed border-slate-300 text-center">
                                <p className="text-xs text-slate-400">Aucune donnée alimentaire</p>
                              </div>
                            ) : (
                              user.meals.slice(0, 3).map(meal => (
                                <div key={meal.id} className="bg-white p-3 rounded-xl border border-slate-200 flex justify-between items-center shadow-sm">
                                  <div>
                                    <p className="text-xs font-bold capitalize">{meal.type_repas.replace('_', ' ')}</p>
                                    <p className="text-[10px] text-slate-400">{new Date(meal.date_repas).toLocaleDateString()}</p>
                                  </div>
                                  <span className="text-xs font-black text-primary">{Math.round(meal.total_calories)} kcal</span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
              {filteredUsers.length === 0 && (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
                  <Search className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-500">Aucun utilisateur ne correspond à votre recherche.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function KpiCard({ title, value, subtitle, icon, color }: { title: string, value: string | number, subtitle: string, icon: React.ReactNode, color: string }) {
  return (
    <Card className="border-none shadow-sm overflow-hidden">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</p>
            <h3 className="text-3xl font-black text-slate-800">{value}</h3>
            <p className="text-xs text-slate-400">{subtitle}</p>
          </div>
          <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function UserDetailItem({ icon, label, value, children, capitalize }: { icon: React.ReactNode, label: string, value?: string, children?: React.ReactNode, capitalize?: boolean }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        {icon}
        <span>{label}</span>
      </div>
      {children ? children : (
        <p className={`text-sm font-bold text-slate-700 ${capitalize ? 'capitalize' : ''}`}>{value}</p>
      )}
    </div>
  );
}

function ApiDocLink({ label, url }: { label: string, url: string }) {
  return (
    <DropdownMenuItem asChild>
      <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between cursor-pointer">
        <span className="font-medium text-sm text-slate-600">{label}</span>
        <ExternalLink className="w-3 h-3 text-slate-400" />
      </a>
    </DropdownMenuItem>
  );
}
