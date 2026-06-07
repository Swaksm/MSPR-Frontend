"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { LogOut, RefreshCw, AlertTriangle, CheckCircle2, Database, Users, Salad, Dumbbell, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { adminApi } from "@/lib/admin-api"

function StatCard({ icon: Icon, label, value, sub }: { icon: any; label: string; value: any; sub?: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value ?? "—"}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
          {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  )
}

export default function AdminPage() {
  const router = useRouter()
  const [quality, setQuality] = useState<any>(null)
  const [etl, setEtl] = useState<any>(null)
  const [anomalies, setAnomalies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [runningEtl, setRunningEtl] = useState(false)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (localStorage.getItem("user_role") !== "admin") {
      router.push("/login")
      return
    }
    load()
    return () => { if (pollingRef.current) clearInterval(pollingRef.current) }
  }, [])

  async function load() {
    setLoading(true)
    try {
      const [q, e, a] = await Promise.all([
        adminApi.quality(),
        adminApi.etlStatus(),
        adminApi.approvals(),
      ])
      setQuality(q)
      setEtl(e)
      setAnomalies(a.anomalies ?? [])
    } catch { /* service non dispo hors Docker */ }
    setLoading(false)
  }

  function startEtlPolling() {
    if (pollingRef.current) clearInterval(pollingRef.current)
    setRunningEtl(true)
    pollingRef.current = setInterval(async () => {
      try {
        const status = await adminApi.etlStatus()
        setEtl(status)
        if (!status.en_cours) {
          clearInterval(pollingRef.current!)
          pollingRef.current = null
          setRunningEtl(false)
          await load()
        }
      } catch {
        clearInterval(pollingRef.current!)
        pollingRef.current = null
        setRunningEtl(false)
      }
    }, 3000)
  }

  async function triggerEtl() {
    try { await adminApi.etlRun() } catch {}
    startEtlPolling()
  }

  const stats = quality?.statistiques
  const score = quality?.score_qualite ?? 0

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="flex items-center justify-between px-6 py-4 border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-6">
          <img src="/JARMY-logo-01.svg" alt="Jarmy" className="h-7" />
          <nav className="flex gap-4 text-sm" aria-label="Navigation admin">
            <span className="font-semibold text-foreground" aria-current="page">Vue d'ensemble</span>
            <Link href="/admin/data" className="text-muted-foreground hover:text-foreground transition-colors">Données</Link>
            <Link href="/admin/analytics" className="text-muted-foreground hover:text-foreground transition-colors">Analytics</Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading} aria-label="Actualiser">
            <RefreshCw className={`w-4 h-4 mr-1 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
          <Button variant="outline" size="sm" onClick={triggerEtl} disabled={runningEtl} aria-label="Lancer le pipeline ETL">
            <Database className="w-4 h-4 mr-1" />
            {runningEtl ? "Démarrage…" : "Lancer ETL"}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => { localStorage.clear(); router.push("/login") }} aria-label="Déconnexion">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* Score qualité + ETL */}
        <section aria-labelledby="qualite-heading" className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader><CardTitle id="qualite-heading" className="text-base">Score qualité des données</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <p className="text-5xl font-bold text-primary" aria-label={`Score : ${score} sur 100`}>
                {score}<span className="text-2xl text-muted-foreground">/100</span>
              </p>
              <Progress value={score} className="h-2" aria-valuenow={score} aria-valuemin={0} aria-valuemax={100} />
              <Badge variant={score >= 80 ? "default" : score >= 50 ? "secondary" : "destructive"}>
                {score >= 80 ? "Bon" : score >= 50 ? "Moyen" : "Faible"}
              </Badge>
              {stats && (
                <ul className="text-xs text-muted-foreground space-y-1 mt-2">
                  <li>Utilisateurs sans poids : <strong>{stats.users_sans_poids}</strong></li>
                  <li>Aliments calories à 0 : <strong>{stats.aliments_calories_nulles}</strong></li>
                  <li>Métriques sans poids : <strong>{stats.metriques_sans_poids}</strong></li>
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader><CardTitle className="text-base">Dernier run ETL</CardTitle></CardHeader>
            <CardContent>
              {etl ? (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Statut</p>
                    <div className="flex items-center gap-1 mt-1">
                      {etl.statut === "succes"
                        ? <CheckCircle2 className="w-4 h-4 text-green-500" aria-hidden />
                        : <AlertTriangle className="w-4 h-4 text-yellow-500" aria-hidden />}
                      <span className="font-medium capitalize">{etl.statut ?? "—"}</span>
                      {etl.en_cours && <Badge variant="secondary" className="ml-2">En cours</Badge>}
                    </div>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Déclencheur</p>
                    <p className="font-medium mt-1 capitalize">{etl.declencheur ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Durée</p>
                    <p className="font-medium mt-1">{etl.duree_secondes ? `${etl.duree_secondes}s` : "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">ETL réussis / erreurs</p>
                    <p className="font-medium mt-1">
                      <span className="text-green-600">{etl.nb_etl_succes ?? 0}</span>
                      {" / "}
                      <span className="text-red-500">{etl.nb_etl_erreur ?? 0}</span>
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Démarré le</p>
                    <p className="font-medium mt-1">{etl.started_at ? new Date(etl.started_at).toLocaleString("fr-FR") : "—"}</p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">Aucun run enregistré ou service non disponible.</p>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Compteurs */}
        <section aria-label="Statistiques des tables" className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={Users}     label="Utilisateurs"  value={stats?.nb_utilisateurs} sub={`${stats?.nb_actifs ?? 0} actifs`} />
          <StatCard icon={Salad}     label="Aliments"       value={stats?.nb_aliments} />
          <StatCard icon={Dumbbell}  label="Exercices"      value={stats?.nb_exercices} />
          <StatCard icon={BarChart3} label="Métriques"      value={stats?.nb_metriques} />
        </section>

        {/* Anomalies */}
        <section aria-labelledby="anomalies-heading">
          <Card>
            <CardHeader>
              <CardTitle id="anomalies-heading" className="text-base flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500" aria-hidden />
                Anomalies à corriger
                {anomalies.length > 0 && <Badge variant="secondary">{anomalies.length}</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {anomalies.length === 0 ? (
                <div className="flex items-center gap-2 text-green-600 text-sm">
                  <CheckCircle2 className="w-4 h-4" aria-hidden />
                  Aucune anomalie détectée
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm" role="table" aria-label="Liste des anomalies">
                      <thead>
                        <tr className="border-b text-muted-foreground">
                          <th scope="col" className="text-left py-2 pr-4">Table</th>
                          <th scope="col" className="text-left py-2 pr-4">ID</th>
                          <th scope="col" className="text-left py-2 pr-4">Détail</th>
                          <th scope="col" className="text-left py-2">Motif</th>
                        </tr>
                      </thead>
                      <tbody>
                        {anomalies.slice(0, 10).map((a, i) => (
                          <tr key={i} className="border-b last:border-0">
                            <td className="py-2 pr-4"><Badge variant="outline">{a.table_cible}</Badge></td>
                            <td className="py-2 pr-4 font-mono">{a.record_id}</td>
                            <td className="py-2 pr-4 text-muted-foreground truncate max-w-[200px]">{a.detail}</td>
                            <td className="py-2 text-yellow-600">{a.motif}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {anomalies.length > 10 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      + {anomalies.length - 10} autres —{" "}
                      <Link href="/admin/data" className="underline">voir tout dans Données</Link>
                    </p>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Export */}
        <section aria-labelledby="export-heading">
          <Card>
            <CardHeader><CardTitle id="export-heading" className="text-base">Export des données nettoyées</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {["utilisateurs", "aliments", "exercices", "metriques"].map((ds) => (
                  <div key={ds} className="flex gap-2">
                    <a href={adminApi.exportUrl(ds, "csv")} download aria-label={`Télécharger ${ds} en CSV`}>
                      <Button variant="outline" size="sm">{ds} CSV</Button>
                    </a>
                    <a href={adminApi.exportUrl(ds, "json")} download aria-label={`Télécharger ${ds} en JSON`}>
                      <Button variant="outline" size="sm">{ds} JSON</Button>
                    </a>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

      </div>
    </main>
  )
}
