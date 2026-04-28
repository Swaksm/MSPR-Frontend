"use client";

import { useEffect, useState } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from "recharts";
import { ArrowLeft, BarChart2, Users, Flame, Activity } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const ADMIN_API_URL = "http://localhost:8000/admin";

// Palette contrastée conforme RGAA AA (Ratio > 4.5:1)
const COLORS = ["#005B9F", "#A03033", "#006C5B", "#6E3A82", "#A65A00"];

interface AnalyticsData {
  users: {
    repartition_sexe: { sexe: string; count: number }[];
    inscriptions_historique: { mois: string; count: number }[];
  };
  nutrition: {
    repartition_repas: { type_repas: string; count: number }[];
    moyenne_calorique: { type_repas: string; avg_cal: number }[];
  };
  fitness: {
    exercices_populaires: { nom: string; count: number }[];
  };
}

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [uRes, nRes, fRes] = await Promise.all([
        fetch(`${ADMIN_API_URL}/analytics/users`),
        fetch(`${ADMIN_API_URL}/analytics/nutrition`),
        fetch(`${ADMIN_API_URL}/analytics/fitness`)
      ]);
      
      setData({
        users: uRes.ok ? await uRes.json() : { repartition_sexe: [], inscriptions_historique: [] },
        nutrition: nRes.ok ? await nRes.json() : { repartition_repas: [], moyenne_calorique: [] },
        fitness: fRes.ok ? await fRes.json() : { exercices_populaires: [] }
      });
    } catch (error) {
      console.error("Erreur de chargement des analytics", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f1f5f9]" aria-live="polite">
        <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-slate-700 font-bold text-lg" role="status">Chargement des visualisations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-900 pb-20">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" aria-label="Retour au tableau de bord administrateur" className="text-slate-600 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary rounded-full p-1 transition-colors">
              <ArrowLeft className="w-5 h-5" aria-hidden="true" />
            </Link>
            <div className="h-6 w-px bg-slate-300" aria-hidden="true" />
            <h1 className="font-black text-xl flex items-center gap-2 tracking-tighter">
              <BarChart2 className="w-5 h-5 text-primary" aria-hidden="true" />
              ANALYTICS & <span className="text-primary">DATA</span>
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-8 space-y-8" role="main">
        {/* Démographie */}
        <section aria-labelledby="section-demographie">
          <div className="mb-4">
            <h2 id="section-demographie" className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Users className="w-3 h-3" aria-hidden="true" /> Démographie Utilisateurs
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-none shadow-sm overflow-hidden bg-white rounded-3xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Inscriptions Mensuelles</CardTitle>
                <CardDescription>Évolution du nombre de comptes créés</CardDescription>
              </CardHeader>
              <CardContent className="h-80" aria-label="Graphique en ligne des inscriptions mensuelles">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data?.users.inscriptions_historique} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="mois" tickFormatter={(val) => new Date(val).toLocaleDateString('fr-FR', {month:'short'})} stroke="#94a3b8" fontSize={10} fontWeight="bold" />
                    <YAxis stroke="#94a3b8" fontSize={10} fontWeight="bold" />
                    <Tooltip 
                      labelFormatter={(val) => new Date(val).toLocaleDateString('fr-FR', {month:'long', year:'numeric'})}
                      contentStyle={{backgroundColor: '#FFF', borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', color: '#0F172A'}}
                    />
                    <Line type="monotone" dataKey="count" name="Nouveaux Utilisateurs" stroke="#005B9F" strokeWidth={4} dot={{r: 4, strokeWidth: 2, fill: '#FFF'}} activeDot={{r: 6}} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm overflow-hidden bg-white rounded-3xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Répartition par Sexe</CardTitle>
                <CardDescription>Proportions démographiques des inscrits</CardDescription>
              </CardHeader>
              <CardContent className="h-80" aria-label="Graphique circulaire de la répartition par sexe">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data?.users.repartition_sexe.map(d => ({...d, sexe: d.sexe.replace('_', ' ').toUpperCase()}))}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="count"
                      nameKey="sexe"
                      label={({sexe, percent}) => `${sexe} ${(percent * 100).toFixed(0)}%`}
                    >
                      {data?.users.repartition_sexe.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={4} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{backgroundColor: '#FFF', borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', color: '#0F172A'}} />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Nutrition */}
        <section aria-labelledby="section-nutrition">
          <div className="mb-4">
            <h2 id="section-nutrition" className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Flame className="w-3 h-3" aria-hidden="true" /> Tendances Nutritionnelles
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-none shadow-sm overflow-hidden bg-white rounded-3xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Types de Repas Enregistrés</CardTitle>
                <CardDescription>Volume de repas par moment de la journée</CardDescription>
              </CardHeader>
              <CardContent className="h-80" aria-label="Graphique en barres des types de repas">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.nutrition.repartition_repas.map(d => ({...d, type_repas: capitalize(d.type_repas.replace('_', ' '))}))} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" stroke="#94a3b8" fontSize={10} fontWeight="bold" />
                    <YAxis dataKey="type_repas" type="category" stroke="#94a3b8" fontSize={10} fontWeight="bold" width={100} />
                    <Tooltip contentStyle={{backgroundColor: '#FFF', borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', color: '#0F172A'}} />
                    <Bar dataKey="count" name="Nombre de repas" fill="#A03033" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm overflow-hidden bg-white rounded-3xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Moyenne Calorique par Repas</CardTitle>
                <CardDescription>Kcal moyen consommé par catégorie</CardDescription>
              </CardHeader>
              <CardContent className="h-80" aria-label="Graphique en barres des calories moyennes">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.nutrition.moyenne_calorique.map(d => ({...d, type_repas: capitalize(d.type_repas.replace('_', ' ')), avg_cal: Math.round(d.avg_cal)}))} margin={{ top: 5, right: 30, left: 0, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="type_repas" angle={-45} textAnchor="end" stroke="#94a3b8" fontSize={10} fontWeight="bold" height={60} />
                    <YAxis stroke="#94a3b8" fontSize={10} fontWeight="bold" />
                    <Tooltip formatter={(value) => [`${value} kcal`, 'Moyenne']} contentStyle={{backgroundColor: '#FFF', borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', color: '#0F172A'}} />
                    <Bar dataKey="avg_cal" name="Moyenne (Kcal)" fill="#006C5B" radius={[4, 4, 0, 0]} barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Fitness */}
        <section aria-labelledby="section-fitness" className="pb-8">
          <div className="mb-4">
            <h2 id="section-fitness" className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Activity className="w-3 h-3" aria-hidden="true" /> Activités Sportives Préférées
            </h2>
          </div>
          <Card className="border-none shadow-sm overflow-hidden bg-white rounded-3xl">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Top 10 Exercices les plus pratiqués</CardTitle>
              <CardDescription>Basé sur l'historique des séances utilisateurs</CardDescription>
            </CardHeader>
            <CardContent className="h-96" aria-label="Graphique en barres du Top 10 des exercices">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.fitness.exercices_populaires} margin={{ top: 20, right: 30, left: 40, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="nom" angle={-45} textAnchor="end" interval={0} stroke="#94a3b8" fontSize={10} fontWeight="bold" height={100} />
                  <YAxis stroke="#94a3b8" fontSize={10} fontWeight="bold" />
                  <Tooltip contentStyle={{backgroundColor: '#FFF', borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', color: '#0F172A'}} />
                  <Bar dataKey="count" name="Séances enregistrées" fill="#6E3A82" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
