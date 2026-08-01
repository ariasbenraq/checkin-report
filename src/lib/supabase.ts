import { createClient } from "@supabase/supabase-js";
import type { AreaResumen } from "../features/checkins/types/resumen";
import type { ServiceKey } from "../features/checkins/constants";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Faltan VITE_SUPABASE_URL y/o VITE_SUPABASE_ANON_KEY en las variables de entorno."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export interface Report {
  id: string;
  service_data: Record<ServiceKey, AreaResumen[]>;
  created_at: string;
}

export async function uploadReport(
  serviceData: Record<ServiceKey, AreaResumen[]>
): Promise<Report | null> {
  const { data, error } = await supabase
    .from("reports")
    .insert({ service_data: serviceData })
    .select()
    .single();

  if (error) {
    console.error("Error uploading report:", error);
    return null;
  }
  return data as Report;
}

export async function fetchReports(): Promise<Report[]> {
  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching reports:", error);
    return [];
  }
  return (data ?? []) as Report[];
}

export async function deleteReport(id: string): Promise<boolean> {
  const { error } = await supabase.from("reports").delete().eq("id", id);
  if (error) {
    console.error("Error deleting report:", error);
    return false;
  }
  return true;
}
