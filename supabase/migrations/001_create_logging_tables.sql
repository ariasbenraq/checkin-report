-- =====================================================
-- Script SQL CORREGIDO v2 - Usa auth.jwt() en vez de subquery
-- Ejecutar en el SQL Editor de Supabase Dashboard
-- =====================================================

-- Eliminar políticas y tablas existentes
DROP POLICY IF EXISTS "app_logs_insert" ON app_logs;
DROP POLICY IF EXISTS "app_logs_select_admin" ON app_logs;
DROP POLICY IF EXISTS "pdf_logs_insert" ON pdf_processing_logs;
DROP POLICY IF EXISTS "pdf_logs_select_admin" ON pdf_processing_logs;
DROP POLICY IF EXISTS "error_logs_insert" ON error_logs;
DROP POLICY IF EXISTS "error_logs_select_admin" ON error_logs;

ALTER TABLE app_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE pdf_processing_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs DISABLE ROW LEVEL SECURITY;

DROP TABLE IF EXISTS app_logs;
DROP TABLE IF EXISTS pdf_processing_logs;
DROP TABLE IF EXISTS error_logs;

-- =====================================================
-- Recrear tablas
-- =====================================================

CREATE TABLE app_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE pdf_processing_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  file_name TEXT,
  status TEXT CHECK (status IN ('success', 'error')),
  rows_processed INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE error_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  error_type TEXT,
  error_message TEXT,
  stack_trace TEXT,
  component TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- Habilitar RLS
-- =====================================================
ALTER TABLE app_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pdf_processing_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Políticas RLS v2 - usa auth.jwt() en vez de subquery
-- =====================================================

-- app_logs
CREATE POLICY "app_logs_insert" ON app_logs
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "app_logs_select_admin" ON app_logs
  FOR SELECT
  USING ((auth.jwt() ->> 'email') = 'admin@cdv.com');

-- pdf_processing_logs
CREATE POLICY "pdf_logs_insert" ON pdf_processing_logs
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "pdf_logs_select_admin" ON pdf_processing_logs
  FOR SELECT
  USING ((auth.jwt() ->> 'email') = 'admin@cdv.com');

-- error_logs
CREATE POLICY "error_logs_insert" ON error_logs
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "error_logs_select_admin" ON error_logs
  FOR SELECT
  USING ((auth.jwt() ->> 'email') = 'admin@cdv.com');

-- =====================================================
-- Índices
-- =====================================================
CREATE INDEX idx_app_logs_created_at ON app_logs(created_at DESC);
CREATE INDEX idx_app_logs_action ON app_logs(action);
CREATE INDEX idx_pdf_logs_created_at ON pdf_processing_logs(created_at DESC);
CREATE INDEX idx_pdf_logs_status ON pdf_processing_logs(status);
CREATE INDEX idx_error_logs_created_at ON error_logs(created_at DESC);
CREATE INDEX idx_error_logs_type ON error_logs(error_type);
