// src/api/client.ts
const RAW_BASE = import.meta.env.VITE_API_URL;

if (!RAW_BASE) {
  console.warn('VITE_API_URL no está definida. Usando fallback local...');
}

const BASE = (RAW_BASE || "http://localhost:3000").replace(/\/+$/, "");

function apiUrl(path: string) {
  return `${BASE}/${String(path || '').replace(/^\/+/, '')}`;
}

// Helper para obtener token
function getToken() {
  return localStorage.getItem("accessToken");
}

// Wrapper común para incluir Authorization si hay token
async function fetchWithAuth(pathOrAbsUrl: string, options: RequestInit = {}) {
  const isAbsolute = /^https?:\/\//i.test(pathOrAbsUrl);
  const url = isAbsolute ? pathOrAbsUrl : apiUrl(pathOrAbsUrl);

  const token = getToken();
  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

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

export function postLista(payload: any) {
  return fetchWithAuth('/listas', { method: 'POST', body: JSON.stringify(payload) });
}
export function getListas(params?: Record<string, string>) {
  const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
  return fetchWithAuth(`/listas${qs}`);
}
export function deleteLista(id: number) {
  return fetchWithAuth(`/listas/${id}`, { method: 'DELETE' });
}

// === AUTH ===
export async function signIn(username: string, password: string) {
  // Para /auth/signin no necesitas Authorization
  const res = await fetch(apiUrl('/auth/signin'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  }

  const data = await res.json(); // { accessToken: '...' }
  if (!data?.accessToken) throw new Error('No llegó accessToken desde el backend');
  return data.accessToken as string;
}

