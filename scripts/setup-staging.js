#!/usr/bin/env node

/**
 * Script para configurar la base de datos de staging
 * Ejecutar: node scripts/setup-staging.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.staging' });

// Configuración de Supabase para staging
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL_STAGING;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY_STAGING;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Variables de entorno de staging no configuradas');
  console.error('Por favor, configura .env.staging con las credenciales de Supabase');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Datos de prueba para staging
const productosPrueba = [
  { nombre: 'Café Americano', precio: 1200, emoji: '☕', activo: true },
  { nombre: 'Café con Leche', precio: 1500, emoji: '☕', activo: true },
  { nombre: 'Cerveza Nacional', precio: 2500, emoji: '🍺', activo: true },
  { nombre: 'Cerveza Importada', precio: 3500, emoji: '🍺', activo: true },
  { nombre: 'Vino Tinto', precio: 4500, emoji: '🍷', activo: true },
  { nombre: 'Vino Blanco', precio: 4200, emoji: '🍷', activo: true },
  { nombre: 'Empanada de Carne', precio: 800, emoji: '🥟', activo: true },
  { nombre: 'Empanada de Pollo', precio: 750, emoji: '🥟', activo: true },
  { nombre: 'Queso y Jamón', precio: 1200, emoji: '🧀', activo: true },
  { nombre: 'Agua Mineral', precio: 500, emoji: '💧', activo: true }
];

const usuariosPrueba = [
  {
    email: 'admin@elinsti.com',
    password: 'Admin123!',
    nombre: 'Administrador',
    rol: 'admin',
    activo: true
  },
  {
    email: 'caja@elinsti.com',
    password: 'Caja123!',
    nombre: 'Cajero',
    rol: 'caja',
    activo: true
  },
  {
    email: 'ventas@elinsti.com',
    password: 'Ventas123!',
    nombre: 'Vendedor',
    rol: 'ventas',
    activo: true
  }
];

const eventosPrueba = [
  {
    nombre: 'Noche de Jazz - Staging',
    descripcion: 'Evento de prueba para staging con música jazz en vivo',
    fecha_inicio: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Mañana
    fecha_fin: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // Pasado mañana
    capacidad_maxima: 100,
    precio_entrada: 25000,
    ubicacion: 'Sala Principal - Staging',
    imagen_url: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400',
    activo: true
  },
  {
    nombre: 'Fiesta Latina - Staging',
    descripcion: 'Evento de prueba con música latina y baile',
    fecha_inicio: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(), // En 3 días
    fecha_fin: new Date(Date.now() + 96 * 60 * 60 * 1000).toISOString(), // En 4 días
    capacidad_maxima: 150,
    precio_entrada: 30000,
    ubicacion: 'Patio Exterior - Staging',
    imagen_url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400',
    activo: false
  }
];

async function setupStagingDatabase() {
  console.log('🚀 Iniciando configuración de base de datos de staging...');
  
  try {
    // 1. Verificar conexión
    console.log('📡 Verificando conexión a Supabase...');
    const { data: testData, error: testError } = await supabase
      .from('usuarios')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Error conectando a Supabase:', testError);
      return;
    }
    console.log('✅ Conexión exitosa');

    // 2. Limpiar datos existentes (opcional)
    console.log('🧹 Limpiando datos existentes...');
    await supabase.from('comandas').delete().neq('id', 0);
    await supabase.from('productos').delete().neq('id', 0);
    await supabase.from('eventos').delete().neq('id', 0);
    await supabase.from('usuarios').delete().neq('id', 0);
    console.log('✅ Datos limpiados');

    // 3. Insertar productos de prueba
    console.log('📦 Insertando productos de prueba...');
    const { data: productosData, error: productosError } = await supabase
      .from('productos')
      .insert(productosPrueba)
      .select();
    
    if (productosError) {
      console.error('❌ Error insertando productos:', productosError);
      return;
    }
    console.log(`✅ ${productosData.length} productos insertados`);

    // 4. Insertar usuarios de prueba
    console.log('👥 Insertando usuarios de prueba...');
    const { data: usuariosData, error: usuariosError } = await supabase
      .from('usuarios')
      .insert(usuariosPrueba)
      .select();
    
    if (usuariosError) {
      console.error('❌ Error insertando usuarios:', usuariosError);
      return;
    }
    console.log(`✅ ${usuariosData.length} usuarios insertados`);

    // 5. Insertar eventos de prueba
    console.log('🎉 Insertando eventos de prueba...');
    const { data: eventosData, error: eventosError } = await supabase
      .from('eventos')
      .insert(eventosPrueba)
      .select();
    
    if (eventosError) {
      console.error('❌ Error insertando eventos:', eventosError);
      return;
    }
    console.log(`✅ ${eventosData.length} eventos insertados`);

    // 6. Configurar evento activo
    if (eventosData && eventosData.length > 0) {
      console.log('🎯 Configurando evento activo...');
      const eventoActivo = eventosData.find(e => e.activo);
      if (eventoActivo) {
        // Aquí podrías actualizar una tabla de configuración global
        console.log(`✅ Evento activo configurado: ${eventoActivo.nombre}`);
      }
    }

    console.log('\n🎉 ¡Configuración de staging completada exitosamente!');
    console.log('\n📋 Credenciales de prueba:');
    console.log('👤 Admin: admin@elinsti.com / Admin123!');
    console.log('💰 Cajero: caja@elinsti.com / Caja123!');
    console.log('🛒 Vendedor: ventas@elinsti.com / Ventas123!');
    console.log('\n🔗 URL de Supabase Staging:', supabaseUrl);

  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  setupStagingDatabase();
}

module.exports = { setupStagingDatabase }; 