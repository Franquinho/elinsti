import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { z } from "zod";

const productoSchema = z.object({
  id: z.number().positive('ID de producto debe ser positivo'),
  cantidad: z.number().positive('Cantidad debe ser positiva').max(999999, 'Cantidad demasiado alta'),
  precio: z.number().positive('Precio debe ser positivo').max(999999.99, 'Precio demasiado alto')
});

const comandaSchema = z.object({
  evento_id: z.number().positive('ID de evento debe ser positivo'),
  total: z.number().positive('Total debe ser positivo').max(999999.99, 'Total demasiado alto'),
  nombre_cliente: z.string().min(1, 'Nombre de cliente es requerido').max(100, 'Nombre demasiado largo'),
  productos: z.array(productoSchema).min(1, 'Debe incluir al menos un producto'),
  usuario_id: z.number().positive('ID de usuario debe ser positivo').optional()
}).strict();

export async function POST(request: Request) {
  try {
    console.log("🔔 [API] Recibido POST en /api/comandas/create - DEBUG FINAL");
    
    const body = await request.json();
    
    console.log("🔔 [API] Body recibido:", JSON.stringify(body, null, 2));
    
    const parse = comandaSchema.safeParse(body);
    if (!parse.success) {
      console.log("🔴 [API] Validación fallida:", parse.error.errors);
      console.log("🔴 [API] Errores detallados:", parse.error.errors.map(e => ({
        path: e.path.join('.'),
        message: e.message,
        code: e.code
      })));
      return NextResponse.json({
        success: false,
        message: "Datos inválidos",
        errors: parse.error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
        debug: {
          receivedBody: body,
          validationErrors: parse.error.errors
        }
      }, { status: 400 });
    }
    
    const { evento_id, total, nombre_cliente, productos, usuario_id: bodyUsuarioId } = parse.data;
    const sanitizedNombreCliente = nombre_cliente.trim();
    const usuario_id = bodyUsuarioId || 4; // Usar el del body o el valor por defecto
    
    console.log("🔔 [API] Datos recibidos:", { 
      usuario_id, 
      evento_id, 
      total, 
      nombre_cliente: sanitizedNombreCliente,
      productos_count: productos.length 
    });

    // Verificar que el evento existe y está activo
    const { data: evento, error: eventoError } = await supabase
      .from('eventos')
      .select('id, activo')
      .eq('id', evento_id)
      .single();

    if (eventoError || !evento) {
      console.error("🔴 [API] Error verificando evento:", eventoError);
      return NextResponse.json({ 
        success: false, 
        message: "El evento especificado no existe" 
      }, { status: 400 });
    }

    if (!evento.activo) {
      return NextResponse.json({ 
        success: false, 
        message: "El evento especificado no está activo" 
      }, { status: 400 });
    }

    // Verificar que el usuario existe
    const { data: usuario, error: usuarioError } = await supabase
      .from('usuarios')
      .select('id, activo')
      .eq('id', usuario_id)
      .single();

    if (usuarioError || !usuario) {
      console.error("🔴 [API] Error verificando usuario:", usuarioError);
      return NextResponse.json({ 
        success: false, 
        message: "El usuario especificado no existe" 
      }, { status: 400 });
    }

    if (!usuario.activo) {
      return NextResponse.json({ 
        success: false, 
        message: "El usuario especificado no está activo" 
      }, { status: 400 });
    }

    // Verificar que todos los productos existen y están activos
    const productoIds = productos.map(p => p.id);
    const { data: productosExistentes, error: productosError } = await supabase
      .from('productos')
      .select('id, activo')
      .in('id', productoIds);

    if (productosError) {
      console.error("🔴 [API] Error verificando productos:", productosError);
      return NextResponse.json({ 
        success: false, 
        message: "Error verificando productos" 
      }, { status: 500 });
    }

    if (productosExistentes.length !== productos.length) {
      return NextResponse.json({ 
        success: false, 
        message: "Algunos productos no existen" 
      }, { status: 400 });
    }

    const productosInactivos = productosExistentes.filter(p => !p.activo);
    if (productosInactivos.length > 0) {
      return NextResponse.json({ 
        success: false, 
        message: "Algunos productos no están disponibles" 
      }, { status: 400 });
    }

    console.log("🟢 [API] Datos válidos, creando comanda...");

    // Crear la comanda con la estructura correcta de Supabase
    const comandaData = {
      usuario_id,
      evento_id,
      total,
      nombre_cliente: sanitizedNombreCliente,
      estado: 'pendiente',
      metodo_pago: null,
      nota: null
    };

    console.log("🔔 [API] Datos de comanda a insertar:", comandaData);

    const { data: comanda, error: comandaError } = await supabase
      .from('comandas')
      .insert(comandaData)
      .select()
      .single();

    if (comandaError) {
      console.error("🔴 [API] Error creando comanda:", comandaError);
      console.error("🔴 [API] Detalles del error:", {
        message: comandaError.message,
        details: comandaError.details,
        hint: comandaError.hint,
        code: comandaError.code
      });
      console.error("🔴 [API] Datos que causaron el error:", comandaData);
      return NextResponse.json({ 
        success: false, 
        message: "Error al crear comanda en la base de datos",
        details: comandaError.message,
        code: comandaError.code,
        debug: {
          data: comandaData,
          error: {
            message: comandaError.message,
            code: comandaError.code,
            details: comandaError.details,
            hint: comandaError.hint
          }
        }
      }, { status: 500 });
    }

    console.log("🟢 [API] Comanda creada, ID:", comanda.id);

    // Crear los items de la comanda
    const itemsComanda = productos.map((producto) => ({
      comanda_id: comanda.id,
      producto_id: producto.id,
      cantidad: producto.cantidad,
      precio_unitario: producto.precio,
      subtotal: producto.precio * producto.cantidad
    }));

    console.log("🔔 [API] Items a crear:", itemsComanda);

    const { error: itemsError } = await supabase
      .from('comanda_items')
      .insert(itemsComanda);

    if (itemsError) {
      console.error("🔴 [API] Error creando items:", itemsError);
      // Intentar eliminar la comanda si fallan los items
      await supabase.from('comandas').delete().eq('id', comanda.id);
      return NextResponse.json({ 
        success: false, 
        message: "Error al crear items de comanda",
        details: process.env.NODE_ENV === 'development' ? itemsError.details : undefined
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
    console.error("🔴 [API] Stack trace:", error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json({ 
      success: false, 
      message: "Error interno del servidor",
      debug: {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      }
    }, { status: 500 });
  }
}