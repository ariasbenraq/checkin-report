// src/api/client.ts
const RAW_BASE = import.meta.env.VITE_API_URL;
if (!RAW_BASE) {
  console.warn('VITE_API_URL no está definida. Usando fallback local...');
}

// ✅ define una sola vez
const BASE = (RAW_BASE || 'http://localhost:3000').replace(/\/+$/, '');
const AUTH_BASE = `${BASE}/auth`;

function apiUrl(path: string) {
    return `${BASE}/${String(path || '').replace(/^\/+/, '')}`;
}

/* =========================
   AUTH STATE (access token)
   ========================= */
export function getToken() {
    return localStorage.getItem("accessToken");
}
export function setToken(t: string | null) {
    if (t) localStorage.setItem("accessToken", t);
    else localStorage.removeItem("accessToken");
}

export function getUsernameFromToken(token?: string): string | null {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length < 2) return null;
    try {
        const payloadJson = base64UrlDecode(parts[1]);
        const payload = JSON.parse(payloadJson);
        // nuestro payload trae { username, sid }
        return payload?.username ?? payload?.sub ?? null;
    } catch {
        return null;
    }
}

export async function signOut(opts?: { redirect?: string | null }) {
    try {
        await fetch(`${AUTH_BASE}/logout`, {
            method: 'POST',
            credentials: 'include', // para que viaje la cookie rt
        });
    } catch {
        // ignoramos errores de red al cerrar sesión
    } finally {
        setToken(null);
        if (opts?.redirect !== null) {
            // por defecto redirige a /login
            window.location.href = opts?.redirect || '/login';
        }
    }
}

/* ===== helpers ===== */
function base64UrlDecode(s: string): string {
    // convierte base64url -> base64 y decodifica
    let b64 = s.replace(/-/g, '+').replace(/_/g, '/');
    const pad = b64.length % 4 ? 4 - (b64.length % 4) : 0;
    if (pad) b64 += '='.repeat(pad);
    return atob(b64);
}

/* =========================
   CORE FETCH with auto-refresh
   ========================= */
async function coreFetch(input: string, options: RequestInit = {}) {
    const token = getToken();
    const isFormData = options.body instanceof FormData;

    const baseHeaders: Record<string, string> = {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    const headers = { ...baseHeaders, ...(options.headers as any) };

    // MUY IMPORTANTE: credenciales para que viaje la cookie HTTP-only del refresh
    return fetch(input, { ...options, headers, credentials: 'include' });
}

async function tryRefreshAccessToken(): Promise<boolean> {
    const res = await fetch(apiUrl('/auth/refresh'), {
        method: 'POST',
        credentials: 'include',        // traer/enviar cookie rt
    });
    if (!res.ok) return false;
    const data = await res.json().catch(() => null);
    const newAt: string | undefined = data?.accessToken;
    if (!newAt) return false;
    setToken(newAt);
    return true;
}

// Wrapper común para incluir Authorization y reintentar si 401
async function fetchWithAuth(pathOrAbsUrl: string, options: RequestInit = {}, tried = false): Promise<any> {
    const isAbsolute = /^https?:\/\//i.test(pathOrAbsUrl);
    const url = isAbsolute ? pathOrAbsUrl : apiUrl(pathOrAbsUrl);

    let res = await coreFetch(url, options);

    // Si no es 401, manejo estándar de respuesta como ya tenías
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

    // 401: intento de refresh una sola vez
    if (tried) {
        const text = await res.text().catch(() => '');
        throw new Error(`HTTP 401: ${text || 'Unauthorized'}`);
    }

    const refreshed = await tryRefreshAccessToken();
    if (!refreshed) {
        setToken(null);
        // opcional: redirigir a login aquí si quieres
        // window.location.href = '/login';
        throw new Error('Sesión expirada');
    }

    // reintento una vez con el nuevo access token
    res = await coreFetch(url, options);
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
   API
   ========================= */

export function postLista(payload: any, opts?: { saveKey?: string }) {
    const headers = opts?.saveKey ? { 'X-Save-Key': opts.saveKey } : undefined;
    return fetchWithAuth('/listas', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers,
    });
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
    // aquí también enviamos credenciales para que el backend setee la cookie rt
    const res = await fetch(apiUrl('/auth/signin'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include',  // <-- NECESARIO para recibir la cookie
    });

    if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
    }

    const data = await res.json(); // { accessToken: '...' }
    if (!data?.accessToken) throw new Error('No llegó accessToken desde el backend');

    // guardamos el access token
    setToken(data.accessToken as string);
    return data.accessToken as string;
}


