import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { startOfToday, startOfWeek, startOfMonth } from 'date-fns';

export async function GET() {
  try {
    const { data: comandas, error } = await supabaseAdmin
      .from('comandas')
      .select('fecha_creacion, total, estado, metodo_pago, productos:comanda_items(cantidad)');

    if (error) {
      console.error("Error obteniendo comandas:", error);
      return NextResponse.json({ 
        success: false, 
        message: "Error al obtener comandas" 
      }, { status: 500 });
    }

    if (!comandas || comandas.length === 0) {
        return NextResponse.json({ 
          success: true, 
          stats: {
            ventasHoy: 0,
            ventasSemana: 0,
            ventasMes: 0,
            productosVendidos: 0,
            totalEfectivo: 0,
            totalTransferencia: 0,
            totalInvitacion: 0,
            cancelacionesHoy: 0,
            montoCancelado: 0,
            comandasTotales: 0,
            tasaCancelacion: 0
          }
        });
    }

    const hoy = startOfToday();
    const inicioSemana = startOfWeek(hoy);
    const inicioMes = startOfMonth(hoy);

    let ventasHoy = 0;
    let ventasSemana = 0;
    let ventasMes = 0;
    let productosVendidos = 0;
    let totalEfectivo = 0;
    let totalTransferencia = 0;
    let totalInvitacion = 0;
    let cancelacionesHoy = 0;
    let montoCancelado = 0;
    let comandasTotalesHoy = 0;

    for (const comanda of comandas) {
        const fechaComanda = new Date(comanda.fecha_creacion);

        if (comanda.estado === 'pagado') {
            if (fechaComanda >= hoy) {
                ventasHoy += comanda.total;
            }
            if (fechaComanda >= inicioSemana) {
                ventasSemana += comanda.total;
            }
            if (fechaComanda >= inicioMes) {
                ventasMes += comanda.total;
            }

            if (fechaComanda >= hoy) {
                if (comanda.metodo_pago === 'efectivo') totalEfectivo += comanda.total;
                if (comanda.metodo_pago === 'transferencia') totalTransferencia += comanda.total;
                if (comanda.metodo_pago === 'invitacion') totalInvitacion += comanda.total;

                if (Array.isArray(comanda.productos)) {
                    productosVendidos += comanda.productos.reduce((acc, p) => acc + (p.cantidad || 0), 0);
                }
            }
        }
        
        if (fechaComanda >= hoy) {
            comandasTotalesHoy++;
            if (comanda.estado === 'cancelado') {
                cancelacionesHoy++;
                montoCancelado += comanda.total;
            }
        }
    }
    
    const tasaCancelacion = comandasTotalesHoy > 0 ? (cancelacionesHoy / comandasTotalesHoy) * 100 : 0;

    const stats = {
      ventasHoy,
      ventasSemana,
      ventasMes,
      productosVendidos,
      totalEfectivo,
      totalTransferencia,
      totalInvitacion,
      cancelacionesHoy,
      montoCancelado,
      comandasTotales: comandasTotalesHoy,
      tasaCancelacion,
    };

    return NextResponse.json({ success: true, stats });

  } catch (error: any) {
    console.error("Error al calcular estadísticas:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}