import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const { data, error } = await res.json();

  if (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 401 });
  }

  return NextResponse.json({ success: true, user: data.user });
}