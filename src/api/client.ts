// src/api/client.ts
const BASE = import.meta.env.VITE_API_URL;

export async function postLista(payload: any) {
    const res = await fetch(`${BASE}/listas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
    }
    return res.json();
}

export async function getListas(params?: Record<string, string>) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    const res = await fetch(`${BASE}/api/listas${qs}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}
