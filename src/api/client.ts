// src/api/client.ts
// =====================================
// Cliente API con soporte DEMO / PRODU
// =====================================

// Flags de demo
import { DEMO, DEMO_SAVE_KEY, DEMO_AUTH } from '../config/demo';
// Estado de auth (usa tu util existente)
import { getToken, setToken } from '../utils/auth';

/* =========================
   BASE & helpers de URL
   ========================= */
const RAW_BASE = import.meta.env.VITE_API_URL;
if (!RAW_BASE) {
  console.warn('VITE_API_URL no está definida. Usando fallback local...');
}
const BASE = (RAW_BASE || 'http://localhost:3000').replace(/\/+$/, '');

function apiUrl(path: string): string {
  return `${BASE}/${String(path || '').replace(/^\/+/, '')}`;
}

/* =========================
   JWT fake (solo DEMO auth)
   ========================= */
function base64UrlEncode(obj: any): string {
  const json = typeof obj === 'string' ? obj : JSON.stringify(obj);
  const b64 = btoa(json).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  return b64;
}

function makeFakeJwt(payload: Record<string, any>, expSeconds = 3600): string {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'none', typ: 'JWT' };
  const body = { iat: now, exp: now + expSeconds, ...payload };
  return `${base64UrlEncode(header)}.${base64UrlEncode(body)}.`; // firma vacía en demo
}

/* =========================
   DEMO storage (localStorage)
   ========================= */
const LS_KEY = 'demo_listas_v1';
const LS_SEQ = 'demo_listas_seq_v1';

type DemoLista = {
  id: number;
  nombre?: string;
  fechaISO?: string;
  detalles?: any;
  payload: any;
  createdAt: number;
  updatedAt: number;
};

function readAll(): DemoLista[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as DemoLista[]) : [];
  } catch {
    return [];
  }
}

function writeAll(arr: DemoLista[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(arr));
}

function nextId(): number {
  const n = Number(localStorage.getItem(LS_SEQ) || '0') + 1;
  localStorage.setItem(LS_SEQ, String(n));
  return n;
}

function existsByNombre(nombre?: string): boolean {
  if (!nombre) return false;
  const all = readAll();
  return all.some(
    (l) => (l.nombre || '').trim().toLowerCase() === nombre.trim().toLowerCase()
  );
}

/* =========================
   CORE FETCH con auto-refresh
   ========================= */
async function coreFetch(pathOrAbsUrl: string, options: RequestInit = {}) {
  const isAbsolute = /^https?:\/\//i.test(pathOrAbsUrl);
  const url = isAbsolute ? pathOrAbsUrl : apiUrl(pathOrAbsUrl);

  const token = getToken?.() || null;
  const isFormData = options.body instanceof FormData;

  const baseHeaders: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const headers = { ...baseHeaders, ...(options.headers as any) };
  return fetch(url, { ...options, headers, credentials: 'include' });
}

async function tryRefreshAccessToken(): Promise<boolean> {
  try {
    const res = await fetch(apiUrl('/auth/refresh'), {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) return false;
    const data = await res.json().catch(() => null);
    const newAt: string | undefined = data?.accessToken;
    if (!newAt) return false;
    setToken(newAt);
    return true;
  } catch {
    return false;
  }
}

async function fetchWithAuth(pathOrAbsUrl: string, options: RequestInit = {}, tried = false): Promise<any> {
  let res = await coreFetch(pathOrAbsUrl, options);

  if (res.status !== 401) {
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
    }
    if (res.status === 204) return null;
    const text = await res.text().catch(() => '');
    if (!text) return null;
    try { return JSON.parse(text); } catch { return text as any; }
  }

  // 401: intento refresh una sola vez
  if (tried) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP 401: ${text || 'Unauthorized'}`);
  }

  const refreshed = await tryRefreshAccessToken();
  if (!refreshed) {
    setToken(null);
    throw new Error('Sesión expirada');
  }

  res = await coreFetch(pathOrAbsUrl, options);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  }
  if (res.status === 204) return null;
  const text = await res.text().catch(() => '');
  if (!text) return null;
  try { return JSON.parse(text); } catch { return text as any; }
}

/* =========================
   AUTH
   ========================= */
export async function signIn(username: string, password: string) {
  // DEMO: credenciales fijas (sin red)
  if (DEMO_AUTH === 'static') {
    await new Promise((r) => setTimeout(r, 250)); // micro delay para UX
    if (username === 'admin' && password === 'admin') {
      const token = makeFakeJwt({ username: 'admin', sid: 'demo' }, 8 * 3600);
      setToken(token);
      return token;
    }
    throw new Error('Credenciales inválidas (demo: admin/admin)');
  }

  // Producción: flujo normal
  console.info('[auth] DEMO=', import.meta.env.VITE_DEMO, 'DEMO_AUTH=', import.meta.env.VITE_DEMO_AUTH);
  const res = await fetch(apiUrl('/auth/signin'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  }

  const data = await res.json();
  if (!data?.accessToken) throw new Error('No llegó accessToken desde el backend');
  setToken(data.accessToken as string);
  return data.accessToken as string;
}

/* =========================
   API (listas)
   ========================= */
export async function postLista(payload: any, opts?: { saveKey?: string }) {
  if (DEMO) {
    // Validación opcional de clave
    if (DEMO_SAVE_KEY) {
      const provided = (opts?.saveKey || '').trim();
      if (!provided || provided !== DEMO_SAVE_KEY) {
        throw new Error('Clave inválida para guardar (demo)');
      }
    }

    const now = Date.now();
    const nombre = payload?.nombre || payload?.name || undefined;
    const fechaISO = payload?.fechaISO || payload?.fecha || undefined;
    const detalles =
      payload?.detalles ?? payload?.items ?? payload?.contenido ?? undefined;

    // Evitar duplicados por nombre (opcional)
    if (existsByNombre(nombre)) {
      const err = new Error('409 CONFLICT: El nombre de la lista ya existe (demo)');
      (err as any).status = 409;
      throw err;
    }

    const lista: DemoLista = {
      id: nextId(),
      nombre,
      fechaISO,
      detalles,
      payload,
      createdAt: now,
      updatedAt: now,
    };

    const all = readAll();
    all.unshift(lista);
    writeAll(all);

    return lista;
  }

  // Producción
  const headers = opts?.saveKey ? { 'X-Save-Key': opts.saveKey } : undefined;
  return fetchWithAuth('/listas', {
    method: 'POST',
    body: JSON.stringify(payload),
    headers,
  });
}

export async function getListas(params?: Record<string, string>) {
  if (DEMO) {
    let all = readAll();

    // filtros básicos: q (texto) y date (YYYY-MM-DD)
    const q = params?.q?.trim().toLowerCase();
    if (q) {
      all = all.filter(
        (l) =>
          (l.nombre || '').toLowerCase().includes(q) ||
          (l.fechaISO || '').includes(q)
      );
    }
    const date = params?.date?.trim();
    if (date) {
      all = all.filter((l) => (l.fechaISO || '') === date);
    }

    return { items: all, total: all.length };
  }

  const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
  return fetchWithAuth(`/listas${qs}`);
}

export async function deleteLista(id: number) {
  if (DEMO) {
    const all = readAll();
    const idx = all.findIndex((l) => l.id === Number(id));
    if (idx === -1) {
      const err = new Error('404 NOT FOUND (demo)');
      (err as any).status = 404;
      throw err;
    }
    all.splice(idx, 1);
    writeAll(all);
    return { ok: true };
  }

  return fetchWithAuth(`/listas/${id}`, { method: 'DELETE' });
}
