import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  const data = await request.json();

  const { error } = await supabase
    .from("comandas")
    .update({
      estado: data.estado,
      metodo_pago: data.metodo_pago ?? null,
      nota: data.nota ?? null
    })
    .eq("id", data.comanda_id);

  if (error) {
    return NextResponse.json({ success: false, message: "Error..." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}