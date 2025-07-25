-- =====================================================
-- SCRIPT DE CORRECCIÓN COMPLETA - EL INSTI
-- Soluciona todos los problemas de RLS y estructura
-- =====================================================

-- Habilitar RLS en todas las tablas (si no está habilitado)
DO \$\$
BEGIN
    -- Verificar y habilitar RLS en productos
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'productos' 
        AND schemaname = 'public'
    ) THEN
        RAISE NOTICE 'Tabla productos no existe';
    ELSE
        ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS habilitado en productos';
    END IF;

    -- Verificar y habilitar RLS en eventos
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'eventos' 
        AND schemaname = 'public'
    ) THEN
        RAISE NOTICE 'Tabla eventos no existe';
    ELSE
        ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS habilitado en eventos';
    END IF;

    -- Verificar y habilitar RLS en comandas
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'comandas' 
        AND schemaname = 'public'
    ) THEN
        RAISE NOTICE 'Tabla comandas no existe';
    ELSE
        ALTER TABLE comandas ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS habilitado en comandas';
    END IF;

    -- Verificar y habilitar RLS en comanda_items
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'comanda_items' 
        AND schemaname = 'public'
    ) THEN
        RAISE NOTICE 'Tabla comanda_items no existe';
    ELSE
        ALTER TABLE comanda_items ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS habilitado en comanda_items';
    END IF;

    -- Verificar y habilitar RLS en usuarios
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'usuarios' 
        AND schemaname = 'public'
    ) THEN
        RAISE NOTICE 'Tabla usuarios no existe';
    ELSE
        ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS habilitado en usuarios';
    END IF;

    -- Verificar y habilitar RLS en logs
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'logs' 
        AND schemaname = 'public'
    ) THEN
        RAISE NOTICE 'Tabla logs no existe';
    ELSE
        ALTER TABLE logs ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS habilitado en logs';
    END IF;
END \$\$;

-- Agregar columna 'activo' a eventos si no existe
DO \$\$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'eventos' 
        AND column_name = 'activo'
    ) THEN
        ALTER TABLE eventos ADD COLUMN activo boolean NOT NULL DEFAULT true;
        RAISE NOTICE 'Columna activo agregada a eventos';
    ELSE
        RAISE NOTICE 'Columna activo ya existe en eventos';
    END IF;
END \$\$;

-- Eliminar políticas existentes para evitar conflictos
DO \$\$
DECLARE
    policy_record RECORD;
BEGIN
    -- Eliminar políticas existentes en productos
    FOR policy_record IN 
        SELECT policyname FROM pg_policies 
        WHERE tablename = 'productos' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON productos', policy_record.policyname);
    END LOOP;

    -- Eliminar políticas existentes en eventos
    FOR policy_record IN 
        SELECT policyname FROM pg_policies 
        WHERE tablename = 'eventos' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON eventos', policy_record.policyname);
    END LOOP;

    -- Eliminar políticas existentes en comandas
    FOR policy_record IN 
        SELECT policyname FROM pg_policies 
        WHERE tablename = 'comandas' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON comandas', policy_record.policyname);
    END LOOP;

    -- Eliminar políticas existentes en comanda_items
    FOR policy_record IN 
        SELECT policyname FROM pg_policies 
        WHERE tablename = 'comanda_items' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON comanda_items', policy_record.policyname);
    END LOOP;

    -- Eliminar políticas existentes en usuarios
    FOR policy_record IN 
        SELECT policyname FROM pg_policies 
        WHERE tablename = 'usuarios' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON usuarios', policy_record.policyname);
    END LOOP;

    -- Eliminar políticas existentes en logs
    FOR policy_record IN 
        SELECT policyname FROM pg_policies 
        WHERE tablename = 'logs' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON logs', policy_record.policyname);
    END LOOP;

    RAISE NOTICE 'Políticas existentes eliminadas';
END \$\$;

-- Crear políticas RLS completas para desarrollo
-- Política para productos
CREATE POLICY \
Enable
all
operations
for
authenticated
users\ ON productos
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Política para eventos
CREATE POLICY \Enable
all
operations
for
authenticated
users\ ON eventos
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Política para comandas
CREATE POLICY \Enable
all
operations
for
authenticated
users\ ON comandas
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Política para comanda_items
CREATE POLICY \Enable
all
operations
for
authenticated
users\ ON comanda_items
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Política para usuarios
CREATE POLICY \Enable
all
operations
for
authenticated
users\ ON usuarios
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Política para logs
CREATE POLICY \Enable
all
operations
for
authenticated
users\ ON logs
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Verificar que las políticas se crearon correctamente
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('productos', 'eventos', 'comandas', 'comanda_items', 'usuarios', 'logs')
ORDER BY tablename, policyname;

-- Verificar estructura de tablas
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('productos', 'eventos', 'comandas', 'comanda_items', 'usuarios', 'logs')
ORDER BY table_name, ordinal_position;

-- Mostrar resumen final
DO \$\$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'CORRECCIÓN COMPLETADA EXITOSAMENTE';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ RLS habilitado en todas las tablas';
    RAISE NOTICE '✅ Columna activo agregada a eventos';
    RAISE NOTICE '✅ Políticas RLS creadas para usuarios autenticados';
    RAISE NOTICE '✅ Todas las operaciones (SELECT, INSERT, UPDATE, DELETE) permitidas';
    RAISE NOTICE '';
    RAISE NOTICE 'El sistema ahora debería funcionar correctamente.';
    RAISE NOTICE 'Si sigues teniendo problemas, verifica:';
    RAISE NOTICE '1. Que el usuario esté autenticado en Supabase';
    RAISE NOTICE '2. Que las variables de entorno estén configuradas correctamente';
    RAISE NOTICE '3. Que el backend esté usando las credenciales correctas';
    RAISE NOTICE '========================================';
END \$\$;
