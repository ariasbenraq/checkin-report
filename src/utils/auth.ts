import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.session) {
    throw new Error("Supabase no devolvió una sesión activa.");
  }

  return data.session;
}

export async function signOut() {
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

