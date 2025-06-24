import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("🔔 [API] Datos recibidos en /api/comandas/create:", body);
    
    const { usuario_id, evento_id, total, nombre_cliente, productos } = body;

    // Validar datos requeridos
    if (!usuario_id || !evento_id || !total || !nombre_cliente || !productos || productos.length === 0) {
      console.log("🔴 [API] Validación fallida:", {
        usuario_id: !!usuario_id,
        evento_id: !!evento_id,
        total: !!total,
        nombre_cliente: !!nombre_cliente,
        productos: !!productos,
        productosLength: productos?.length
      });
      return NextResponse.json({ 
        success: false, 
        message: "Datos incompletos" 
      }, { status: 400 });
    }

    console.log("🟢 [API] Datos válidos, creando comanda...");

    // Crear la comanda
    const comandaData = {
      usuario_id,
      evento_id,
      caja_id: 1, // Valor por defecto para caja_id
      total,
      nombre_cliente,
      estado: 'pendiente',
      fecha_creacion: new Date().toISOString()
    };

    console.log("🔔 [API] Datos de comanda a insertar:", comandaData);

    const { data: comanda, error: comandaError } = await supabaseAdmin
      .from('comandas')
      .insert(comandaData)
      .select()
      .single();

    if (comandaError) {
      console.error("🔴 [API] Error creando comanda:", comandaError);
      console.error("🔴 [API] Detalles del error:", {
        code: comandaError.code,
        message: comandaError.message,
        details: comandaError.details,
        hint: comandaError.hint
      });
      return NextResponse.json({ 
        success: false, 
        message: "Error al crear comanda" 
      }, { status: 500 });
    }

    console.log("🟢 [API] Comanda creada, ID:", comanda.id);

    // Crear los items de la comanda
    const itemsComanda = productos.map((producto: any) => ({
      comanda_id: comanda.id,
      producto_id: producto.id,
      cantidad: producto.cantidad,
      precio_unitario: producto.precio,
      subtotal: producto.precio * producto.cantidad
    }));

    console.log("🔔 [API] Items a crear:", itemsComanda);

    const { error: itemsError } = await supabaseAdmin
      .from('comanda_items')
      .insert(itemsComanda);

    if (itemsError) {
      console.error("🔴 [API] Error creando items:", itemsError);
      console.error("🔴 [API] Detalles del error de items:", {
        code: itemsError.code,
        message: itemsError.message,
        details: itemsError.details,
        hint: itemsError.hint
      });
      // Intentar eliminar la comanda si fallan los items
      await supabaseAdmin.from('comandas').delete().eq('id', comanda.id);
      return NextResponse.json({ 
        success: false, 
        message: "Error al crear items de comanda" 
      }, { status: 500 });
    }

    console.log("🟢 [API] Comanda creada exitosamente, ID:", comanda.id);

    return NextResponse.json({ 
      success: true, 
      comanda_id: comanda.id,
      message: "Comanda creada exitosamente" 
    });

  } catch (error) {
    console.error("🔴 [API] Error inesperado:", error);
    console.error("🔴 [API] Stack trace:", error instanceof Error ? error.stack : 'No stack trace available');
    return NextResponse.json({ 
      success: false, 
      message: "Error interno del servidor" 
    }, { status: 500 });
  }
}