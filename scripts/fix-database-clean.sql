-- =====================================================
-- SCRIPT DE CORRECCIÓN LIMPIO - EL INSTI
-- Soluciona problemas de RLS y estructura
-- =====================================================

-- Habilitar RLS en todas las tablas
DO \$\$
BEGIN
    -- Habilitar RLS en productos
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'productos' AND schemaname = 'public') THEN
        ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS habilitado en productos';
    END IF;

    -- Habilitar RLS en eventos
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'eventos' AND schemaname = 'public') THEN
        ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS habilitado en eventos';
    END IF;

    -- Habilitar RLS en comandas
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'comandas' AND schemaname = 'public') THEN
        ALTER TABLE comandas ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS habilitado en comandas';
    END IF;

    -- Habilitar RLS en comanda_items
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'comanda_items' AND schemaname = 'public') THEN
        ALTER TABLE comanda_items ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS habilitado en comanda_items';
    END IF;

    -- Habilitar RLS en usuarios
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'usuarios' AND schemaname = 'public') THEN
        ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS habilitado en usuarios';
    END IF;

    -- Habilitar RLS en logs
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'logs' AND schemaname = 'public') THEN
        ALTER TABLE logs ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS habilitado en logs';
    END IF;
END \$\$;

-- Eliminar políticas existentes para evitar conflictos
DO \$\$
DECLARE
    policy_record RECORD;
BEGIN
    -- Eliminar políticas existentes en todas las tablas
    FOR policy_record IN 
        SELECT tablename, policyname FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename IN ('productos', 'eventos', 'comandas', 'comanda_items', 'usuarios', 'logs')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', policy_record.policyname, policy_record.tablename);
    END LOOP;
    RAISE NOTICE 'Políticas existentes eliminadas';
END \$\$;

-- Crear políticas RLS para usuarios autenticados
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

CREATE POLICY \Enable
all
operations
for
authenticated
users\ ON eventos
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY \Enable
all
operations
for
authenticated
users\ ON comandas
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY \Enable
all
operations
for
authenticated
users\ ON comanda_items
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY \Enable
all
operations
for
authenticated
users\ ON usuarios
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY \Enable
all
operations
for
authenticated
users\ ON logs
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Verificar políticas creadas
SELECT 
    tablename,
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('productos', 'eventos', 'comandas', 'comanda_items', 'usuarios', 'logs')
ORDER BY tablename;

-- Mostrar resumen
DO \$\$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'CORRECCIÓN COMPLETADA EXITOSAMENTE';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ RLS habilitado en todas las tablas';
    RAISE NOTICE '✅ Políticas RLS creadas para usuarios autenticados';
    RAISE NOTICE '✅ Todas las operaciones permitidas';
    RAISE NOTICE '';
    RAISE NOTICE 'El sistema ahora debería funcionar correctamente.';
    RAISE NOTICE '========================================';
END \$\$;
