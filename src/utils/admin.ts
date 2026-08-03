import { getCurrentUser } from "./auth";

const ADMIN_EMAIL = "admin@cdv.com";

export async function isAdmin(): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    const result = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
    console.log("[Admin] email:", user?.email, "| isAdmin:", result);
    return result;
  } catch (e) {
    console.error("[Admin] error:", e);
    return false;
  }
}

export async function requireAdmin(): Promise<boolean> {
  const admin = await isAdmin();
  if (!admin) {
    throw new Error("Acceso denegado: se requieren permisos de administrador.");
  }
  return true;
}
