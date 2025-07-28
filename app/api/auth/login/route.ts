import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida')
});

export async function POST(request: Request) {
  try {
    console.log("🔔 [API] Recibido POST en /api/auth/login");
    
    const body = await request.json();
    const parse = loginSchema.safeParse(body);
    
    if (!parse.success) {
      return NextResponse.json({
        success: false,
        message: "Datos inválidos",
        errors: parse.error.errors.map(e => e.message)
      }, { status: 400 });
    }
    
    const { email, password } = parse.data;
    const sanitizedEmail = email.toLowerCase().trim();
    
    console.log("🔔 [API] Intentando login para:", sanitizedEmail);

    // Intentar autenticación con Supabase
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email: sanitizedEmail, 
      password 
    });

    if (error) {
      console.error("🔴 [API] Error de login:", error.message);
      return NextResponse.json({ 
        success: false, 
        message: "Credenciales inválidas"
      }, { status: 401 });
    }

    // Obtener información del usuario desde la tabla usuarios
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('id, nombre, rol, activo')
      .eq('email', sanitizedEmail)
      .single();

    if (userError || !userData) {
      console.error("🔴 [API] Error obteniendo datos de usuario:", userError);
      return NextResponse.json({ 
        success: false, 
        message: "Error obteniendo datos de usuario"
      }, { status: 500 });
    }

    // Verificar que el usuario esté activo
    if (!userData.activo) {
      console.log("🔴 [API] Usuario inactivo:", sanitizedEmail);
      return NextResponse.json({ 
        success: false, 
        message: "Usuario deshabilitado" 
      }, { status: 403 });
    }

    console.log("🟢 [API] Login exitoso para:", sanitizedEmail);

    return NextResponse.json({ 
      success: true, 
      user: {
        id: userData.id,
        nombre: userData.nombre,
        email: sanitizedEmail,
        rol: userData.rol
      }
    });

  } catch (error) {
    console.error("🔴 [API] Error inesperado:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Error interno del servidor"
    }, { status: 500 });
  }
}