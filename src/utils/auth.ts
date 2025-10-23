// src/utils/auth.ts
export function signOut() {
    localStorage.removeItem("accessToken");
    // vuelve a la pantalla de login (AuthLanding)
    window.location.assign("/");
}

export function getToken(): string | null {
    return localStorage.getItem("accessToken");
}

// opcional: leer username del JWT si tu payload tiene { username }
export function getUsernameFromToken(token = getToken() || ""): string | null {
    try {
        const [, payload] = token.split(".");
        const json = JSON.parse(atob(payload));
        return json?.username ?? null;
    } catch {
        return null;
    }
}
