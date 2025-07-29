import { createClient } from "@supabase/supabase-js";
import type {
  SupabaseConfig,
  SupabaseOptions,
  SupabaseCredentials,
  SupabaseAuthResponse,
  SupabaseResponse,
  SupabaseClient,
  DummyResponse,
  DummyAuthResponse,
  DummyClient,
  SupabaseCallback,
  SupabaseAuthCallback
} from "./types";

// Función para limpiar variables de entorno
const cleanEnvVar = (value: string | undefined): string | undefined => {
  if (!value) return undefined;
  return value.trim().replace(/^["']|["']$/g, '').replace(/\r?\n/g, '');
};

// Función para obtener las credenciales según el entorno
const getSupabaseConfig = () => {
  const env = process.env.NEXT_PUBLIC_ENV || process.env.NODE_ENV || 'development';
  
  console.log(`🔧 Configurando Supabase para entorno: ${env}`);
  
  // Configuración para producción
  if (env === 'production') {
    const url = cleanEnvVar(process.env.NEXT_PUBLIC_SUPABASE_URL);
    const anonKey = cleanEnvVar(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    const serviceKey = cleanEnvVar(process.env.SUPABASE_SERVICE_ROLE_KEY);
    
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
        url: cleanEnvVar(process.env.NEXT_PUBLIC_SUPABASE_URL_STAGING || process.env.NEXT_PUBLIC_SUPABASE_URL),
        anonKey: cleanEnvVar(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_STAGING || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
        serviceKey: cleanEnvVar(process.env.SUPABASE_SERVICE_ROLE_KEY_STAGING || process.env.SUPABASE_SERVICE_ROLE_KEY),
      };
    case 'development':
    default:
      return {
        url: cleanEnvVar(process.env.NEXT_PUBLIC_SUPABASE_URL_DEV || process.env.NEXT_PUBLIC_SUPABASE_URL) || "https://placeholder.supabase.co",
        anonKey: cleanEnvVar(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_DEV || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) || "placeholder-key",
        serviceKey: cleanEnvVar(process.env.SUPABASE_SERVICE_ROLE_KEY_DEV || process.env.SUPABASE_SERVICE_ROLE_KEY) || "placeholder-service-key",
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
const createDummyClient = (): DummyClient => {
  const dummyResponse: DummyResponse = { data: null, error: { message: 'Cliente no configurado' } };
  const dummyAuthResponse: DummyAuthResponse = { data: null, error: { message: 'Cliente no configurado' } };
  
  return {
    from: <T = unknown>(table: string) => ({
      select: (columns?: string) => ({
        eq: (column: string, value: string | number | boolean) => Promise.resolve(dummyResponse as SupabaseResponse<T[]>),
        order: (column: string, options?: { ascending?: boolean }) => Promise.resolve(dummyResponse as SupabaseResponse<T[]>),
        limit: (count: number) => Promise.resolve(dummyResponse as SupabaseResponse<T[]>),
        single: () => Promise.resolve(dummyResponse as SupabaseResponse<T>),
        then: (callback: SupabaseCallback<T[]>) => Promise.resolve(dummyResponse as SupabaseResponse<T[]>).then(callback),
      }),
      insert: (data: T | T[]) => Promise.resolve(dummyResponse as SupabaseResponse<T>),
      update: (data: Partial<T>) => ({
        eq: (column: string, value: string | number | boolean) => Promise.resolve(dummyResponse as SupabaseResponse<T>),
        then: (callback: SupabaseCallback<T>) => Promise.resolve(dummyResponse as SupabaseResponse<T>).then(callback),
      }),
      delete: () => ({
        eq: (column: string, value: string | number | boolean) => Promise.resolve(dummyResponse as SupabaseResponse<T>),
        then: (callback: SupabaseCallback<T>) => Promise.resolve(dummyResponse as SupabaseResponse<T>).then(callback),
      }),
      then: (callback: SupabaseCallback<T>) => Promise.resolve(dummyResponse as SupabaseResponse<T>).then(callback),
    }),
    auth: {
      signInWithPassword: (credentials: SupabaseCredentials) => Promise.resolve(dummyAuthResponse),
      signUp: (credentials: SupabaseCredentials) => Promise.resolve(dummyAuthResponse),
      signOut: () => Promise.resolve({ error: { message: 'Cliente no configurado' } }),
      getSession: () => Promise.resolve(dummyAuthResponse),
      getUser: () => Promise.resolve(dummyAuthResponse),
    },
    rpc: (func: string, params?: Record<string, unknown>) => Promise.resolve(dummyResponse),
  };
};

// Función para crear cliente de Supabase de forma segura
const createSupabaseClient = (url: string, key: string, options?: SupabaseOptions): SupabaseClient => {
  try {
    // Limpiar URL y key
    const cleanUrl = cleanEnvVar(url);
    const cleanKey = cleanEnvVar(key);
    
    // Durante el build time o si no hay configuración válida, usar cliente dummy
    if (typeof window === 'undefined' && (!cleanUrl || !cleanKey || cleanUrl.includes('placeholder') || cleanKey.includes('placeholder'))) {
      console.warn('⚠️  Build time: Usando cliente dummy para Supabase');
      return createDummyClient();
    }
    
    // En runtime, si no hay configuración válida, usar cliente dummy
    if (!cleanUrl || !cleanKey || cleanUrl.includes('placeholder') || cleanKey.includes('placeholder')) {
      console.warn('⚠️  Runtime: Usando cliente dummy para Supabase');
      return createDummyClient();
    }
    
    console.log('🔧 Creando cliente Supabase con URL:', cleanUrl);
    return createClient(cleanUrl, cleanKey, options) as SupabaseClient;
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
