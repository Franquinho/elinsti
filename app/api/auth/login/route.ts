import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 401 });
  }

  return NextResponse.json({ success: true, user: data.user });
}