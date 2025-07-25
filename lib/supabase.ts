import { createClient } from "@supabase/supabase-js";

// Función para obtener las credenciales según el entorno
const getSupabaseConfig = () => {
  const env = process.env.NEXT_PUBLIC_ENV || process.env.NODE_ENV || 'development';
  
  console.log(`🔧 Configurando Supabase para entorno: ${env}`);
  
  // Configuración para producción
  if (env === 'production') {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    console.log('🔧 Variables de entorno detectadas:', {
      url: url ? '✅ Configurada' : '❌ No configurada',
      anonKey: anonKey ? '✅ Configurada' : '❌ No configurada',
      serviceKey: serviceKey ? '✅ Configurada' : '❌ No configurada'
    });
    
    return { url, anonKey, serviceKey };
  }
  
  // Configuración para otros entornos
  switch (env) {
    case 'staging':
      return {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL_STAGING || process.env.NEXT_PUBLIC_SUPABASE_URL,
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_STAGING || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY_STAGING || process.env.SUPABASE_SERVICE_ROLE_KEY,
      };
    case 'development':
    default:
      return {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL_DEV || process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_DEV || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key",
        serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY_DEV || process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-service-key",
      };
  }
};

const config = getSupabaseConfig();

// Validación de configuración
if (!config.url || config.url.includes('placeholder')) {
  console.warn('⚠️  Configuración de Supabase no encontrada. Usando valores por defecto.');
}

if (!config.anonKey || config.anonKey.includes('placeholder')) {
  console.warn('⚠️  Clave anónima de Supabase no encontrada. Usando valores por defecto.');
}

// Función para crear cliente de Supabase de forma segura
const createSupabaseClient = (url: string, key: string, options?: any) => {
  try {
    // Durante el build time, usar valores por defecto si no están disponibles
    if (typeof window === 'undefined' && (!url || !key || url.includes('placeholder') || key.includes('placeholder'))) {
      console.warn('⚠️  Build time: Usando cliente dummy para Supabase');
      return {
        from: () => ({
          select: () => Promise.resolve({ data: null, error: { message: 'Build time - cliente no disponible' } }),
          insert: () => Promise.resolve({ data: null, error: { message: 'Build time - cliente no disponible' } }),
          update: () => Promise.resolve({ data: null, error: { message: 'Build time - cliente no disponible' } }),
          delete: () => Promise.resolve({ data: null, error: { message: 'Build time - cliente no disponible' } }),
        }),
        auth: {
          signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Build time - cliente no disponible' } }),
          signUp: () => Promise.resolve({ data: null, error: { message: 'Build time - cliente no disponible' } }),
          signOut: () => Promise.resolve({ error: { message: 'Build time - cliente no disponible' } }),
        }
      } as any;
    }
    
    if (!url || !key || url.includes('placeholder') || key.includes('placeholder')) {
      console.error('❌ Configuración de Supabase incompleta:', { url: !!url, key: !!key });
      throw new Error('Configuración de Supabase incompleta');
    }
    return createClient(url, key, options);
  } catch (error) {
    console.error('❌ Error creando cliente de Supabase:', error);
    throw error;
  }
};

// Cliente para operaciones del frontend (con RLS)
export const supabase = createSupabaseClient(config.url, config.anonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Cliente admin para operaciones del backend (bypass RLS)
export const supabaseAdmin = createSupabaseClient(config.url, config.serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Función para verificar la conexión
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('usuarios').select('count').limit(1);
    if (error) {
      console.error('❌ Error conectando a Supabase:', error);
      return false;
    }
    console.log('✅ Conexión a Supabase exitosa');
    return true;
  } catch (error) {
    console.error('❌ Error inesperado conectando a Supabase:', error);
    return false;
  }
};
