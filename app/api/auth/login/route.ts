import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  console.log("🔔 [API] Recibido POST en /api/auth/login");
  const { email, password } = await request.json();
  console.log("🔔 [API] Datos recibidos:", { email });

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error("🔴 [API] Error de login:", error.message);
    return NextResponse.json({ success: false, message: error.message }, { status: 401 });
  }

  console.log("🟢 [API] Login exitoso para:", email);
  return NextResponse.json({ success: true, user: data.user });
}