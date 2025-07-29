import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { z } from "zod";

// Esquema de validación Zod para productos
const ProductoCreateSchema = z.object({
  nombre: z.string().min(1, "El nombre del producto es requerido").max(100, "El nombre es demasiado largo"),
  precio: z.number().positive("El precio debe ser un número positivo"),
  emoji: z.string().optional().default("📦"),
  activo: z.boolean().optional().default(true),
});

// POST - Crear un nuevo producto
export async function POST(request: Request) {
  try {
    console.log("🔔 [API] Iniciando creación de producto...");
    
    const body = await request.json();
    console.log("🔔 [API] Body recibido:", body);
    
    // Validar datos con Zod
    const validationResult = ProductoCreateSchema.safeParse(body);
    if (!validationResult.success) {
      console.log("🔴 [API] Validación fallida:", validationResult.error.errors);
      const errors = validationResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
      return NextResponse.json({ 
        success: false, 
        message: `Datos inválidos: ${errors}` 
      }, { status: 400 });
    }

    const { nombre, precio, emoji, activo } = validationResult.data;
    console.log("🔔 [API] Datos validados:", { nombre, precio, emoji, activo });

    // Verificar conexión a Supabase
    console.log("🔔 [API] Verificando conexión a Supabase...");
    if (!supabase) {
      console.error("🔴 [API] supabase no está configurado");
      return NextResponse.json({ 
        success: false, 
        message: "Error de configuración de base de datos" 
      }, { status: 500 });
    }

    // Validar que no exista un producto con el mismo nombre
    console.log("🔔 [API] Verificando producto existente...");
    const { data: productoExistente, error: checkError } = await supabase
      .from('productos')
      .select('id')
      .eq('nombre', nombre.trim())
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error("🔴 [API] Error verificando producto existente:", checkError);
      return NextResponse.json({ 
        success: false, 
        message: `Error verificando producto: ${checkError.message}` 
      }, { status: 500 });
    }

    if (productoExistente) {
      console.log("🔴 [API] Producto ya existe:", productoExistente);
      return NextResponse.json({ success: false, message: "Ya existe un producto con ese nombre" }, { status: 400 });
    }

    console.log("🔔 [API] Insertando producto en base de datos...");
    const { data, error } = await supabase
      .from('productos')
      .insert([{
        nombre: nombre.trim(),
        precio: Number(precio),
        emoji: emoji || '📦',
        activo: activo !== false
      }])
      .select()
      .single();

    if (error) {
      console.error("🔴 [API] Error insertando producto:", error);
      throw error;
    }

    console.log("🟢 [API] Producto creado exitosamente:", data);
    return NextResponse.json({ success: true, producto: data });

  } catch (error: unknown) {
    console.error("🔴 [API] Error al crear producto:", error);
    return NextResponse.json({ 
      success: false, 
      message: error instanceof Error ? error.message : "Error interno del servidor" 
    }, { status: 500 });
  }
}