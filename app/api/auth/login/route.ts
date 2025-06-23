import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  console.log("🔔 [API] Recibido POST en /api/auth/login");
  const { email, password } = await request.json();
  console.log("🔔 [API] Datos recibidos:", { email });

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      console.error("🔴 [API] Error de login:", error.message);
      return NextResponse.json({ 
        success: false, 
        message: error.message 
      }, { status: 401 });
    }

    // Obtener información adicional del usuario desde la tabla usuarios
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('id, nombre, rol')
      .eq('email', email)
      .single();

    if (userError) {
      console.error("🔴 [API] Error obteniendo datos de usuario:", userError);
      return NextResponse.json({ 
        success: false, 
        message: "Error obteniendo datos de usuario" 
      }, { status: 500 });
    }

    console.log("🟢 [API] Login exitoso para:", email);
    return NextResponse.json({ 
      success: true, 
      user: {
        id: userData.id,
        nombre: userData.nombre,
        email: email,
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