// Tipos para el sistema de eventos múltiples

export interface Evento {
  id: number;
  nombre: string;
  descripcion?: string;
  fecha_inicio: string;
  fecha_fin: string;
  activo: boolean;
  capacidad_maxima?: number;
  precio_entrada: number;
  ubicacion?: string;
  imagen_url?: string;
  created_at: string;
  updated_at: string;
}

export interface EventoCreate {
  nombre: string;
  descripcion?: string;
  fecha_inicio: string;
  fecha_fin: string;
  capacidad_maxima?: number;
  precio_entrada?: number;
  ubicacion?: string;
  imagen_url?: string;
}

export interface EventoUpdate extends Partial<EventoCreate> {
  activo?: boolean;
}

export interface ConfiguracionSistema {
  id: number;
  clave: string;
  valor: string;
  descripcion?: string;
  created_at: string;
  updated_at: string;
}

export interface EventoStats {
  evento_id: number;
  nombre_evento: string;
  comandas_totales: number;
  comandas_pagadas: number;
  comandas_canceladas: number;
  total_efectivo: number;
  total_transferencia: number;
  total_invitacion: number;
  monto_total: number;
  entradas_vendidas: number;
  capacidad_utilizada: number;
  tasa_ocupacion: number;
}

// Tipos existentes (mantener compatibilidad)
export interface Producto {
  id: number;
  nombre: string;
  precio: number;
  emoji: string;
  activo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ProductoCreate {
  nombre: string;
  precio: number;
  emoji?: string;
  activo?: boolean;
}

export interface ProductoUpdate extends Partial<ProductoCreate> {}

export interface Comanda {
  id: number;
  usuario_id: number;
  evento_id: number;
  caja_id: number;
  total: number;
  nombre_cliente: string;
  estado: 'pendiente' | 'pagado' | 'cancelado';
  metodo_pago?: 'efectivo' | 'transferencia' | 'invitacion';
  nota?: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface ComandaCreate {
  usuario_id: number;
  evento_id: number;
  total: number;
  nombre_cliente: string;
  productos: ComandaProducto[];
}

export interface ComandaProducto {
  id: number;
  cantidad: number;
  precio: number;
}

export interface ComandaItem {
  id: number;
  comanda_id: number;
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  created_at?: string;
}

export interface ComandaUpdate {
  estado?: 'pendiente' | 'pagado' | 'cancelado';
  metodo_pago?: 'efectivo' | 'transferencia' | 'invitacion';
  nota?: string;
}

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: 'administrador' | 'caja' | 'venta';
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface UsuarioCreate {
  nombre: string;
  email: string;
  clave_hash: string;
  rol: 'administrador' | 'caja' | 'venta';
  activo?: boolean;
}

export interface Caja {
  id: number;
  evento_id: number;
  usuario_id: number;
  apertura: string;
  cierre?: string;
  monto_inicial: number;
  monto_final?: number;
  estado: 'abierta' | 'cerrada';
  created_at: string;
  updated_at: string;
}

export interface CajaCreate {
  evento_id: number;
  usuario_id: number;
  monto_inicial: number;
}

export interface CajaUpdate {
  cierre?: string;
  monto_final?: number;
  estado?: 'abierta' | 'cerrada';
}

export interface Estadistica {
  ventasHoy: number;
  ventasSemana: number;
  ventasMes: number;
  productosVendidos: number;
  totalEfectivo: number;
  totalTransferencia: number;
  totalInvitacion: number;
  cancelacionesHoy: number;
  montoCancelado: number;
  comandasTotales: number;
  tasaCancelacion: number;
}

// Tipos para API responses
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  details?: any;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Tipos para autenticación
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user?: {
    id: number;
    nombre: string;
    email: string;
    rol: 'administrador' | 'caja' | 'venta';
  };
  message?: string;
}

// Tipos para notificaciones
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'music';
  title: string;
  message: string;
  duration?: number;
  timestamp: number;
}

// Tipos para sincronización offline
export interface OfflineComanda {
  id: string;
  usuario_id: number;
  evento_id: number;
  total: number;
  nombre_cliente: string;
  productos: ComandaProducto[];
  estado: 'pendiente' | 'pagado' | 'cancelado';
  metodo_pago?: 'efectivo' | 'transferencia' | 'invitacion';
  nota?: string;
  fecha_creacion: string;
  sincronizado: boolean;
}

export interface OfflinePago {
  id: string;
  comanda_id: string;
  estado: 'pendiente' | 'pagado' | 'cancelado';
  metodo_pago: 'efectivo' | 'transferencia' | 'invitacion';
  monto: number;
  nota?: string;
  fecha_creacion: string;
  sincronizado: boolean;
}

export interface OfflineCaja {
  id: string;
  monto_inicial: number;
  monto_final?: number;
  fecha_apertura: string;
  fecha_cierre?: string;
  estado: 'abierta' | 'cerrada';
  sincronizado: boolean;
}

// Tipos para logs
export interface Log {
  id: number;
  usuario_id?: number;
  accion: string;
  detalle?: string;
  created_at: string;
}

// Tipos para filtros y búsquedas
export interface ComandaFilters {
  estado?: 'pendiente' | 'pagado' | 'cancelado';
  evento_id?: number;
  usuario_id?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
  search?: string;
}

export interface ProductoFilters {
  activo?: boolean;
  search?: string;
  precio_min?: number;
  precio_max?: number;
}

// Tipos para reportes
export interface ReporteVentas {
  fecha: string;
  total_ventas: number;
  comandas_totales: number;
  comandas_pagadas: number;
  comandas_canceladas: number;
  efectivo: number;
  transferencia: number;
  invitacion: number;
}

export interface ReporteProductos {
  producto_id: number;
  nombre_producto: string;
  cantidad_vendida: number;
  total_ventas: number;
  precio_promedio: number;
}

// Tipos específicos para Supabase
export interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceKey?: string;
}

export interface SupabaseOptions {
  auth?: {
    autoRefreshToken?: boolean;
    persistSession?: boolean;
    detectSessionInUrl?: boolean;
  };
}

export interface SupabaseCredentials {
  email: string;
  password: string;
}

export interface SupabaseAuthResponse {
  data: {
    user?: {
      id: string;
      email: string;
      user_metadata?: Record<string, unknown>;
    } | null;
    session?: {
      access_token: string;
      refresh_token: string;
      expires_at: number;
    } | null;
  } | null;
  error: {
    message: string;
    status?: number;
  } | null;
}

export interface SupabaseResponse<T = unknown> {
  data: T | null;
  error: {
    message: string;
    details?: string;
    hint?: string;
    code?: string;
  } | null;
}

export interface SupabaseQueryBuilder<T = unknown> {
  select: (columns?: string) => SupabaseSelectBuilder<T>;
  insert: (data: T | T[]) => Promise<SupabaseResponse<T>>;
  update: (data: Partial<T>) => SupabaseUpdateBuilder<T>;
  delete: () => SupabaseDeleteBuilder<T>;
  then: (callback: (response: SupabaseResponse<T>) => void) => Promise<SupabaseResponse<T>>;
}

export interface SupabaseSelectBuilder<T = unknown> {
  eq: (column: string, value: string | number | boolean) => Promise<SupabaseResponse<T[]>>;
  order: (column: string, options?: { ascending?: boolean }) => SupabaseSelectBuilder<T>;
  limit: (count: number) => Promise<SupabaseResponse<T[]>>;
  single: () => Promise<SupabaseResponse<T>>;
  then: (callback: (response: SupabaseResponse<T[]>) => void) => Promise<SupabaseResponse<T[]>>;
}

export interface SupabaseUpdateBuilder<T = unknown> {
  eq: (column: string, value: string | number | boolean) => Promise<SupabaseResponse<T>>;
  then: (callback: (response: SupabaseResponse<T>) => void) => Promise<SupabaseResponse<T>>;
}

export interface SupabaseDeleteBuilder<T = unknown> {
  eq: (column: string, value: string | number | boolean) => Promise<SupabaseResponse<T>>;
  then: (callback: (response: SupabaseResponse<T>) => void) => Promise<SupabaseResponse<T>>;
}

export interface SupabaseAuth {
  signInWithPassword: (credentials: SupabaseCredentials) => Promise<SupabaseAuthResponse>;
  signUp: (credentials: SupabaseCredentials) => Promise<SupabaseAuthResponse>;
  signOut: () => Promise<{ error: { message: string } | null }>;
  getSession: () => Promise<SupabaseAuthResponse>;
  getUser: () => Promise<SupabaseAuthResponse>;
}

export interface SupabaseClient {
  from: <T = unknown>(table: string) => SupabaseQueryBuilder<T>;
  auth: SupabaseAuth;
  rpc: (func: string, params?: Record<string, unknown>) => Promise<SupabaseResponse<unknown>>;
}

export interface DummyResponse {
  data: null;
  error: { message: string };
}

export interface DummyAuthResponse {
  data: null;
  error: { message: string };
}

export interface DummyClient extends SupabaseClient {}

// Tipos para callbacks
export type SupabaseCallback<T = unknown> = (response: SupabaseResponse<T>) => void;
export type SupabaseAuthCallback = (response: SupabaseAuthResponse) => void; 