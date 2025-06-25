import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET - Obtener estadísticas de todos los eventos
export async function GET() {
  try {
    console.log("🔔 [API] Obteniendo estadísticas de eventos...");
    
    // Obtener todos los eventos
    const { data: eventos, error: eventosError } = await supabaseAdmin
      .from('eventos')
      .select('id, nombre, capacidad_maxima, precio_entrada')
      .order('fecha_inicio', { ascending: false });

    if (eventosError) {
      console.error("🔴 [API] Error obteniendo eventos:", eventosError);
      return NextResponse.json({ 
        success: false, 
        message: "Error obteniendo eventos" 
      }, { status: 500 });
    }

    const statsPromises = eventos.map(async (evento) => {
      // Obtener comandas para este evento
      const { data: comandas, error: comandasError } = await supabaseAdmin
        .from('comandas')
        .select('id, estado, total, metodo_pago')
        .eq('evento_id', evento.id);

      if (comandasError) {
        console.error(`🔴 [API] Error obteniendo comandas para evento ${evento.id}:`, comandasError);
        return null;
      }

      const comandasTotales = comandas?.length || 0;
      const comandasPagadas = comandas?.filter(c => c.estado === 'pagado').length || 0;
      const comandasCanceladas = comandas?.filter(c => c.estado === 'cancelado').length || 0;

      // Calcular totales por método de pago
      const totalEfectivo = comandas
        ?.filter(c => c.estado === 'pagado' && c.metodo_pago === 'efectivo')
        .reduce((sum, c) => sum + (c.total || 0), 0) || 0;

      const totalTransferencia = comandas
        ?.filter(c => c.estado === 'pagado' && c.metodo_pago === 'transferencia')
        .reduce((sum, c) => sum + (c.total || 0), 0) || 0;

      const totalInvitacion = comandas
        ?.filter(c => c.estado === 'pagado' && c.metodo_pago === 'invitacion')
        .reduce((sum, c) => sum + (c.total || 0), 0) || 0;

      const montoTotal = totalEfectivo + totalTransferencia + totalInvitacion;

      // Calcular entradas vendidas (asumiendo que cada comanda es una entrada)
      const entradasVendidas = comandasPagadas;
      const capacidadUtilizada = evento.capacidad_maxima ? entradasVendidas : 0;
      const tasaOcupacion = evento.capacidad_maxima ? (entradasVendidas / evento.capacidad_maxima) * 100 : 0;

      return {
        evento_id: evento.id,
        nombre_evento: evento.nombre,
        comandas_totales: comandasTotales,
        comandas_pagadas: comandasPagadas,
        comandas_canceladas: comandasCanceladas,
        total_efectivo: totalEfectivo,
        total_transferencia: totalTransferencia,
        total_invitacion: totalInvitacion,
        monto_total: montoTotal,
        entradas_vendidas: entradasVendidas,
        capacidad_utilizada: capacidadUtilizada,
        tasa_ocupacion: Math.round(tasaOcupacion * 100) / 100, // Redondear a 2 decimales
        capacidad_maxima: evento.capacidad_maxima,
        precio_entrada: evento.precio_entrada
      };
    });

    const stats = await Promise.all(statsPromises);
    const validStats = stats.filter(stat => stat !== null);

    console.log("🟢 [API] Estadísticas obtenidas para", validStats.length, "eventos");
    return NextResponse.json({ 
      success: true, 
      stats: validStats 
    });

  } catch (error) {
    console.error("🔴 [API] Error inesperado:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Error interno del servidor" 
    }, { status: 500 });
  }
} 