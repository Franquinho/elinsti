-- MIGRACIÓN INCREMENTAL PARA EL INSTI POS - AJUSTE DESDE ESTRUCTURA ACTUAL

-- =========================
-- USUARIOS
-- =========================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='usuarios' AND column_name='password') THEN
    ALTER TABLE usuarios ADD COLUMN password varchar;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='usuarios' AND column_name='updated_at') THEN
    ALTER TABLE usuarios ADD COLUMN updated_at timestamp with time zone DEFAULT now();
  END IF;
END$$;

-- =========================
-- EVENTOS
-- =========================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='eventos' AND column_name='fecha_inicio') THEN
    ALTER TABLE eventos ADD COLUMN fecha_inicio timestamp with time zone;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='eventos' AND column_name='fecha_fin') THEN
    ALTER TABLE eventos ADD COLUMN fecha_fin timestamp with time zone;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='eventos' AND column_name='descripcion') THEN
    ALTER TABLE eventos ADD COLUMN descripcion text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='eventos' AND column_name='capacidad_maxima') THEN
    ALTER TABLE eventos ADD COLUMN capacidad_maxima integer;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='eventos' AND column_name='precio_entrada') THEN
    ALTER TABLE eventos ADD COLUMN precio_entrada numeric DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='eventos' AND column_name='ubicacion') THEN
    ALTER TABLE eventos ADD COLUMN ubicacion varchar;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='eventos' AND column_name='imagen_url') THEN
    ALTER TABLE eventos ADD COLUMN imagen_url text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='eventos' AND column_name='updated_at') THEN
    ALTER TABLE eventos ADD COLUMN updated_at timestamp with time zone DEFAULT now();
  END IF;
END$$;

-- =========================
-- PRODUCTOS
-- =========================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='productos' AND column_name='updated_at') THEN
    ALTER TABLE productos ADD COLUMN updated_at timestamp with time zone DEFAULT now();
  END IF;
END$$;

-- =========================
-- COMANDAS
-- =========================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='comandas' AND column_name='created_at') THEN
    ALTER TABLE comandas ADD COLUMN created_at timestamp with time zone DEFAULT now();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='comandas' AND column_name='updated_at') THEN
    ALTER TABLE comandas ADD COLUMN updated_at timestamp with time zone DEFAULT now();
  END IF;
END$$;

-- =========================
-- CAJA (crear si no existe)
-- =========================
CREATE TABLE IF NOT EXISTS caja (
  id serial primary key,
  evento_id int references eventos(id) on delete set null,
  usuario_id int references usuarios(id) on delete set null,
  tipo_operacion varchar not null, -- 'apertura', 'cierre', 'venta', 'cancelacion'
  monto numeric not null,
  metodo_pago varchar,
  descripcion text,
  created_at timestamp with time zone default now()
);

-- =========================
-- LOGS
-- =========================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='logs' AND column_name='updated_at') THEN
    ALTER TABLE logs ADD COLUMN updated_at timestamp with time zone DEFAULT now();
  END IF;
END$$;

-- =========================
-- ÍNDICES ÚTILES
-- =========================
CREATE INDEX IF NOT EXISTS idx_comandas_evento_id ON comandas(evento_id);
CREATE INDEX IF NOT EXISTS idx_comandas_usuario_id ON comandas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_comandas_estado ON comandas(estado);
CREATE INDEX IF NOT EXISTS idx_comanda_items_comanda_id ON comanda_items(comanda_id);
CREATE INDEX IF NOT EXISTS idx_comanda_items_producto_id ON comanda_items(producto_id);
CREATE INDEX IF NOT EXISTS idx_caja_evento_id ON caja(evento_id);
CREATE INDEX IF NOT EXISTS idx_caja_usuario_id ON caja(usuario_id);
CREATE INDEX IF NOT EXISTS idx_logs_usuario_id ON logs(usuario_id);

-- =========================
-- TRIGGERS updated_at
-- =========================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_usuarios_updated_at') THEN
    CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_eventos_updated_at') THEN
    CREATE TRIGGER update_eventos_updated_at BEFORE UPDATE ON eventos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_productos_updated_at') THEN
    CREATE TRIGGER update_productos_updated_at BEFORE UPDATE ON productos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_comandas_updated_at') THEN
    CREATE TRIGGER update_comandas_updated_at BEFORE UPDATE ON comandas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_logs_updated_at') THEN
    CREATE TRIGGER update_logs_updated_at BEFORE UPDATE ON logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END$$;

-- =========================
-- RLS Y POLÍTICAS DE DESARROLLO
-- =========================
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE comandas ENABLE ROW LEVEL SECURITY;
ALTER TABLE comanda_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE caja ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Allow all for dev" ON usuarios FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "Allow all for dev" ON eventos FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "Allow all for dev" ON productos FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "Allow all for dev" ON comandas FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "Allow all for dev" ON comanda_items FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "Allow all for dev" ON caja FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "Allow all for dev" ON logs FOR ALL USING (true);

-- =========================
-- FIN DE LA MIGRACIÓN INCREMENTAL
-- ========================= 