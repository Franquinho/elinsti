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

// Cliente dummy más robusto
const createDummyClient = () => {
  const dummyResponse = { data: null, error: { message: 'Cliente no configurado' } };
  const dummyAuthResponse = { data: null, error: { message: 'Cliente no configurado' } };
  
  return {
    from: (table: string) => ({
      select: (columns?: string) => ({
        eq: (column: string, value: any) => Promise.resolve(dummyResponse),
        order: (column: string, options?: any) => Promise.resolve(dummyResponse),
        limit: (count: number) => Promise.resolve(dummyResponse),
        single: () => Promise.resolve(dummyResponse),
        then: (callback: any) => Promise.resolve(dummyResponse).then(callback),
      }),
      insert: (data: any) => Promise.resolve(dummyResponse),
      update: (data: any) => ({
        eq: (column: string, value: any) => Promise.resolve(dummyResponse),
        then: (callback: any) => Promise.resolve(dummyResponse).then(callback),
      }),
      delete: () => ({
        eq: (column: string, value: any) => Promise.resolve(dummyResponse),
        then: (callback: any) => Promise.resolve(dummyResponse).then(callback),
      }),
      then: (callback: any) => Promise.resolve(dummyResponse).then(callback),
    }),
    auth: {
      signInWithPassword: (credentials: any) => Promise.resolve(dummyAuthResponse),
      signUp: (credentials: any) => Promise.resolve(dummyAuthResponse),
      signOut: () => Promise.resolve({ error: { message: 'Cliente no configurado' } }),
      getSession: () => Promise.resolve(dummyAuthResponse),
      getUser: () => Promise.resolve(dummyAuthResponse),
    },
    rpc: (func: string, params?: any) => Promise.resolve(dummyResponse),
  };
};

// Función para crear cliente de Supabase de forma segura
const createSupabaseClient = (url: string, key: string, options?: any) => {
  try {
    // Durante el build time o si no hay configuración válida, usar cliente dummy
    if (typeof window === 'undefined' && (!url || !key || url.includes('placeholder') || key.includes('placeholder'))) {
      console.warn('⚠️  Build time: Usando cliente dummy para Supabase');
      return createDummyClient();
    }
    
    // En runtime, si no hay configuración válida, usar cliente dummy
    if (!url || !key || url.includes('placeholder') || key.includes('placeholder')) {
      console.warn('⚠️  Runtime: Usando cliente dummy para Supabase');
      return createDummyClient();
    }
    
    return createClient(url, key, options);
  } catch (error) {
    console.error('❌ Error creando cliente de Supabase:', error);
    return createDummyClient();
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
