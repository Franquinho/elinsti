-- Script para crear usuarios en la tabla usuarios
-- Ejecutar este script en Supabase SQL Editor

-- Insertar usuarios con IDs específicos
INSERT INTO usuarios (id, nombre, email, rol, activo) 
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'ADMIN', 'admin@elinsti.com', 'admin', true),
  ('00000000-0000-0000-0000-000000000002', 'CAJA', 'caja@elinsti.com', 'caja', true),
  ('00000000-0000-0000-0000-000000000003', 'VENTA1', 'venta1@elinsti.com', 'venta', true)
ON CONFLICT (id) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  email = EXCLUDED.email,
  rol = EXCLUDED.rol,
  activo = EXCLUDED.activo;

-- Verificar usuarios creados
SELECT id, nombre, email, rol, activo FROM usuarios ORDER BY nombre; 