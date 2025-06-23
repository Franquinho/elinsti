import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const { data: productos, error } = await supabaseAdmin
      .from('productos')
      .select('*')
      .eq('activo', true)
      .order('nombre');

    if (error) {
      console.error("Error obteniendo productos:", error);
      return NextResponse.json({ 
        success: false, 
        message: "Error al obtener productos" 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      productos: productos || [] 
    });
  } catch (error) {
    console.error("Error inesperado:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Error interno del servidor" 
    }, { status: 500 });
  }
}