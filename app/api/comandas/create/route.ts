import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  const data = await request.json();

  // Inserta la comanda principal
  const { data: comanda, error: errorComanda } = await supabase
    .from("comandas")
    .insert([{
      usuario_id: data.usuario_id,
      nombre_cliente: data.nombre_cliente,
      total: data.total,
      estado: "pendiente",
      metodo_pago: data.metodo_pago ?? null,
      nota: data.nota ?? null
    }])
    .select()
    .single();

  if (errorComanda) {
    return NextResponse.json({ success: false, error: errorComanda.message }, { status: 500 });
  }

  // Inserta los productos de la comanda
  const detalles = data.productos.map((p: any) => ({
    comanda_id: comanda.id,
    producto_id: p.id,
    cantidad: p.cantidad,
    precio_unitario: p.precio,
    subtotal: p.cantidad * p.precio
  }));

  const { error: errorDetalle } = await supabase
    .from("comanda_detalle")
    .insert(detalles);

  if (errorDetalle) {
    return NextResponse.json({ success: false, error: errorDetalle.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, comanda_id: comanda.id });
}