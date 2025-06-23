import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// PATCH - Actualizar un producto existente
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const body = await request.json();
    const { nombre, precio, emoji, activo } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: "ID de producto es requerido" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('productos')
      .update({ nombre, precio, emoji, activo })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, producto: data });

  } catch (error: any) {
    console.error(`Error al actualizar producto ${params.id}:`, error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// DELETE - Eliminar un producto
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json({ success: false, message: "ID de producto es requerido" }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from('productos').delete().eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true, message: "Producto eliminado correctamente" });

  } catch (error: any) {
    console.error(`Error al eliminar producto ${params.id}:`, error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
} 