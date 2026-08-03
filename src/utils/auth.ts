import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { logAppEvent } from "./logger";

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      await logAppEvent({
        action: "login_failure",
        details: { email, error: error.message },
      });
      throw new Error(error.message);
    }

    if (!data.session) {
      await logAppEvent({
        action: "login_failure",
        details: { email, error: "No session returned" },
      });
      throw new Error("Supabase no devolvió una sesión activa.");
    }

    await logAppEvent({
      action: "login_success",
      details: { email },
    });

    return data.session;
  } catch (err) {
    if (err instanceof Error && err.message !== "Supabase no devolvió una sesión activa.") {
      await logAppEvent({
        action: "login_failure",
        details: { email, error: String(err) },
      });
    }
    throw err;
  }
}

export async function signOut() {
  await logAppEvent({ action: "logout" });
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
}

export async function getSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    throw new Error(error.message);
  }
  return data.session ?? null;
}

export async function getAccessToken(): Promise<string | null> {
  const session = await getSession();
  return session?.access_token ?? null;
}

export async function getCurrentUser(): Promise<User | null> {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    throw new Error(error.message);
  }
  return data.user ?? null;
}

export function getDisplayName(user: User | null): string {
  if (!user) return "Usuario";
  return (
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email ||
    "Usuario"
  );
}

export function isSessionExpired(session: Session): boolean {
  const expiresAt = session.expires_at ?? 0;
  return Date.now() / 1000 > expiresAt;
}

