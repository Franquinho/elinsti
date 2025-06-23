import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// POST - Crear un nuevo producto
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nombre, precio, emoji, activo } = body;

    // Validaciones
    if (!nombre || typeof nombre !== 'string' || nombre.trim().length < 1) {
      return NextResponse.json({ success: false, message: "El nombre del producto es requerido y debe ser una cadena no vacía" }, { status: 400 });
    }

    if (precio === undefined || typeof precio !== 'number' || precio < 0) {
      return NextResponse.json({ success: false, message: "El precio debe ser un número positivo" }, { status: 400 });
    }

    // Validar que no exista un producto con el mismo nombre
    const { data: productoExistente } = await supabaseAdmin
      .from('productos')
      .select('id')
      .eq('nombre', nombre.trim())
      .single();

    if (productoExistente) {
      return NextResponse.json({ success: false, message: "Ya existe un producto con ese nombre" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('productos')
      .insert([{
        nombre: nombre.trim(),
        precio: Number(precio),
        emoji: emoji || '📦',
        activo: activo !== false
      }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, producto: data });

  } catch (error: any) {
    console.error("Error al crear producto:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}