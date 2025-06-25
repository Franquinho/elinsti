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
}

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

export interface ComandaItem {
  id: number;
  comanda_id: number;
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
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