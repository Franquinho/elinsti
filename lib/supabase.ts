import { createClient } from "@supabase/supabase-js";

// Verificar que las variables de entorno estén configuradas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Función para validar configuración
function validateSupabaseConfig() {
  if (!supabaseUrl) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL no está configurada. " +
      "Crea un archivo .env.local con tus credenciales de Supabase."
    );
  }
  if (!supabaseAnonKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY no está configurada. " +
      "Crea un archivo .env.local con tus credenciales de Supabase."
    );
  }
  if (!supabaseServiceKey) {
    console.warn(
      "SUPABASE_SERVICE_ROLE_KEY no está configurada. " +
      "Algunas funcionalidades del servidor pueden no funcionar correctamente."
    );
  }
}

// Validar configuración solo en el servidor
if (typeof window === 'undefined') {
  validateSupabaseConfig();
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// Cliente con permisos de servicio para operaciones del servidor
export const supabaseAdmin = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseServiceKey || supabaseAnonKey || 'placeholder-key'
);

export type Database = {
  public: {
    Tables: {
      usuarios: {
        Row: {
          id: number;
          nombre: string;
          email: string;
          clave_hash: string;
          rol: "administrador" | "caja" | "venta";
          activo: boolean;
          created_at: string;
        };
        Insert: {
          nombre: string;
          email: string;
          clave_hash: string;
          rol: "administrador" | "caja" | "venta";
          activo?: boolean;
        };
        Update: {
          nombre?: string;
          email?: string;
          clave_hash?: string;
          rol?: "administrador" | "caja" | "venta";
          activo?: boolean;
        };
      };
      productos: {
        Row: {
          id: number;
          nombre: string;
          precio: number;
          emoji: string;
          activo: boolean;
          created_at: string;
        };
        Insert: {
          nombre: string;
          precio: number;
          emoji?: string;
          activo?: boolean;
        };
        Update: {
          nombre?: string;
          precio?: number;
          emoji?: string;
          activo?: boolean;
        };
      };
      comandas: {
        Row: {
          id: number;
          usuario_id: number;
          evento_id: number;
          caja_id: number;
          estado: "pendiente" | "pagado" | "cancelado";
          total: number;
          metodo_pago: "invitacion" | "transferencia" | "efectivo" | "revisar" | null;
          nota: string | null;
          nombre_cliente: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          usuario_id: number;
          evento_id: number;
          caja_id: number;
          estado?: "pendiente" | "pagado" | "cancelado";
          total: number;
          metodo_pago?: "invitacion" | "transferencia" | "efectivo" | "revisar" | null;
          nota?: string | null;
          nombre_cliente?: string | null;
        };
        Update: {
          estado?: "pendiente" | "pagado" | "cancelado";
          metodo_pago?: "invitacion" | "transferencia" | "efectivo" | "revisar" | null;
          nota?: string | null;
          nombre_cliente?: string | null;
        };
      };
    };
  };
};
