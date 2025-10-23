// src/api/client.ts
const BASE = import.meta.env.VITE_API_URL;

// Helper para obtener token
function getToken() {
  return localStorage.getItem("accessToken");
}

// Wrapper común para incluir Authorization si hay token
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = getToken();
  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(url, { ...options, headers });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }

  return res.json();
}

export async function postLista(payload: any) {
  return fetchWithAuth(`${BASE}/listas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function getListas(params?: Record<string, string>) {
  const qs = params ? "?" + new URLSearchParams(params).toString() : "";
  return fetchWithAuth(`${BASE}/listas${qs}`);
}
