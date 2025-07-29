import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// PUT - Actualizar un producto existente
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const body = await request.json();
    const { nombre, precio, emoji, activo } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: "ID de producto es requerido" }, { status: 400 });
    }

    const { data, error } = await supabase
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

// DELETE - Soft delete de un producto (marcar como inactivo)
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json({ success: false, message: "ID de producto es requerido" }, { status: 400 });
    }

    // Verificar si el producto existe
    const { data: productoExistente, error: checkError } = await supabase
      .from('productos')
      .select('id, nombre, activo')
      .eq('id', id)
      .single();

    if (checkError || !productoExistente) {
      return NextResponse.json({ success: false, message: "Producto no encontrado" }, { status: 404 });
    }

    // Verificar si el producto está siendo usado en comandas
    const { data: comandasConProducto, error: comandasError } = await supabase
      .from('comanda_items')
      .select('comanda_id')
      .eq('producto_id', id)
      .limit(1);

    if (comandasError) {
      console.error("Error verificando uso del producto:", comandasError);
      return NextResponse.json({ 
        success: false, 
        message: "Error verificando uso del producto" 
      }, { status: 500 });
    }

    if (comandasConProducto && comandasConProducto.length > 0) {
      // El producto está siendo usado, solo marcarlo como inactivo
      const { data, error } = await supabase
        .from('productos')
        .update({ activo: false })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      return NextResponse.json({ 
        success: true, 
        message: `Producto "${productoExistente.nombre}" desactivado (está siendo usado en comandas)`,
        producto: data
      });
    } else {
      // El producto no está siendo usado, eliminarlo físicamente
      const { error } = await supabase.from('productos').delete().eq('id', id);

      if (error) throw error;
      
      return NextResponse.json({ 
        success: true, 
        message: `Producto "${productoExistente.nombre}" eliminado correctamente`
      });
    }

  } catch (error: any) {
    console.error(`Error al eliminar producto ${params.id}:`, error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
} 