import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
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
    const body = await request.json();
    
    // Validar datos con Zod
    const validationResult = ProductoCreateSchema.safeParse(body);
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
      return NextResponse.json({ 
        success: false, 
        message: `Datos inválidos: ${errors}` 
      }, { status: 400 });
    }

    const { nombre, precio, emoji, activo } = validationResult.data;

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

  } catch (error: unknown) {
    console.error("Error al crear producto:", error);
    return NextResponse.json({ 
      success: false, 
      message: error instanceof Error ? error.message : "Error interno del servidor" 
    }, { status: 500 });
  }
}