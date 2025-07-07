import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { z } from "zod";
import { sensitiveRateLimiter } from "@/lib/rate-limiter";
import { securityValidators, sanitizeInput, securityHeaders, validatePayloadSize } from "@/lib/security";

const productoSchema = z.object({
  id: securityValidators.id,
  cantidad: securityValidators.quantity,
  precio: securityValidators.price
});

const comandaSchema = z.object({
  usuario_id: securityValidators.id,
  evento_id: securityValidators.id,
  total: securityValidators.price,
  nombre_cliente: securityValidators.name,
  productos: z.array(productoSchema).min(1, 'Debe incluir al menos un producto')
});

export async function POST(request: Request) {
  try {
    console.log("🔔 [API] Recibido POST en /api/comandas/create");
    
    // Rate limiting
    const rateLimitResult = sensitiveRateLimiter(request as any);
    if (rateLimitResult) {
      console.log("🔴 [API] Rate limit excedido");
      return rateLimitResult;
    }
    
    const body = await request.json();
    
    // Validación de tamaño de payload
    if (!validatePayloadSize(body, 50)) { // 50KB máximo
      return NextResponse.json({
        success: false,
        message: "Payload demasiado grande"
      }, { status: 413 });
    }
    
    const parse = comandaSchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json({
        success: false,
        message: "Datos inválidos",
        errors: parse.error.errors.map(e => e.message)
      }, { status: 400 });
    }
    
    const { usuario_id, evento_id, total, nombre_cliente, productos } = parse.data;
    const sanitizedNombreCliente = sanitizeInput(nombre_cliente);
    
    console.log("🔔 [API] Datos recibidos:", { 
      usuario_id, 
      evento_id, 
      total, 
      nombre_cliente: sanitizedNombreCliente,
      productos_count: productos.length 
    });

    // Verificar que el evento existe y está activo
    const { data: evento, error: eventoError } = await supabaseAdmin
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
    const { data: usuario, error: usuarioError } = await supabaseAdmin
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

    // Verificar que todos los productos existen
    const productoIds = productos.map(p => p.id);
    const { data: productosExistentes, error: productosError } = await supabaseAdmin
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

    // Verificar que todos los productos estén activos
    const productosInactivos = productosExistentes.filter(p => !p.activo);
    if (productosInactivos.length > 0) {
      return NextResponse.json({ 
        success: false, 
        message: "Algunos productos no están disponibles" 
      }, { status: 400 });
    }

    console.log("🟢 [API] Datos válidos, creando comanda...");

    // Crear la comanda
    const comandaData = {
      usuario_id,
      evento_id,
      caja_id: 1, // Valor por defecto para caja_id
      total,
      nombre_cliente: sanitizedNombreCliente,
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
      return NextResponse.json({ 
        success: false, 
        message: "Error al crear comanda en la base de datos",
        details: process.env.NODE_ENV === 'development' ? comandaError.details : undefined
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
      // Intentar eliminar la comanda si fallan los items
      await supabaseAdmin.from('comandas').delete().eq('id', comanda.id);
      return NextResponse.json({ 
        success: false, 
        message: "Error al crear items de comanda",
        details: process.env.NODE_ENV === 'development' ? itemsError.details : undefined
      }, { status: 500 });
    }

    console.log("🟢 [API] Comanda creada exitosamente, ID:", comanda.id);

    const response = NextResponse.json({ 
      success: true, 
      comanda_id: comanda.id,
      message: "Comanda creada exitosamente" 
    });

    // Agregar headers de seguridad
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;

  } catch (error) {
    console.error("🔴 [API] Error inesperado:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Error interno del servidor" 
    }, { status: 500 });
  }
}