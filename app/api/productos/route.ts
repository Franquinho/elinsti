import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// POST - Crear un nuevo producto
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nombre, precio, emoji, activo } = body;

    if (!nombre || precio === undefined || precio < 0) {
      return NextResponse.json({ success: false, message: "Datos de producto inválidos" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('productos')
      .insert([{ nombre, precio, emoji: emoji || '📦', activo: activo !== false }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, producto: data });

  } catch (error: any) {
    console.error("Error al crear producto:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
} 