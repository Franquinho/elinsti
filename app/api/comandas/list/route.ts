import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("comandas")
    .select(`
      id, usuario_id, nombre_cliente, total, estado, metodo_pago, nota, created_at,
      usuario:usuarios (id, nombre),
      productos:comanda_detalle (
        id, cantidad, precio_unitario, subtotal,
        producto:productos (id, nombre, emoji)
      )
    `)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, comandas: data });
}