"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Activity, Heart, Moon, Scale, Watch, AlertCircle, Plus, Bluetooth, Dumbbell, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { useTranslation } from "@/lib/i18n-context";
import { apiFetch } from "@/lib/api";

interface Metric {
  date_mesure: string;
  poids_kg: number;
  heures_sommeil: number;
  bpm_repos: number;
}

export default function HealthDashboardPage() {
  const { t, lang } = useTranslation();
  const locale = lang === "fr" ? "fr-FR" : "en-US";

  const [isPremiumPlus, setIsPremiumPlus] = useState<boolean | null>(null);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const abonnement = localStorage.getItem("user_abonnement");
    const userId = localStorage.getItem("user_id");
    const status = abonnement === "premium_plus";
    setIsPremiumPlus(status);

    if (status && userId) {
      fetchMetrics(userId);
    } else {
      setLoading(false);
    }
  }, []);

  async function fetchMetrics(userId: string) {
    try {
      setLoading(true);
      const res = await apiFetch(`http://localhost:8003/users/${userId}/metrics`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      const formattedData = data.map((m: any) => ({
        ...m,
        date_display: new Date(m.date_mesure).toLocaleDateString(locale, { day: "2-digit", month: "2-digit" })
      }));
      setMetrics(formattedData);
    } catch {
      setError(t("health_error"));
    } finally {
      setLoading(false);
    }
  }

  const lastMetric = metrics[metrics.length - 1];

  return (
    <main className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="flex items-center justify-between px-5 py-5 bg-background sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("health_title")}</h1>
          <p className="text-xs text-muted-foreground">{t("health_subtitle")}</p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Activity className="w-5 h-5 text-primary" />
        </div>
      </header>

      <section className="flex-1 flex flex-col px-5 py-6 animate-fade-in">
        <div className="max-w-md mx-auto w-full space-y-6">
          {isPremiumPlus === false ? (
            <div className="flex flex-col items-center justify-center p-8 bg-card border border-border rounded-3xl text-center space-y-6 mt-4 animate-scale-in">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Watch className="w-8 h-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">{t("health_paywall_title")}</h2>
                <p className="text-muted-foreground text-sm">{t("health_paywall_desc")}</p>
              </div>
              <ul className="text-sm text-left space-y-4 w-full border-t border-b border-border py-6">
                <li className="flex gap-3 items-center"><Heart className="w-5 h-5 text-rose-500"/> {t("health_feat_heart")}</li>
                <li className="flex gap-3 items-center"><Moon className="w-5 h-5 text-indigo-500"/> {t("health_feat_sleep")}</li>
                <li className="flex gap-3 items-center"><Scale className="w-5 h-5 text-emerald-500"/> {t("health_feat_weight")}</li>
              </ul>
              <Link href="/dashboard/subscribe" className="w-full">
                <Button className="w-full h-14 rounded-2xl text-base font-semibold bg-gradient-to-r from-primary to-primary/80">
                  {t("health_unlock")}
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center space-y-1">
                <h1 className="text-2xl font-bold tracking-tight">{t("health_paywall_title")}</h1>
                <p className="text-muted-foreground text-xs uppercase tracking-widest">Premium+</p>
              </div>

              {/* Bouton appareil connecté — toujours visible pour Premium+ */}
              <button className="w-full flex items-center justify-between p-4 bg-card border border-dashed border-primary/40 rounded-2xl hover:border-primary hover:bg-primary/5 transition-all active:scale-[0.99]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Bluetooth className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-sm">{t("health_connect_device")}</p>
                    <p className="text-xs text-muted-foreground">{t("health_connect_device_desc")}</p>
                  </div>
                </div>
                <Plus className="w-5 h-5 text-primary shrink-0" />
              </button>

              {/* Stats — état conditionnel */}
              {loading ? (
                <div className="flex flex-col items-center justify-center p-20 space-y-4">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-muted-foreground">{t("health_syncing")}</p>
                </div>
              ) : error ? (
                <div className="p-6 bg-destructive/10 rounded-2xl text-center space-y-3">
                  <AlertCircle className="w-8 h-8 text-destructive mx-auto" />
                  <p className="text-sm font-medium text-destructive">{error}</p>
                  <Button variant="outline" onClick={() => window.location.reload()}>{t("health_retry")}</Button>
                </div>
              ) : metrics.length === 0 ? (
                <div className="text-center p-10 bg-card rounded-2xl border border-dashed border-border space-y-3">
                  <Watch className="w-10 h-10 text-muted-foreground mx-auto" />
                  <p className="text-muted-foreground text-sm">{t("health_no_data")}</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-card border border-border rounded-2xl space-y-1">
                      <div className="flex items-center gap-2 text-rose-500">
                        <Heart className="w-4 h-4" />
                        <span className="font-semibold text-xs uppercase">{t("health_bpm")}</span>
                      </div>
                      <p className="text-2xl font-bold">{lastMetric?.bpm_repos || '--'} <span className="text-xs font-normal text-muted-foreground">bpm</span></p>
                    </div>
                    <div className="p-4 bg-card border border-border rounded-2xl space-y-1">
                      <div className="flex items-center gap-2 text-indigo-500">
                        <Moon className="w-4 h-4" />
                        <span className="font-semibold text-xs uppercase">{t("health_sleep")}</span>
                      </div>
                      <p className="text-2xl font-bold">{lastMetric?.heures_sommeil || '--'}h <span className="text-xs font-normal text-muted-foreground">{t("health_per_night")}</span></p>
                    </div>
                  </div>

                  <div className="p-5 bg-card border border-border rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Scale className="w-5 h-5 text-emerald-500" />
                        <h3 className="font-semibold">{t("health_weight")}</h3>
                      </div>
                      <span className="text-sm font-bold text-emerald-500">{lastMetric?.poids_kg} kg</span>
                    </div>
                    <div className="h-48 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={metrics}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                          <XAxis dataKey="date_display" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#888'}} />
                          <YAxis domain={['dataMin - 2', 'dataMax + 2']} hide />
                          <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#1a1a1a', color: '#fff' }} />
                          <Line type="monotone" dataKey="poids_kg" stroke="#10b981" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="p-5 bg-card border border-border rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Moon className="w-5 h-5 text-indigo-500" />
                        <h3 className="font-semibold">{t("health_sleep")} (h)</h3>
                      </div>
                    </div>
                    <div className="h-48 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={metrics}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                          <XAxis dataKey="date_display" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#888'}} />
                          <YAxis hide domain={[0, 12]} />
                          <Tooltip cursor={{fill: '#222'}} contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#1a1a1a', color: '#fff' }} />
                          <Bar dataKey="heures_sommeil" fill="#6366f1" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </>
              )}
            </>
          )}


          {/* Fitness IA — visible dès Premium */}
          {isPremiumPlus !== null && (
            <Link href="/dashboard/fitness" className="block">
              <div className="flex items-center justify-between p-4 bg-card border border-border rounded-2xl hover:border-primary/50 transition-all active:scale-[0.99]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Dumbbell className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{t("fitness_title")}</p>
                    <p className="text-xs text-muted-foreground">{t("fitness_subtitle")}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </div>
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}
