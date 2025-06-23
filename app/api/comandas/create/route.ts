import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { usuario_id, evento_id, total, nombre_cliente, productos } = await request.json();

    // Validar datos requeridos
    if (!usuario_id || !evento_id || !total || !nombre_cliente || !productos || productos.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: "Datos incompletos" 
      }, { status: 400 });
    }

    // Crear la comanda
    const { data: comanda, error: comandaError } = await supabaseAdmin
      .from('comandas')
      .insert({
        usuario_id,
        evento_id,
        total,
        nombre_cliente,
        estado: 'pendiente',
        fecha_creacion: new Date().toISOString()
      })
      .select()
      .single();

    if (comandaError) {
      console.error("Error creando comanda:", comandaError);
      return NextResponse.json({ 
        success: false, 
        message: "Error al crear comanda" 
      }, { status: 500 });
    }

    // Crear los items de la comanda
    const itemsComanda = productos.map((producto: any) => ({
      comanda_id: comanda.id,
      producto_id: producto.id,
      cantidad: producto.cantidad,
      precio_unitario: producto.precio,
      subtotal: producto.precio * producto.cantidad
    }));

    const { error: itemsError } = await supabaseAdmin
      .from('comanda_items')
      .insert(itemsComanda);

    if (itemsError) {
      console.error("Error creando items:", itemsError);
      // Intentar eliminar la comanda si fallan los items
      await supabaseAdmin.from('comandas').delete().eq('id', comanda.id);
      return NextResponse.json({ 
        success: false, 
        message: "Error al crear items de comanda" 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      comanda_id: comanda.id,
      message: "Comanda creada exitosamente" 
    });

  } catch (error) {
    console.error("Error inesperado:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Error interno del servidor" 
    }, { status: 500 });
  }
}