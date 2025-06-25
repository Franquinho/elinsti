import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    console.log("🔔 [API] Obteniendo todos los productos para administración...");
    
    const { data: productos, error } = await supabaseAdmin
      .from('productos')
      .select('*')
      .order('nombre');

    if (error) {
      console.error("🔴 [API] Error obteniendo productos para administración:", error);
      return NextResponse.json({ 
        success: false, 
        message: "Error al obtener productos" 
      }, { status: 500 });
    }

    console.log("🟢 [API] Productos obtenidos para administración:", productos?.length || 0, "productos");
    if (productos && productos.length > 0) {
      const activos = productos.filter(p => p.activo).length;
      const inactivos = productos.filter(p => !p.activo).length;
      console.log("🔔 [API] Resumen:", { total: productos.length, activos, inactivos });
    }

    return NextResponse.json({ 
      success: true, 
      productos: productos || [] 
    });
  } catch (error) {
    console.error("🔴 [API] Error inesperado:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Error interno del servidor" 
    }, { status: 500 });
  }
} 