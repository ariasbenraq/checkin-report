// src/api/client.ts
import { getAccessToken } from "../utils/auth";

const RAW_BASE = import.meta.env.VITE_API_URL;

if (!RAW_BASE) {
  console.warn("VITE_API_URL no está definida. Usando fallback local...");
}

const BASE = (RAW_BASE || "http://localhost:3000").replace(/\/+$/, "");

function apiUrl(path: string) {
  return `${BASE}/${String(path || '').replace(/^\/+/, '')}`;
}

async function fetchWithAuth(pathOrAbsUrl: string, options: RequestInit = {}) {
  const isAbsolute = /^https?:\/\//i.test(pathOrAbsUrl);
  const url = isAbsolute ? pathOrAbsUrl : apiUrl(pathOrAbsUrl);

  const token = await getAccessToken();
  const isFormData = options.body instanceof FormData;
  const baseHeaders: Record<string, string> = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const headers = { ...baseHeaders, ...(options.headers as any) };
  const res = await fetch(url, { ...options, headers });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  }

  if (res.status === 204) return null;
  const text = await res.text().catch(() => '');
  if (!text) return null;
  try { return JSON.parse(text); } catch { return text as any; }
}

// ==== API ====

export function postLista(payload: any, opts?: { saveKey?: string }) {
  const headers = opts?.saveKey ? { "X-Save-Key": opts.saveKey } : undefined;
  return fetchWithAuth("/listas", {
    method: "POST",
    body: JSON.stringify(payload),
    headers,
  });
}
