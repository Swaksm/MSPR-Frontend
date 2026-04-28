"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { 
  ArrowLeft, Trash2, ChevronLeft, ChevronRight, 
  Database, Users, Salad, Dumbbell, BarChart3, 
  Search, Download, RefreshCw, AlertTriangle, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const ADMIN_API_URL = "http://localhost:8000/admin";

interface PaginatedResponse {
  data: any[];
  total: number;
}

function DataTable({
  columns, rows, onDelete, loading,
}: {
  columns: string[]
  rows: any[]
  onDelete?: (id: number) => void
  loading: boolean
}) {
  if (loading) return (
    <div className="py-20 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Chargement des données...</p>
    </div>
  );
  
  if (!rows.length) return (
    <div className="py-20 text-center">
        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6 text-slate-300" />
        </div>
        <p className="text-slate-400 text-sm">Aucun enregistrement trouvé</p>
    </div>
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="border-b border-slate-100 text-[10px] text-slate-400 uppercase font-black tracking-widest">
            {columns.map((c) => <th key={c} scope="col" className="px-4 py-3">{c.replace('_', ' ')}</th>)}
            {onDelete && <th scope="col" className="px-4 py-3 text-right">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
              {columns.map((c) => (
                <td key={c} className="px-4 py-3 truncate max-w-[200px] text-slate-600 font-medium" title={String(row[c] ?? "")}>
                  {row[c] === null || row[c] === undefined ? (
                    <span className="text-slate-300 italic text-[10px]">null</span>
                  ) : typeof row[c] === 'boolean' ? (
                    <Badge variant="outline" className={row[c] ? 'text-green-600' : 'text-red-600'}>{String(row[c])}</Badge>
                  ) : String(row[c])}
                </td>
              ))}
              {onDelete && (
                <td className="px-4 py-3 text-right">
                  <Button
                    variant="ghost" size="icon"
                    className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    onClick={() => { if (confirm("Supprimer cet enregistrement ?")) onDelete(row.id) }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Pagination({ page, total, perPage, onChange }: { page: number; total: number; perPage: number; onChange: (p: number) => void }) {
  const pages = Math.ceil(total / perPage)
  if (pages <= 1) return null
  return (
    <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{total} enregistrements — Page {page + 1}/{pages}</span>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => onChange(page - 1)} disabled={page === 0} className="h-8 w-8 p-0 rounded-lg">
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => onChange(page + 1)} disabled={page >= pages - 1} className="h-8 w-8 p-0 rounded-lg">
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

export default function DataPage() {
  const [tab, setTab] = useState("users")
  const [page, setPage] = useState(0)
  const [data, setData] = useState<PaginatedResponse>({ data: [], total: 0 })
  const [loading, setLoading] = useState(false)

  const configs: Record<string, { icon: any, cols: string[]; endpoint: string; canDelete: boolean }> = {
    users: {
      icon: Users,
      cols: ["id", "nom", "prenom", "email", "sexe", "abonnement", "actif"],
      endpoint: "/users",
      canDelete: true
    },
    foods: {
      icon: Salad,
      cols: ["id", "nom", "calories_100g", "proteines_g", "glucides_g", "lipides_g", "source_dataset"],
      endpoint: "/foods",
      canDelete: true
    },
    exercises: {
      icon: Dumbbell,
      cols: ["id", "nom", "description"],
      endpoint: "/exercises",
      canDelete: false
    },
    metrics: {
      icon: BarChart3,
      cols: ["id", "utilisateur_id", "date_mesure", "poids_kg", "bpm_repos", "bpm_max", "calories_brulees"],
      endpoint: "/metrics",
      canDelete: false
    },
  }

  const loadData = useCallback(async () => {
    const cfg = configs[tab]
    if (!cfg) return
    setLoading(true)
    try {
      const res = await fetch(`${ADMIN_API_URL}${cfg.endpoint}?limit=50&offset=${page * 50}`)
      if (res.ok) {
        setData(await res.json())
      }
    } catch (err) {
      toast.error("Échec du chargement des données")
      setData({ data: [], total: 0 })
    } finally {
      setLoading(false)
    }
  }, [tab, page])

  useEffect(() => {
    setPage(0)
  }, [tab])

  useEffect(() => {
    loadData()
  }, [loadData])

  async function handleDelete(id: number) {
    const cfg = configs[tab]
    try {
      const res = await fetch(`${ADMIN_API_URL}${cfg.endpoint}/${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Supprimé")
        loadData()
      }
    } catch {
      toast.error("Erreur lors de la suppression")
    }
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-900 pb-20">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link href="/admin" className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </Link>
          <div className="h-6 w-px bg-slate-200" />
          <h1 className="font-black text-xl tracking-tighter">EXPLORATEUR DE <span className="text-primary">DONNÉES</span></h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-8 space-y-6">
        <Tabs value={tab} onValueChange={setTab} className="space-y-6">
          <TabsList className="bg-white p-1 rounded-2xl border border-slate-200 h-auto shadow-sm">
            {Object.entries(configs).map(([key, cfg]) => (
              <TabsTrigger key={key} value={key} className="rounded-xl px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-white font-bold transition-all">
                <cfg.icon className="w-4 h-4 mr-2" />
                <span className="capitalize">{key.replace('users', 'Utilisateurs').replace('foods', 'Aliments').replace('exercises', 'Exercices').replace('metrics', 'Métriques')}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.keys(configs).map((t) => (
            <TabsContent key={t} value={t} className="mt-0 focus-visible:outline-none">
              <Card className="border-none shadow-sm overflow-hidden bg-white">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 flex flex-row items-center justify-between pb-4">
                  <div className="space-y-1">
                    <CardTitle className="text-lg font-black text-slate-800 capitalize">
                      {t} 
                      <span className="ml-2 text-primary opacity-50 font-mono text-sm">[{data.total || 0}]</span>
                    </CardTitle>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Base de données HealthAI</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={loadData} className="rounded-xl h-9 w-9 p-0 bg-white">
                        <RefreshCw className={`w-4 h-4 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button variant="outline" size="sm" asChild className="rounded-xl h-9 gap-2 bg-white font-bold text-xs">
                      <a href={`${ADMIN_API_URL}/export`} target="_blank" rel="noopener noreferrer">
                        <Download className="w-3.5 h-3.5" /> JSON
                      </a>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <DataTable
                    columns={configs[t].cols}
                    rows={data.data ?? []}
                    onDelete={configs[t].canDelete ? handleDelete : undefined}
                    loading={loading}
                  />
                  <div className="px-6 pb-6">
                    <Pagination page={page} total={data.total ?? 0} perPage={50} onChange={setPage} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  )
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
