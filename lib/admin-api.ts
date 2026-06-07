const BASE = process.env.NEXT_PUBLIC_JARMY_API_URL ?? "http://localhost:8000"

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { cache: "no-store" })
  if (!res.ok) throw new Error(`${res.status} ${path}`)
  return res.json()
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`${res.status} ${path}`)
  return res.json()
}

async function patch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`${res.status} ${path}`)
  return res.json()
}

async function del(path: string): Promise<void> {
  await fetch(`${BASE}${path}`, { method: "DELETE" })
}

export const adminApi = {
  // Qualité & ETL
  quality:      () => get<any>("/admin/data-quality"),
  etlStatus:    () => get<any>("/etl/etl/status"),
  etlHistory:   (limit = 10) => get<any>(`/etl/etl/history?limit=${limit}`),
  etlRun:       () => post<any>("/etl/etl/run", {}),
  approvals:    () => get<any>("/admin/approvals"),
  approve:      (table: string, id: number, valeur: number) =>
    post<any>(`/admin/approvals/${table}/${id}/approve?valeur=${valeur}`, {}),

  // Utilisateurs
  users: (p = 0, search = "", actif?: boolean) => {
    const params = new URLSearchParams({ limit: "50", offset: String(p * 50) })
    if (search) params.set("search", search)
    if (actif !== undefined) params.set("actif", String(actif))
    return get<any>(`/admin/users?${params}`)
  },
  deleteUser:   (id: number) => del(`/admin/users/${id}`),
  updateUser:   (id: number, b: any) => patch<any>(`/admin/users/${id}`, b),

  // Aliments
  foods: (p = 0, search = "", categorie = "") => {
    const params = new URLSearchParams({ limit: "50", offset: String(p * 50) })
    if (search) params.set("search", search)
    if (categorie) params.set("categorie", categorie)
    return get<any>(`/admin/foods?${params}`)
  },
  deleteFood:   (id: number) => del(`/admin/foods/${id}`),
  updateFood:   (id: number, b: any) => patch<any>(`/admin/foods/${id}`, b),

  // Exercices
  exercises: (p = 0, search = "", niveau = "", type = "") => {
    const params = new URLSearchParams({ limit: "50", offset: String(p * 50) })
    if (search) params.set("search", search)
    if (niveau) params.set("niveau", niveau)
    if (type) params.set("type", type)
    return get<any>(`/admin/exercises?${params}`)
  },
  deleteEx:     (id: number) => del(`/admin/exercises/${id}`),
  updateEx:     (id: number, b: any) => patch<any>(`/admin/exercises/${id}`, b),

  // Métriques
  metrics: (p = 0, userId?: number) => {
    const params = new URLSearchParams({ limit: "50", offset: String(p * 50) })
    if (userId) params.set("utilisateur_id", String(userId))
    return get<any>(`/admin/metrics?${params}`)
  },

  // Datasets (upload / liste / suppression)
  datasets:       () => get<any>("/etl/datasets"),
  deleteDataset:  (filename: string) =>
    fetch(`${BASE}/etl/datasets/${encodeURIComponent(filename)}`, { method: "DELETE" }).then(r => r.json()),
  uploadDataset:  (file: File, triggerEtl = true) => {
    const form = new FormData()
    form.append("file", file)
    form.append("trigger_etl", String(triggerEtl))
    return fetch(`${BASE}/etl/datasets/upload`, { method: "POST", body: form }).then(r => {
      if (!r.ok) return r.json().then(d => Promise.reject(d.detail ?? "Upload échoué"))
      return r.json()
    })
  },

  // Kaggle
  kaggleSearch:   (q: string, page = 1) => get<any>(`/etl/kaggle/search?q=${encodeURIComponent(q)}&page=${page}`),
  kaggleDownload: (dataset: string, triggerEtl = true) => {
    const form = new FormData()
    form.append("dataset", dataset)
    form.append("trigger_etl", String(triggerEtl))
    return fetch(`${BASE}/etl/kaggle/download`, { method: "POST", body: form }).then(r => {
      if (!r.ok) return r.json().then(d => Promise.reject(d.detail ?? "Téléchargement échoué"))
      return r.json()
    })
  },

  // Analytics
  analyticsUsers:     () => get<any>("/admin/analytics/users"),
  analyticsNutrition: () => get<any>("/admin/analytics/nutrition"),
  analyticsFitness:   () => get<any>("/admin/analytics/fitness"),
  analyticsKpis:      () => get<any>("/admin/analytics/kpis"),

  exportUrl: (dataset: string, format: string) =>
    `${BASE}/admin/export/${dataset}?format=${format}`,
}
