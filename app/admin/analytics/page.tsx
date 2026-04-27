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
        <p className="text-slate-700 font-bold text-lg" role="status">Chargement des visualisations...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-900 pb-20">
      {/* Header Accessible */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" aria-label="Retour au tableau de bord administrateur" className="text-slate-600 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary rounded-full p-1">
              <ArrowLeft className="w-5 h-5" aria-hidden="true" />
            </Link>
            <div className="h-6 w-px bg-slate-300" aria-hidden="true" />
            <h1 className="font-black text-xl flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-primary" aria-hidden="true" />
              Analytics & Visualisations
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-8 space-y-8" role="main">
        {/* Démographie */}
        <section aria-labelledby="section-demographie">
          <div className="mb-4">
            <h2 id="section-demographie" className="text-xl font-bold flex items-center gap-2">
              <Users className="w-5 h-5" aria-hidden="true" /> Démographie Utilisateurs
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Inscriptions Mensuelles</CardTitle>
                <CardDescription>Évolution du nombre de comptes créés</CardDescription>
              </CardHeader>
              <CardContent className="h-80" aria-label="Graphique en ligne des inscriptions mensuelles">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data?.users.inscriptions_historique} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="mois" tickFormatter={(val) => new Date(val).toLocaleDateString('fr-FR', {month:'short'})} stroke="#475569" />
                    <YAxis stroke="#475569" />
                    <Tooltip 
                      labelFormatter={(val) => new Date(val).toLocaleDateString('fr-FR', {month:'long', year:'numeric'})}
                      contentStyle={{backgroundColor: '#FFF', borderRadius: '8px', border: '1px solid #E2E8F0', color: '#0F172A'}}
                    />
                    <Line type="monotone" dataKey="count" name="Nouveaux Utilisateurs" stroke="#005B9F" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Répartition par Sexe</CardTitle>
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
                      paddingAngle={2}
                      dataKey="count"
                      nameKey="sexe"
                      label={({sexe, percent}) => `${sexe} ${(percent * 100).toFixed(0)}%`}
                    >
                      {data?.users.repartition_sexe.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{backgroundColor: '#FFF', borderRadius: '8px', border: '1px solid #E2E8F0', color: '#0F172A'}} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Nutrition */}
        <section aria-labelledby="section-nutrition">
          <div className="mb-4">
            <h2 id="section-nutrition" className="text-xl font-bold flex items-center gap-2">
              <Flame className="w-5 h-5" aria-hidden="true" /> Tendances Nutritionnelles
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Types de Repas Enregistrés</CardTitle>
                <CardDescription>Volume de repas par moment de la journée</CardDescription>
              </CardHeader>
              <CardContent className="h-80" aria-label="Graphique en barres des types de repas">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.nutrition.repartition_repas.map(d => ({...d, type_repas: d.type_repas.replace('_', ' ').capitalize()}))} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                    <XAxis type="number" stroke="#475569" />
                    <YAxis dataKey="type_repas" type="category" stroke="#475569" width={100} />
                    <Tooltip contentStyle={{backgroundColor: '#FFF', borderRadius: '8px', border: '1px solid #E2E8F0', color: '#0F172A'}} />
                    <Bar dataKey="count" name="Nombre de repas" fill="#A03033" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Moyenne Calorique par Repas</CardTitle>
                <CardDescription>Kcal moyen consommé par catégorie</CardDescription>
              </CardHeader>
              <CardContent className="h-80" aria-label="Graphique en barres des calories moyennes">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.nutrition.moyenne_calorique.map(d => ({...d, type_repas: d.type_repas.replace('_', ' ').capitalize(), avg_cal: Math.round(d.avg_cal)}))} margin={{ top: 5, right: 30, left: 0, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="type_repas" angle={-45} textAnchor="end" stroke="#475569" height={60} />
                    <YAxis stroke="#475569" />
                    <Tooltip formatter={(value) => [`${value} kcal`, 'Moyenne']} contentStyle={{backgroundColor: '#FFF', borderRadius: '8px', border: '1px solid #E2E8F0', color: '#0F172A'}} />
                    <Bar dataKey="avg_cal" name="Moyenne (Kcal)" fill="#006C5B" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Fitness */}
        <section aria-labelledby="section-fitness" className="pb-8">
          <div className="mb-4">
            <h2 id="section-fitness" className="text-xl font-bold flex items-center gap-2">
              <Activity className="w-5 h-5" aria-hidden="true" /> Activités Sportives Préférées
            </h2>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Top 10 Exercices les plus pratiqués</CardTitle>
              <CardDescription>Basé sur l'historique des séances utilisateurs</CardDescription>
            </CardHeader>
            <CardContent className="h-96" aria-label="Graphique en barres du Top 10 des exercices">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.fitness.exercices_populaires} margin={{ top: 20, right: 30, left: 40, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="nom" angle={-45} textAnchor="end" interval={0} stroke="#475569" height={100} />
                  <YAxis stroke="#475569" />
                  <Tooltip contentStyle={{backgroundColor: '#FFF', borderRadius: '8px', border: '1px solid #E2E8F0', color: '#0F172A'}} />
                  <Bar dataKey="count" name="Séances enregistrées" fill="#6E3A82" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}

// Helper pour capitaliser la première lettre des types de repas
declare global {
  interface String {
    capitalize(): string;
  }
}
String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
}
