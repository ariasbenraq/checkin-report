import { supabase } from "../lib/supabase";
import { getCurrentUser } from "./auth";

export type LogAction =
  | "pdf_upload"
  | "pdf_process_start"
  | "pdf_process_success"
  | "pdf_process_error"
  | "admin_view"
  | "app_error";

interface LogEntry {
  action: LogAction;
  details?: Record<string, unknown>;
}

async function getUserId(): Promise<string | null> {
  try {
    const user = await getCurrentUser();
    return user?.id ?? null;
  } catch {
    return null;
  }
}

export async function logAppEvent(entry: LogEntry): Promise<void> {
  try {
    const userId = await getUserId();
    const { error } = await supabase.from("app_logs").insert({
      user_id: userId,
      action: entry.action,
      details: entry.details ?? {},
    });

    if (error) {
      console.error("[Logger] Error al registrar evento:", error.message);
    }
  } catch (err) {
    console.error("[Logger] Error inesperado:", err);
  }
}

export async function logPdfProcessing(params: {
  fileName: string;
  status: "success" | "error";
  rowsProcessed?: number;
  errorMessage?: string;
}): Promise<void> {
  try {
    const userId = await getUserId();
    const { error } = await supabase.from("pdf_processing_logs").insert({
      user_id: userId,
      file_name: params.fileName,
      status: params.status,
      rows_processed: params.rowsProcessed ?? 0,
      error_message: params.errorMessage ?? null,
    });

    if (error) {
      console.error("[Logger] Error al registrar procesamiento PDF:", error.message);
    }
  } catch (err) {
    console.error("[Logger] Error inesperado:", err);
  }
}

export async function logError(params: {
  errorType: string;
  errorMessage: string;
  stackTrace?: string;
  component?: string;
}): Promise<void> {
  try {
    const userId = await getUserId();
    const { error } = await supabase.from("error_logs").insert({
      user_id: userId,
      error_type: params.errorType,
      error_message: params.errorMessage,
      stack_trace: params.stackTrace ?? null,
      component: params.component ?? null,
    });

    if (error) {
      console.error("[Logger] Error al registrar error:", error.message);
    }
  } catch (err) {
    console.error("[Logger] Error inesperado:", err);
  }
}

export interface AppLog {
  id: string;
  user_id: string;
  action: string;
  details: Record<string, unknown>;
  created_at: string;
}

export interface PdfProcessingLog {
  id: string;
  user_id: string;
  file_name: string;
  status: "success" | "error";
  rows_processed: number;
  error_message: string | null;
  created_at: string;
}

export interface ErrorLog {
  id: string;
  user_id: string;
  error_type: string;
  error_message: string;
  stack_trace: string | null;
  component: string | null;
  created_at: string;
}

export async function fetchAppLogs(limit = 50): Promise<AppLog[]> {
  const { data, error } = await supabase
    .from("app_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[Logger] Error al obtener logs:", error.message);
    return [];
  }
  return data ?? [];
}

export async function fetchPdfProcessingLogs(limit = 50): Promise<PdfProcessingLog[]> {
  const { data, error } = await supabase
    .from("pdf_processing_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[Logger] Error al obtener logs de PDF:", error.message);
    return [];
  }
  return data ?? [];
}

export async function fetchErrorLogs(limit = 50): Promise<ErrorLog[]> {
  const { data, error } = await supabase
    .from("error_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[Logger] Error al obtener logs de errores:", error.message);
    return [];
  }
  return data ?? [];
}

export async function fetchPdfStats(): Promise<{
  total: number;
  success: number;
  error: number;
}> {
  const { data, error } = await supabase
    .from("pdf_processing_logs")
    .select("status");

  if (error || !data) {
    return { total: 0, success: 0, error: 0 };
  }

  return {
    total: data.length,
    success: data.filter((r) => r.status === "success").length,
    error: data.filter((r) => r.status === "error").length,
  };
}

export async function fetchRecentErrors(limit = 10): Promise<ErrorLog[]> {
  const { data, error } = await supabase
    .from("error_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return [];
  }
  return data ?? [];
}
