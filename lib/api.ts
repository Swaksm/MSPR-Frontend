export const API_BASE = process.env.NEXT_PUBLIC_JARMY_API_URL || "http://localhost:8000";

function getLangHeader(): Record<string, string> {
  if (typeof window === "undefined") return { "X-Language": "EN" };
  const lang = localStorage.getItem("lang") ?? "en";
  return { "X-Language": lang.toUpperCase() };
}

export function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const resolvedUrl = url.replace("http://localhost:8000", API_BASE);
  const headers = {
    ...getLangHeader(),
    ...(options.headers ?? {}),
  };
  return fetch(resolvedUrl, { ...options, headers });
}
