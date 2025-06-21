import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("productos")
    .select("id, nombre, precio, emoji, activo")
    .eq("activo", true)
    .order("nombre");

  if (error) {
    return NextResponse.json({ success: false, message: "Error..." }, { status: 500 });
  }

  return NextResponse.json({ success: true, productos: data });
}