"use client";

import { useState, useEffect } from "react";
import {
  Salad, Users, Utensils, Trash2, LogOut, ChevronRight, ChevronDown,
  Calendar, Ruler, Weight, BadgeInfo, Database, Crown, TrendingUp,
  Zap, PieChart, Activity, Search, ShieldCheck, FileText, ExternalLink,
  AlertTriangle, CheckCircle, Download, RefreshCw, Edit3, Play, X,
  CheckCircle2, Gauge, History, ScrollText, Filter
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const BASE_URL = process.env.NEXT_PUBLIC_JARMY_API_URL || "http://localhost:8000";
const AUTH_API_URL = `${BASE_URL}/auth`;
const MEAL_API_URL = `${BASE_URL}/meal`;
const ADMIN_API_URL = `${BASE_URL}/admin`;
const LOGS_API_URL = `${BASE_URL}`;

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

interface ActivityLog {
  id: string;
  user_id: number;
  action: string;
  detail: Record<string, any> | null;
  timestamp: string;
}

interface LogStats {
  action: string;
  count: number;
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

interface AnomalySample {
  id: number;
  nom: string;
  prenom?: string;
  email?: string;
  value?: any;
}

interface DataQuality {
  score_qualite: number;
  statistiques: {
    nb_utilisateurs: number;
    nb_aliments: number;
    users_sans_poids: number;
    aliments_calories_nulles: number;
    nb_exercices: number;
    nb_metriques: number;
  };
  anomalies: {
    users_missing_goals: { count: number; samples: AnomalySample[] };
    users_unrealistic_weight: { count: number; samples: AnomalySample[] };
    foods_zero_calories: { count: number; samples: AnomalySample[] };
  };
  etl_logs: {
    id: number;
    start_time: string;
    end_time: string;
    status: string;
    records_processed: number;
    logs: string;
  }[];
}

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  const [activeTab, setActiveTab] = useState<"users" | "data" | "mongodb">("users");
  
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [dataQuality, setDataQuality] = useState<DataQuality | null>(null);
  const [loading, setLoading] = useState(false);
  const [etlLoading, setEtlLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedUser, setExpandedUser] = useState<number | null>(null);
  const [selectedLog, setSelectedLog] = useState<string | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [logStats, setLogStats] = useState<LogStats[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logFilterAction, setLogFilterAction] = useState("");
  const [logFilterUser, setLogFilterUser] = useState("");

  useEffect(() => {
    if (isLoggedIn) {
      fetchData();
      fetchDataQuality();
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
        fetch(`${ADMIN_API_URL}/users`),
        fetch(`${AUTH_API_URL}/stats/global`)
      ]);
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(Array.isArray(usersData) ? usersData : usersData.data || []);
      }
      if (statsRes.ok) setStats(await statsRes.json());
    } catch (error) {
      toast.error("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  const fetchActivityLogs = async () => {
    setLogsLoading(true);
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (logFilterUser) params.set("user_id", logFilterUser);
      if (logFilterAction) params.set("action", logFilterAction);
      const [logsRes, statsRes] = await Promise.all([
        fetch(`${LOGS_API_URL}/logs?${params}`),
        fetch(`${LOGS_API_URL}/logs/stats${logFilterUser ? `?user_id=${logFilterUser}` : ""}`)
      ]);
      if (logsRes.ok) setActivityLogs(await logsRes.json());
      if (statsRes.ok) setLogStats(await statsRes.json());
    } catch {
      toast.error("Service MongoDB injoignable");
    } finally {
      setLogsLoading(false);
    }
  };

  const fetchDataQuality = async () => {
    try {
      const res = await fetch(`${ADMIN_API_URL}/data-quality`);
      if (res.ok) setDataQuality(await res.json());
    } catch (error) {
      console.error("Erreur Data Quality");
    }
  };

  const triggerEtl = async () => {
    setEtlLoading(true);
    try {
      const res = await fetch(`${ADMIN_API_URL}/etl/run`, { method: "POST" });
      if (res.ok) {
        toast.success("Pipeline ETL lancé avec succès");
        setTimeout(fetchDataQuality, 3000);
      } else {
        toast.error("Échec du lancement ETL");
      }
    } catch (error) {
      toast.error("Serveur ETL injoignable");
    } finally {
      setEtlLoading(false);
    }
  };

  const handleExport = () => {
    // Création d'un lien temporaire pour forcer le téléchargement
    const link = document.createElement("a");
    link.href = `${ADMIN_API_URL}/export`;
    link.setAttribute("download", `jarmy_export_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Téléchargement de l'export lancé");
  };

  const correctValue = async (table: string, id: number, column: string, newValue: any) => {
    if (!newValue || newValue === "") {
        toast.error("Veuillez saisir une valeur");
        return;
    }
    try {
      const res = await fetch(`${ADMIN_API_URL}/data/correct`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table_name: table, id, column_name: column, new_value: newValue }),
      });
      if (res.ok) {
        toast.success("Donnée corrigée avec succès");
        fetchDataQuality();
        fetchData();
      } else {
        toast.error("Erreur lors de la correction");
      }
    } catch (error) {
      toast.error("Erreur réseau");
    }
  };

  const approveData = async () => {
    try {
      const res = await fetch(`${ADMIN_API_URL}/data/approve`, { 
        method: "POST", 
        headers: {"Content-Type": "application/json"}, 
        body: JSON.stringify({status: "APPROVED"})
      });
      if (res.ok) {
        toast.success("Batch ETL approuvé !");
        fetchDataQuality();
      }
    } catch (error) {
      toast.error("Erreur d'approbation");
    }
  };

  const updateSubscription = async (userId: number, newSub: string) => {
    try {
      const res = await fetch(`${ADMIN_API_URL}/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ abonnement: newSub }),
      });
      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, abonnement: newSub } : u));
        toast.success("Abonnement mis à jour");
        fetch(`${AUTH_API_URL}/stats/global`).then(r => r.json()).then(s => setStats(s));
      }
    } catch (error) {
      toast.error("Erreur réseau");
    }
  };

  const deleteUser = async (userId: number) => {
    if (!confirm("Supprimer définitivement cet utilisateur ?")) return;
    try {
      const res = await fetch(`${ADMIN_API_URL}/users/${userId}`, { method: "DELETE" });
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

  const lastLog = dataQuality?.etl_logs[0];
  const score = dataQuality?.score_qualite ?? 0;

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-900 pb-20">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Salad className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-xl tracking-tighter">JARMY <span className="text-primary">PRO</span></span>
            <nav className="hidden lg:flex items-center gap-4 ml-8">
              <Link href="/admin" className="text-xs font-bold uppercase tracking-widest text-primary border-b-2 border-primary pb-1">Vue d'ensemble</Link>
              <Link href="/admin/data" className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors pb-1">Données</Link>
              <Link href="/admin/analytics" className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors pb-1">Analytics</Link>
            </nav>
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
                <ApiDocLink label="Admin Service" url="http://localhost:8006/docs" />
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="sm" asChild className="hidden md:flex gap-2 rounded-xl border-slate-200">
              <a href="http://localhost:8080" target="_blank" rel="noopener noreferrer">
                <Database className="w-4 h-4 text-slate-500" /> SQL Admin
              </a>
            </Button>
            <div className="h-6 w-px bg-slate-200" />
            <Button variant="ghost" size="sm" onClick={() => setIsLoggedIn(false)} className="gap-2 text-slate-500 hover:text-red-600 rounded-xl">
              <LogOut className="w-4 h-4" /> Quitter
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-8 space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-none shadow-sm overflow-hidden bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Gauge className="w-4 h-4 text-primary" />
                Score qualité des données
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-black text-primary tracking-tighter">{score}</span>
                <span className="text-xl text-slate-400 font-bold">/100</span>
              </div>
              <Progress value={score} className="h-2 bg-slate-100" />
              <Badge className={`rounded-lg uppercase font-black text-[10px] ${score >= 80 ? 'bg-green-100 text-green-700' : score >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                {score >= 80 ? 'Excellent' : score >= 50 ? 'Améliorable' : 'Critique'}
              </Badge>
              {dataQuality && (
                <div className="pt-2 grid grid-cols-2 gap-y-2">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Erreurs Kcal</p>
                  <p className="text-[10px] text-right font-bold">{dataQuality.statistiques.aliments_calories_nulles}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Poids nuls</p>
                  <p className="text-[10px] text-right font-bold">{dataQuality.statistiques.users_sans_poids}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="md:col-span-2 border-none shadow-sm overflow-hidden bg-white">
            <CardHeader className="pb-2 border-b border-slate-50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Database className="w-4 h-4 text-primary" />
                  Dernier run du pipeline ETL
                </CardTitle>
                {lastLog?.status === 'SUCCESS' ? (
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 text-green-700 rounded-lg border border-green-100">
                    <CheckCircle2 className="w-3 h-3" />
                    <span className="text-[10px] font-black uppercase tracking-tighter">Opérationnel</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-50 text-amber-700 rounded-lg border border-amber-100">
                    <AlertTriangle className="w-3 h-3" />
                    <span className="text-[10px] font-black uppercase tracking-tighter">Attention</span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {lastLog ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">ID Exécution</p>
                    <p className="font-mono font-bold text-slate-700 text-sm">#{lastLog.id}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Date</p>
                    <p className="font-bold text-slate-700 text-sm">{new Date(lastLog.start_time).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Impact</p>
                    <p className="font-bold text-primary text-sm">+{lastLog.records_processed} lignes</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Logs</p>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedLog(lastLog.logs)} className="h-6 px-2 text-[10px] font-bold text-slate-500 hover:text-primary">Voir détails</Button>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-slate-400 italic text-sm">Aucun historique disponible</div>
              )}
              <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                <p className="text-[10px] text-slate-400 font-medium">Source : Kaggle Nutrition & Gym Datasets</p>
                <div className="flex gap-2">
                   <Button size="sm" variant="ghost" onClick={fetchDataQuality} className="text-slate-500 rounded-lg h-8 w-8 p-0"><RefreshCw className="w-4 h-4" /></Button>
                   <Button size="sm" onClick={triggerEtl} disabled={etlLoading} className="rounded-lg h-8 gap-2 font-bold px-4">
                    <Play className={`w-3 h-3 ${etlLoading ? 'animate-spin' : ''}`} />
                    Lancer Run
                   </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <CounterCard icon={Users} label="Utilisateurs" value={dataQuality?.statistiques.nb_utilisateurs} color="text-blue-600" />
          <CounterCard icon={Salad} label="Aliments" value={dataQuality?.statistiques.nb_aliments} color="text-green-600" />
          <CounterCard icon={TrendingUp} label="Métriques" value={dataQuality?.statistiques.nb_metriques} color="text-purple-600" />
          <CounterCard icon={ShieldCheck} label="Actifs" value={stats?.utilisateurs_actifs} color="text-primary" />
        </div>

        <div className="flex items-center gap-4 mb-6 border-b border-slate-200">
          <button onClick={() => setActiveTab('users')} className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'users' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
            Gestion des comptes
          </button>
          <button onClick={() => setActiveTab('data')} className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'data' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
            Contrôle Qualité & ETL
          </button>
          <button onClick={() => { setActiveTab('mongodb'); fetchActivityLogs(); }} className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-1.5 ${activeTab === 'mongodb' ? 'border-green-600 text-green-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
            <ScrollText className="w-3.5 h-3.5" />
            Activité MongoDB
          </button>
          <Link href="/admin/analytics">
            <button className="pb-3 text-sm font-bold border-b-2 transition-colors border-transparent text-slate-500 hover:text-slate-800">Analytics Avancés</button>
          </Link>
        </div>

        {activeTab === 'mongodb' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
                  <ScrollText className="w-6 h-6 text-green-600" />
                  Activité MongoDB
                </h2>
                <p className="text-slate-500 text-sm">Logs d'activité en temps réel — base NoSQL <span className="font-bold text-green-600">healthai_logs</span></p>
              </div>
              <Button onClick={fetchActivityLogs} disabled={logsLoading} variant="outline" className="gap-2 rounded-xl border-slate-200">
                <RefreshCw className={`w-4 h-4 ${logsLoading ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {logStats.slice(0, 4).map((s) => (
                <Card key={s.action} className="border-none shadow-sm bg-white overflow-hidden">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-50">
                      <Activity className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-lg font-black text-slate-800 tracking-tighter">{s.count}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{s.action.replace(/_/g, ' ')}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="border-none shadow-sm bg-white overflow-hidden">
              <CardHeader className="border-b border-slate-100 pb-4">
                <div className="flex flex-col md:flex-row md:items-center gap-3">
                  <CardTitle className="text-sm font-bold flex items-center gap-2 flex-1">
                    <Database className="w-4 h-4 text-green-600" />
                    Collection <span className="font-mono text-green-700 bg-green-50 px-2 py-0.5 rounded-lg text-xs">activity_logs</span>
                    <span className="ml-auto text-xs font-normal text-slate-400">{activityLogs.length} documents</span>
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <Input
                        placeholder="user_id..."
                        className="pl-8 h-8 w-28 text-xs rounded-lg border-slate-200"
                        value={logFilterUser}
                        onChange={(e) => setLogFilterUser(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && fetchActivityLogs()}
                      />
                    </div>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <Input
                        placeholder="action..."
                        className="pl-8 h-8 w-32 text-xs rounded-lg border-slate-200"
                        value={logFilterAction}
                        onChange={(e) => setLogFilterAction(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && fetchActivityLogs()}
                      />
                    </div>
                    <Button size="sm" onClick={fetchActivityLogs} className="h-8 px-3 rounded-lg bg-green-600 hover:bg-green-700 text-xs">Filtrer</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {logsLoading ? (
                  <div className="py-16 flex items-center justify-center gap-3 text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span className="text-sm">Lecture MongoDB...</span>
                  </div>
                ) : activityLogs.length === 0 ? (
                  <div className="py-16 text-center text-slate-400 italic text-sm">
                    Aucun log trouvé — les actions des utilisateurs apparaîtront ici
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-[10px] text-slate-400 uppercase font-black bg-slate-50/50 border-b border-slate-100">
                        <tr>
                          <th className="px-4 py-3">Document ID</th>
                          <th className="px-4 py-3">User</th>
                          <th className="px-4 py-3">Action</th>
                          <th className="px-4 py-3">Détails</th>
                          <th className="px-4 py-3">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activityLogs.map((log) => (
                          <tr key={log.id} className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors">
                            <td className="px-4 py-3 font-mono text-[10px] text-slate-400 max-w-[120px] truncate">{log.id}</td>
                            <td className="px-4 py-3">
                              <span className="bg-blue-50 text-blue-700 font-bold text-xs px-2 py-0.5 rounded-lg">#{log.user_id}</span>
                            </td>
                            <td className="px-4 py-3">
                              <ActionBadge action={log.action} />
                            </td>
                            <td className="px-4 py-3 max-w-[200px]">
                              {log.detail ? (
                                <span className="font-mono text-[10px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded truncate block">
                                  {JSON.stringify(log.detail)}
                                </span>
                              ) : (
                                <span className="text-slate-300 text-xs italic">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                              {new Date(log.timestamp).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'users' ? (
          <div className="space-y-4 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold tracking-tight text-slate-800">Comptes Utilisateurs</h2>
                <p className="text-slate-500 text-sm">Visualisez et gérez les utilisateurs</p>
              </div>
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input placeholder="Rechercher..." className="pl-10 h-11 rounded-xl bg-white border-slate-200 shadow-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </div>
            <div className="grid gap-3">
              {filteredUsers.map((user) => (
                <UserRow key={user.id} user={user} isExpanded={expandedUser === user.id} onToggle={() => setExpandedUser(expandedUser === user.id ? null : user.id)} onDelete={() => deleteUser(user.id)} onUpdateSub={(val) => updateSubscription(user.id, val)} />
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold tracking-tight text-slate-800">Contrôle Qualité & ETL</h2>
                <p className="text-slate-500 text-sm">Surveillez l'intégrité des données.</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleExport} className="gap-2 bg-primary hover:bg-primary/90 rounded-xl px-6">
                  <Download className="w-4 h-4" /> Exporter Base (JSON)
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <AnomalyCard title="Objectifs Manquants" count={dataQuality?.anomalies.users_missing_goals.count || 0} samples={dataQuality?.anomalies.users_missing_goals.samples || []} icon={<AlertTriangle className="text-red-600" />} onCorrect={(id, val) => correctValue("utilisateur", id, "kcal_objectif", val)} type="number" />
              <AnomalyCard title="Poids Invalides" count={dataQuality?.anomalies.users_unrealistic_weight.count || 0} samples={dataQuality?.anomalies.users_unrealistic_weight.samples || []} icon={<AlertTriangle className="text-amber-600" />} onCorrect={(id, val) => correctValue("utilisateur", id, "poids_initial_kg", val)} type="number" />
              <AnomalyCard title="Aliments Vides" count={dataQuality?.anomalies.foods_zero_calories.count || 0} samples={dataQuality?.anomalies.foods_zero_calories.samples || []} icon={<Edit3 className="text-blue-600" />} onCorrect={(id, val) => correctValue("aliment", id, "calories_100g", val)} type="number" />
            </div>

            <Card className="border-none shadow-sm overflow-hidden bg-white">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <History className="w-4 h-4 text-slate-400" />
                    Historique des Jobs ETL
                  </CardTitle>
                  <Button onClick={approveData} size="sm" variant="outline" className="gap-2 text-green-700 border-green-200 bg-green-50 hover:bg-green-100"><CheckCircle className="w-4 h-4" /> Approuver Batch</Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-[10px] text-slate-400 uppercase font-black bg-slate-50/30 border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-4">Job ID</th>
                        <th className="px-6 py-4">Horodatage</th>
                        <th className="px-6 py-4">Statut</th>
                        <th className="px-6 py-4 text-right">Traités</th>
                        <th className="px-6 py-4 text-center">Rapport</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dataQuality?.etl_logs.map(log => (
                        <tr key={log.id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors group">
                          <td className="px-6 py-4 font-mono font-bold text-slate-400 text-xs">#{log.id}</td>
                          <td className="px-6 py-4 text-slate-600">{new Date(log.start_time).toLocaleString('fr-FR', {day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit'})}</td>
                          <td className="px-6 py-4"><span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${log.status === 'SUCCESS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{log.status}</span></td>
                          <td className="px-6 py-4 text-right font-mono text-slate-900 font-bold">{log.records_processed}</td>
                          <td className="px-6 py-4 text-center">
                            <Button variant="ghost" size="sm" onClick={() => setSelectedLog(log.logs || 'Aucun log détaillé')} className="h-8 w-8 p-0 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 opacity-0 group-hover:opacity-100 transition-all"><FileText className="w-3.5 h-3.5 text-slate-500" /></Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {selectedLog && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                <Card className="w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl border-none animate-in zoom-in-95 duration-200">
                  <CardHeader className="border-b">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2"><FileText className="w-5 h-5 text-primary" /> Détails de l'exécution</CardTitle>
                      <Button variant="ghost" size="icon" onClick={() => setSelectedLog(null)} className="rounded-xl"><X className="w-4 h-4" /></Button>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-y-auto p-6"><pre className="bg-slate-50 p-4 rounded-xl text-xs font-mono text-slate-700 whitespace-pre-wrap border border-slate-100">{selectedLog}</pre></CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function KpiCard({ title, value, subtitle, icon, color }: { title: string, value: string | number, subtitle: string, icon: React.ReactNode, color: string }) {
  return (
    <Card className="border-none shadow-sm overflow-hidden bg-white">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
            <h3 className="text-3xl font-black text-slate-800 tracking-tighter">{value}</h3>
            <p className="text-xs text-slate-400 font-medium">{subtitle}</p>
          </div>
          <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center shadow-inner`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function CounterCard({ icon: Icon, label, value, color }: { icon: any, label: string, value: any, color: string }) {
  return (
    <Card className="border-none shadow-sm bg-white overflow-hidden">
      <CardContent className="p-4 flex items-center gap-3">
        <div className="p-2 rounded-lg bg-slate-50"><Icon className={`w-4 h-4 ${color}`} /></div>
        <div>
          <p className="text-lg font-black text-slate-800 tracking-tighter">{value ?? "—"}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function AnomalyCard({ title, count, samples, icon, onCorrect, type }: { title: string, count: number, samples: AnomalySample[], icon: React.ReactNode, onCorrect: (id: number, val: any) => void, type: string }) {
  const [inputs, setInputs] = useState<Record<number, string>>({});

  return (
    <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
      <CardHeader className="pb-3 border-b border-slate-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-slate-50">{icon}</div>
            <CardTitle className="text-sm font-bold">{title}</CardTitle>
          </div>
          <span className={`text-xs font-black px-2 py-0.5 rounded-full ${count > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{count}</span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-60 overflow-y-auto">
          {samples.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 italic">Aucune anomalie détectée</div>
          ) : (
            samples.map(s => (
              <div key={s.id} className="p-3 border-b border-slate-50 flex items-center justify-between hover:bg-slate-50 group">
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-slate-800 truncate">{s.nom} {s.prenom}</p>
                  <p className="text-[10px] text-slate-400 truncate">{s.email || `ID: ${s.id}`}</p>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Input 
                    type={type} 
                    placeholder={s.value || '...'} 
                    className="h-7 w-20 text-[10px] px-2 rounded-lg" 
                    value={inputs[s.id] || ""}
                    onChange={(e) => setInputs({...inputs, [s.id]: e.target.value})}
                    onKeyDown={(e) => { if(e.key === 'Enter') { onCorrect(s.id, inputs[s.id]); setInputs({...inputs, [s.id]: ""}); } }} 
                  />
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-7 w-7 text-primary hover:bg-primary/10 rounded-lg"
                    onClick={() => { onCorrect(s.id, inputs[s.id]); setInputs({...inputs, [s.id]: ""}); }}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function UserRow({ user, isExpanded, onToggle, onDelete, onUpdateSub }: { user: User, isExpanded: boolean, onToggle: () => void, onDelete: () => void, onUpdateSub: (val: string) => void }) {
  return (
    <Card className={`overflow-hidden border-slate-200 transition-all ${isExpanded ? 'ring-2 ring-primary/20 shadow-md' : 'hover:border-slate-300 shadow-sm'}`}>
      <div className="flex items-center justify-between p-4 cursor-pointer" onClick={onToggle}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold">{user.prenom ? user.prenom[0] : '?'}{user.nom ? user.nom[0] : '?'}</div>
          <div>
            <h3 className="font-bold text-slate-800">{user.prenom} {user.nom}</h3>
            <div className="flex items-center gap-2">
              <p className="text-sm text-slate-500">{user.email}</p>
              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${user.abonnement === 'premium' || user.abonnement === 'premium_plus' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>{user.abonnement}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl" onClick={(e) => { e.stopPropagation(); onDelete(); }}><Trash2 className="w-4 h-4" /></Button>
          <div className={`p-1 rounded-lg transition-colors ${isExpanded ? 'bg-primary/10 text-primary' : 'text-slate-400'}`}>{isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}</div>
        </div>
      </div>
      {isExpanded && (
        <CardContent className="border-t border-slate-100 bg-slate-50/50 p-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <UserDetailItem icon={<Crown className="w-4 h-4" />} label="Offre">
              <select value={user.abonnement} onChange={(e) => onUpdateSub(e.target.value)} className="bg-transparent font-bold text-primary outline-none cursor-pointer border-b border-dashed border-primary/40 text-sm">
                <option value="freemium">Freemium</option>
                <option value="premium">Premium</option>
                <option value="premium_plus">Premium Plus</option>
              </select>
            </UserDetailItem>
            <UserDetailItem icon={<Calendar className="w-4 h-4" />} label="Date Inscr." value={new Date(user.date_inscription).toLocaleDateString()} />
            <UserDetailItem icon={<BadgeInfo className="w-4 h-4" />} label="Sexe" value={user.sexe ? user.sexe.replace('_', ' ') : '—'} capitalize />
            <UserDetailItem icon={<Weight className="w-4 h-4" />} label="Poids" value={user.poids_initial_kg ? `${user.poids_initial_kg} kg` : '--'} />
            <UserDetailItem icon={<Ruler className="w-4 h-4" />} label="Taille" value={user.taille_cm ? `${user.taille_cm} cm` : '--'} />
          </div>
        </CardContent>
      )}
    </Card>
  );
}

function UserDetailItem({ icon, label, value, children, capitalize }: { icon: React.ReactNode, label: string, value?: string, children?: React.ReactNode, capitalize?: boolean }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{icon}<span>{label}</span></div>
      {children ? children : (<p className={`text-sm font-bold text-slate-700 ${capitalize ? 'capitalize' : ''}`}>{value}</p>)}
    </div>
  );
}

function ActionBadge({ action }: { action: string }) {
  const colors: Record<string, string> = {
    login: "bg-blue-100 text-blue-700",
    logout: "bg-slate-100 text-slate-600",
    add_meal: "bg-green-100 text-green-700",
    search_food: "bg-purple-100 text-purple-700",
    update_profile: "bg-amber-100 text-amber-700",
    delete_meal: "bg-red-100 text-red-700",
  };
  const color = colors[action] ?? "bg-slate-100 text-slate-600";
  return (
    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${color}`}>
      {action.replace(/_/g, ' ')}
    </span>
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
