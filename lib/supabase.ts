import { createClient } from "@supabase/supabase-js";

// Función para obtener las credenciales según el entorno
const getSupabaseConfig = () => {
  const env = process.env.NEXT_PUBLIC_ENV || process.env.NODE_ENV || 'development';
  
  console.log(`🔧 Configurando Supabase para entorno: ${env}`);
  
  switch (env) {
    case 'staging':
      return {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL_STAGING || process.env.NEXT_PUBLIC_SUPABASE_URL,
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_STAGING || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY_STAGING || process.env.SUPABASE_SERVICE_ROLE_KEY,
      };
    case 'production':
      return {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL_PROD || process.env.NEXT_PUBLIC_SUPABASE_URL,
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_PROD || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY_PROD || process.env.SUPABASE_SERVICE_ROLE_KEY,
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
    if (!url || !key || url.includes('placeholder') || key.includes('placeholder')) {
      throw new Error('Configuración de Supabase incompleta');
    }
    return createClient(url, key, options);
  } catch (error) {
    console.error('❌ Error creando cliente de Supabase:', error);
    // Retornar un cliente dummy que no hará nada
    return {
      from: () => ({
        select: () => Promise.resolve({ data: null, error: { message: 'Cliente no configurado' } }),
        insert: () => Promise.resolve({ data: null, error: { message: 'Cliente no configurado' } }),
        update: () => Promise.resolve({ data: null, error: { message: 'Cliente no configurado' } }),
        delete: () => Promise.resolve({ data: null, error: { message: 'Cliente no configurado' } }),
      }),
      auth: {
        signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Cliente no configurado' } }),
        signUp: () => Promise.resolve({ data: null, error: { message: 'Cliente no configurado' } }),
        signOut: () => Promise.resolve({ error: { message: 'Cliente no configurado' } }),
      }
    } as any;
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
