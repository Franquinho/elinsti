import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { z } from "zod";
import { authRateLimiter } from "@/lib/rate-limiter";
import { securityValidators, sanitizeInput, securityHeaders } from "@/lib/security";

const loginSchema = z.object({
  email: securityValidators.email,
  password: securityValidators.password
});

export async function POST(request: Request) {
  try {
    console.log("🔔 [API] Recibido POST en /api/auth/login");
    
    // Rate limiting
    const rateLimitResult = authRateLimiter(request as any);
    if (rateLimitResult) {
      console.log("🔴 [API] Rate limit excedido");
      return rateLimitResult;
    }
    
    const body = await request.json();
    
    // Validación de tamaño de payload
    if (JSON.stringify(body).length > 1024) {
      return NextResponse.json({
        success: false,
        message: "Payload demasiado grande"
      }, { status: 413 });
    }
    
    const parse = loginSchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json({
        success: false,
        message: "Datos inválidos",
        errors: parse.error.errors.map(e => e.message)
      }, { status: 400 });
    }
    
    const { email, password } = parse.data;
    const sanitizedEmail = sanitizeInput(email.toLowerCase().trim());
    
    console.log("🔔 [API] Datos recibidos:", { email: sanitizedEmail });

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

    // Obtener información adicional del usuario desde la tabla usuarios
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('id, nombre, rol, activo')
      .eq('email', sanitizedEmail)
      .single();

    if (userError) {
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
        message: "Usuario deshabilitado. Contacte al administrador." 
      }, { status: 403 });
    }

    console.log("🟢 [API] Login exitoso para:", sanitizedEmail);
    
    // Registrar el login exitoso
    await supabase
      .from('logs')
      .insert({
        usuario_id: userData.id,
        accion: 'LOGIN_EXITOSO',
        detalle: `Login exitoso desde ${request.headers.get('user-agent') || 'desconocido'}`
      })
      .catch(err => console.error("Error registrando log:", err));

    const response = NextResponse.json({ 
      success: true, 
      user: {
        id: userData.id,
        nombre: userData.nombre,
        email: sanitizedEmail,
        rol: userData.rol
      }
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