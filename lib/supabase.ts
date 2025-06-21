import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
