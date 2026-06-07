"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft, ChevronLeft, ChevronRight,
  Database, Download, ExternalLink, Pencil,
  RefreshCw, Search, Trash2, Upload, X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { adminApi } from "@/lib/admin-api"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  if (n < 1024) return `${n} o`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} Ko`
  return `${(n / 1024 / 1024).toFixed(1)} Mo`
}

function useDebounce<T>(value: T, delay = 350): T {
  const [dv, setDv] = useState<T>(value)
  useEffect(() => {
    const t = setTimeout(() => setDv(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return dv
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({ page, total, perPage, onChange }: {
  page: number; total: number; perPage: number; onChange: (p: number) => void
}) {
  const pages = Math.ceil(total / perPage)
  if (pages <= 1) return null
  return (
    <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
      <span>{total} enregistrements — page {page + 1}/{pages}</span>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => onChange(page - 1)} disabled={page === 0}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => onChange(page + 1)} disabled={page >= pages - 1}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────

function EditModal({ row, fields, onSave, onClose }: {
  row: any
  fields: { key: string; label: string; type?: string }[]
  onSave: (updates: any) => Promise<void>
  onClose: () => void
}) {
  const [values, setValues] = useState<any>(() =>
    Object.fromEntries(fields.map(f => [f.key, row[f.key] ?? ""]))
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  async function handleSave() {
    setSaving(true); setError("")
    try { await onSave(values); onClose() }
    catch (e: any) { setError(e?.message ?? "Erreur lors de la sauvegarde") }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">Modifier #{row.id}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-3">
          {fields.map(f => (
            <div key={f.key}>
              <label className="text-xs font-medium text-muted-foreground block mb-1">{f.label}</label>
              <Input type={f.type ?? "text"} value={values[f.key] ?? ""}
                onChange={e => setValues((v: any) => ({ ...v, [f.key]: e.target.value }))}
                className="h-9 text-sm" />
            </div>
          ))}
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>Annuler</Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving && <RefreshCw className="w-4 h-4 animate-spin mr-1" />}
            Sauvegarder
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Data Table ───────────────────────────────────────────────────────────────

function DataTable({ columns, rows, onDelete, onEdit, loading }: {
  columns: string[]; rows: any[]
  onDelete?: (id: number) => void
  onEdit?: (row: any) => void
  loading: boolean
}) {
  if (loading) return <div className="py-8 text-center text-muted-foreground text-sm">Chargement…</div>
  if (!rows.length) return <div className="py-8 text-center text-muted-foreground text-sm">Aucune donnée</div>

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-muted-foreground">
            {columns.map(c => <th key={c} scope="col" className="text-left py-2 pr-3 font-medium">{c}</th>)}
            {(onEdit || onDelete) && <th scope="col" className="text-left py-2">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b last:border-0 hover:bg-muted/30">
              {columns.map(c => (
                <td key={c} className="py-2 pr-3 truncate max-w-[160px]" title={String(row[c] ?? "")}>
                  {row[c] === null || row[c] === undefined
                    ? <span className="text-muted-foreground/40 italic">null</span>
                    : String(row[c])}
                </td>
              ))}
              {(onEdit || onDelete) && (
                <td className="py-2">
                  <div className="flex gap-1">
                    {onEdit && (
                      <Button variant="ghost" size="sm" onClick={() => onEdit(row)}>
                        <Pencil className="w-3.5 h-3.5 text-primary" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button variant="ghost" size="sm"
                        onClick={() => { if (confirm("Supprimer cet enregistrement ?")) onDelete(row.id) }}>
                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                      </Button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Anomalies ────────────────────────────────────────────────────────────────

function ApprovalPanel() {
  const [anomalies, setAnomalies] = useState<any[]>([])
  const [corrections, setCorrections] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try { const r = await adminApi.approvals(); setAnomalies(r.anomalies ?? []) } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function approve(table: string, id: number, key: string) {
    const val = parseFloat(corrections[key])
    if (isNaN(val)) return alert("Valeur invalide")
    try { await adminApi.approve(table, id, val); await load() }
    catch { alert("Erreur lors de la correction") }
  }

  if (loading) return <div className="py-4 text-sm text-muted-foreground">Chargement…</div>
  if (!anomalies.length) return <div className="py-4 text-sm text-green-600">Aucune anomalie détectée.</div>

  return (
    <div className="space-y-3">
      {anomalies.map((a, i) => {
        const key = `${a.table_cible}_${a.record_id}`
        return (
          <div key={i} className="flex items-center gap-3 p-3 border rounded-lg bg-yellow-50/30 flex-wrap">
            <Badge variant="outline">{a.table_cible}</Badge>
            <span className="font-mono text-xs">#{a.record_id}</span>
            <span className="text-muted-foreground text-sm truncate flex-1">{a.detail}</span>
            <span className="text-xs text-yellow-700">{a.motif}</span>
            <Input className="w-28 h-8 text-sm" placeholder="Valeur"
              value={corrections[key] ?? ""}
              onChange={e => setCorrections(c => ({ ...c, [key]: e.target.value }))} />
            <Button size="sm" onClick={() => approve(a.table_cible, a.record_id, key)}>Approuver</Button>
          </div>
        )
      })}
    </div>
  )
}

// ─── Upload Zone ──────────────────────────────────────────────────────────────

function useEtlPolling(onDone?: () => void) {
  const [etlRunning, setEtlRunning] = useState(false)
  const [etlDone, setEtlDone] = useState(false)
  const ref = useRef<ReturnType<typeof setInterval> | null>(null)
  const onDoneRef = useRef(onDone)
  useEffect(() => { onDoneRef.current = onDone }, [onDone])

  function startPolling() {
    if (ref.current) clearInterval(ref.current)
    setEtlRunning(true); setEtlDone(false)
    ref.current = setInterval(async () => {
      try {
        const s = await adminApi.etlStatus()
        if (!s.en_cours) {
          clearInterval(ref.current!); ref.current = null
          setEtlRunning(false); setEtlDone(true)
          onDoneRef.current?.()
        }
      } catch {
        clearInterval(ref.current!); ref.current = null
        setEtlRunning(false)
      }
    }, 3000)
  }

  useEffect(() => () => { if (ref.current) clearInterval(ref.current) }, [])
  return { etlRunning, etlDone, startPolling }
}

function UploadZone({ onUploaded, onEtlDone }: { onUploaded: () => void; onEtlDone: () => void }) {
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [triggerEtl, setTriggerEtl] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)
  const { etlRunning, etlDone, startPolling } = useEtlPolling(onEtlDone)

  async function handleFile(file: File) {
    setUploading(true); setResult(null); setError(null)
    try {
      const r = await adminApi.uploadDataset(file, triggerEtl)
      setResult(`✓ ${r.uploaded} (${fmt(r.size_bytes)})`)
      onUploaded()
      if (r.etl_triggered) startPolling()
    } catch (e: any) {
      setError(typeof e === "string" ? e : "Erreur lors de l'upload")
    } finally {
      setUploading(false)
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault(); setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div className="space-y-3">
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
          ${dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/30"}`}
      >
        <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
        <p className="font-medium text-sm">Glisser-déposer un fichier ici</p>
        <p className="text-xs text-muted-foreground mt-1">CSV, JSON, XLSX · max 100 Mo</p>
        <input ref={inputRef} type="file" accept=".csv,.json,.xlsx" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
      </div>

      <div className="flex items-center gap-2 text-sm">
        <input type="checkbox" id="trigger-etl" checked={triggerEtl}
          onChange={e => setTriggerEtl(e.target.checked)} className="rounded" />
        <label htmlFor="trigger-etl" className="text-muted-foreground cursor-pointer">
          Lancer l'ETL automatiquement après l'upload
        </label>
      </div>

      {uploading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <RefreshCw className="w-4 h-4 animate-spin" /> Upload en cours…
        </div>
      )}
      {etlRunning && (
        <div className="flex items-center gap-2 text-sm text-primary">
          <RefreshCw className="w-4 h-4 animate-spin" /> ETL en cours — les données seront mises à jour automatiquement…
        </div>
      )}
      {result && (
        <p className="text-sm text-green-600">
          {result}{etlDone ? " — données mises à jour ✓" : etlRunning ? " — ETL en cours…" : ""}
        </p>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}

// ─── Datasets List ────────────────────────────────────────────────────────────

function DatasetsList({ refreshKey }: { refreshKey: number }) {
  const [datasets, setDatasets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try { const r = await adminApi.datasets(); setDatasets(r.datasets ?? []) } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load, refreshKey])

  async function handleDelete(filename: string) {
    if (!confirm(`Supprimer "${filename}" ?`)) return
    setDeleting(filename)
    try { await adminApi.deleteDataset(filename); await load() }
    catch { alert("Erreur lors de la suppression") }
    setDeleting(null)
  }

  if (loading) return <div className="py-4 text-sm text-muted-foreground">Chargement…</div>
  if (!datasets.length) return <div className="py-4 text-sm text-muted-foreground">Aucun fichier dataset disponible.</div>

  return (
    <div className="space-y-2">
      {datasets.map(d => (
        <div key={d.filename} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/20">
          <div className="flex items-center gap-3">
            <Database className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{d.filename}</p>
              <p className="text-xs text-muted-foreground">
                {fmt(d.size_bytes)} · modifié le {new Date(d.modified).toLocaleString("fr-FR")}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => handleDelete(d.filename)}
            disabled={deleting === d.filename}>
            {deleting === d.filename
              ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              : <Trash2 className="w-3.5 h-3.5 text-destructive" />}
          </Button>
        </div>
      ))}
    </div>
  )
}

// ─── Kaggle Panel ─────────────────────────────────────────────────────────────

function KagglePanel({ onEtlDone }: { onEtlDone: () => void }) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  const [downloading, setDownloading] = useState<string | null>(null)
  const [dlResult, setDlResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { etlRunning, etlDone, startPolling } = useEtlPolling(onEtlDone)

  async function handleSearch() {
    setSearching(true); setResults([]); setError(null)
    try {
      const r = await adminApi.kaggleSearch(query)
      setResults(r.datasets ?? [])
    } catch (e: any) {
      setError(e?.message ?? "Erreur Kaggle — vérifiez KAGGLE_USERNAME / KAGGLE_KEY")
    } finally {
      setSearching(false)
    }
  }

  async function handleDownload(ref: string) {
    setDownloading(ref); setDlResult(null); setError(null)
    try {
      const r = await adminApi.kaggleDownload(ref, true)
      setDlResult(`✓ ${ref} téléchargé`)
      if (r.etl_triggered) startPolling()
    } catch (e: any) {
      setError(typeof e === "string" ? e : "Erreur lors du téléchargement")
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input placeholder="Rechercher un dataset Kaggle (ex: nutrition, fitness…)"
          value={query} onChange={e => setQuery(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") handleSearch() }}
          className="flex-1" />
        <Button onClick={handleSearch} disabled={searching || !query.trim()}>
          {searching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {dlResult && (
        <p className="text-sm text-green-600">
          {dlResult}{etlDone ? " — données mises à jour ✓" : etlRunning ? " — ETL en cours…" : ""}
        </p>
      )}
      {etlRunning && (
        <div className="flex items-center gap-2 text-sm text-primary">
          <RefreshCw className="w-4 h-4 animate-spin" /> ETL en cours — intégration des données Kaggle…
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {results.map((d, i) => (
            <div key={i} className="flex items-start justify-between p-3 border rounded-lg hover:bg-muted/20 gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">{d.title ?? d.ref}</p>
                  <a href={`https://www.kaggle.com/datasets/${d.ref}`} target="_blank" rel="noopener"
                    className="text-muted-foreground hover:text-foreground flex-shrink-0">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <p className="text-xs text-muted-foreground font-mono">{d.ref}</p>
                <div className="flex gap-2 mt-1">
                  {d.size && <Badge variant="outline" className="text-xs">{d.size}</Badge>}
                  {d.licenseName && <Badge variant="secondary" className="text-xs">{d.licenseName}</Badge>}
                </div>
              </div>
              <Button size="sm" variant="outline"
                onClick={() => handleDownload(d.ref)}
                disabled={downloading === d.ref}
                className="flex-shrink-0">
                {downloading === d.ref
                  ? <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1" />
                  : <Download className="w-3.5 h-3.5 mr-1" />}
                Télécharger
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const EDIT_FIELDS: Record<string, { key: string; label: string; type?: string }[]> = {
  users: [
    { key: "nom", label: "Nom" },
    { key: "prenom", label: "Prénom" },
    { key: "poids_initial_kg", label: "Poids (kg)", type: "number" },
    { key: "taille_cm", label: "Taille (cm)", type: "number" },
    { key: "abonnement", label: "Abonnement" },
  ],
  foods: [
    { key: "nom", label: "Nom" },
    { key: "categorie", label: "Catégorie" },
    { key: "calories_100g", label: "Calories /100g", type: "number" },
    { key: "proteines_g", label: "Protéines (g)", type: "number" },
    { key: "glucides_g", label: "Glucides (g)", type: "number" },
    { key: "lipides_g", label: "Lipides (g)", type: "number" },
  ],
  exercises: [
    { key: "nom", label: "Nom" },
    { key: "type", label: "Type" },
    { key: "niveau", label: "Niveau" },
    { key: "equipement", label: "Équipement" },
  ],
}

const COLS: Record<string, string[]> = {
  users:     ["id", "nom", "prenom", "email", "sexe", "poids_initial_kg", "taille_cm", "abonnement", "actif"],
  foods:     ["id", "nom", "categorie", "calories_100g", "proteines_g", "glucides_g", "lipides_g"],
  exercises: ["id", "nom", "type", "niveau", "equipement"],
  metrics:   ["id", "utilisateur_id", "date_mesure", "poids_kg", "bpm_repos", "bpm_max", "calories_brulees"],
}

const EXPORT_MAP: Record<string, string> = {
  users: "utilisateurs", foods: "aliments", exercises: "exercices", metrics: "metriques",
}

const FILTER_OPTIONS: Record<string, string[]> = {
  exercises: ["debutant", "intermediaire", "avance"],
}

export default function DataPage() {
  const [tab, setTab] = useState("users")
  const [page, setPage] = useState(0)
  const [data, setData] = useState<any>({ data: [], total: 0 })
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("")
  const [editingRow, setEditingRow] = useState<any>(null)
  const [globalRefreshKey, setGlobalRefreshKey] = useState(0)
  const debouncedSearch = useDebounce(search)

  // Appelé quand l'ETL termine — recharge les données et la liste de fichiers
  const handleEtlDone = useCallback(() => {
    setGlobalRefreshKey(k => k + 1)
  }, [])

  async function fetchData(t: string, p: number, s: string, f: string) {
    setLoading(true)
    try {
      let result: any
      if (t === "users") result = await adminApi.users(p, s)
      else if (t === "foods") result = await adminApi.foods(p, s, f)
      else if (t === "exercises") result = await adminApi.exercises(p, s, f)
      else if (t === "metrics") result = await adminApi.metrics(p)
      setData(result ?? { data: [], total: 0 })
    } catch {
      setData({ data: [], total: 0 })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { setPage(0); setSearch(""); setFilter("") }, [tab])
  useEffect(() => {
    if (["users", "foods", "exercises", "metrics"].includes(tab))
      fetchData(tab, page, debouncedSearch, filter)
  }, [tab, page, debouncedSearch, filter, globalRefreshKey])

  async function handleDelete(id: number) {
    if (tab === "users") await adminApi.deleteUser(id)
    else if (tab === "foods") await adminApi.deleteFood(id)
    else if (tab === "exercises") await adminApi.deleteEx(id)
    await fetchData(tab, page, debouncedSearch, filter)
  }

  async function handleEdit(updates: any) {
    if (!editingRow) return
    if (tab === "users") await adminApi.updateUser(editingRow.id, updates)
    else if (tab === "foods") await adminApi.updateFood(editingRow.id, updates)
    else if (tab === "exercises") await adminApi.updateEx(editingRow.id, updates)
    await fetchData(tab, page, debouncedSearch, filter)
  }

  return (
    <main className="min-h-screen bg-background">
      {editingRow && EDIT_FIELDS[tab] && (
        <EditModal row={editingRow} fields={EDIT_FIELDS[tab]}
          onSave={handleEdit} onClose={() => setEditingRow(null)} />
      )}

      <header className="flex items-center gap-4 px-6 py-4 border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <Link href="/admin" aria-label="Retour">
          <ArrowLeft className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
        </Link>
        <nav className="flex gap-4 text-sm">
          <Link href="/admin" className="text-muted-foreground hover:text-foreground transition-colors">Vue d'ensemble</Link>
          <span className="font-semibold text-foreground" aria-current="page">Données</span>
          <Link href="/admin/analytics" className="text-muted-foreground hover:text-foreground transition-colors">Analytics</Link>
        </nav>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
            <TabsTrigger value="foods">Aliments</TabsTrigger>
            <TabsTrigger value="exercises">Exercices</TabsTrigger>
            <TabsTrigger value="metrics">Métriques</TabsTrigger>
            <TabsTrigger value="approvals">Anomalies</TabsTrigger>
            <TabsTrigger value="datasets">Datasets</TabsTrigger>
          </TabsList>

          {/* ── Onglets tabulaires ── */}
          {(["users", "foods", "exercises", "metrics"] as const).map(t => (
            <TabsContent key={t} value={t} className="mt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3 gap-4 flex-wrap">
                  <CardTitle className="text-sm font-medium">
                    {t} — {data.total ?? 0} enregistrements
                  </CardTitle>
                  <div className="flex gap-2 flex-wrap items-center">
                    {/* Recherche */}
                    {t !== "metrics" && (
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <Input placeholder="Rechercher…" value={search}
                          onChange={e => { setSearch(e.target.value); setPage(0) }}
                          className="h-8 pl-8 w-44 text-sm" />
                        {search && (
                          <button onClick={() => { setSearch(""); setPage(0) }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    )}
                    {/* Filtre niveau / catégorie */}
                    {FILTER_OPTIONS[t] && (
                      <select value={filter} onChange={e => { setFilter(e.target.value); setPage(0) }}
                        className="h-8 text-sm px-2 rounded-md border border-input bg-background">
                        <option value="">Tous niveaux</option>
                        {FILTER_OPTIONS[t].map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                    )}
                    <Button variant="outline" size="sm"
                      onClick={() => fetchData(t, page, debouncedSearch, filter)}>
                      <RefreshCw className="w-3.5 h-3.5" />
                    </Button>
                    {EXPORT_MAP[t] && (
                      <>
                        <a href={adminApi.exportUrl(EXPORT_MAP[t], "csv")} download>
                          <Button variant="outline" size="sm">CSV</Button>
                        </a>
                        <a href={adminApi.exportUrl(EXPORT_MAP[t], "json")} download>
                          <Button variant="outline" size="sm">JSON</Button>
                        </a>
                      </>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <DataTable
                    columns={COLS[t]}
                    rows={data.data ?? []}
                    onDelete={t !== "metrics" ? handleDelete : undefined}
                    onEdit={EDIT_FIELDS[t] ? setEditingRow : undefined}
                    loading={loading}
                  />
                  <Pagination page={page} total={data.total ?? 0} perPage={50} onChange={setPage} />
                </CardContent>
              </Card>
            </TabsContent>
          ))}

          {/* ── Anomalies ── */}
          <TabsContent value="approvals" className="mt-4">
            <Card>
              <CardHeader><CardTitle className="text-sm font-medium">Anomalies — workflow de validation</CardTitle></CardHeader>
              <CardContent><ApprovalPanel /></CardContent>
            </Card>
          </TabsContent>

          {/* ── Datasets ── */}
          <TabsContent value="datasets" className="mt-4 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Upload className="w-4 h-4" /> Upload de dataset
                </CardTitle>
              </CardHeader>
              <CardContent>
                <UploadZone
                  onUploaded={() => setGlobalRefreshKey(k => k + 1)}
                  onEtlDone={handleEtlDone}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Database className="w-4 h-4" /> Fichiers disponibles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DatasetsList refreshKey={globalRefreshKey} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" /> Importer depuis Kaggle
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Nécessite{" "}
                  <code className="bg-muted px-1 rounded">KAGGLE_USERNAME</code> et{" "}
                  <code className="bg-muted px-1 rounded">KAGGLE_KEY</code>{" "}
                  dans les variables d'environnement du service ETL.
                </p>
                <KagglePanel onEtlDone={handleEtlDone} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
