import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { STAFF_SESSION_COOKIE, type StaffRole } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Data login tidak valid." }, { status: 400 }); }
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Data login tidak valid." }, { status: 400 });
  const { email, password, role } = body as Record<string, unknown>;
  if (typeof email !== "string" || typeof password !== "string" || (role !== "admin" && role !== "petugas")) {
    return NextResponse.json({ error: "Email, kata sandi, dan role wajib diisi." }, { status: 400 });
  }

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error || !data.session || !data.user) return NextResponse.json({ error: "Email atau kata sandi salah." }, { status: 401 });

    const { data: profile, error: profileError } = await supabase.from("profiles").select("role, full_name").eq("id", data.user.id).maybeSingle();
    if (profileError || !profile || profile.role !== role) {
      await supabase.auth.signOut({ scope: "local" });
      return NextResponse.json({ error: "Akun ini tidak memiliki akses ke dashboard tersebut." }, { status: 403 });
    }

    const response = NextResponse.json({ ok: true, role: profile.role as StaffRole });
    response.cookies.set(STAFF_SESSION_COOKIE, data.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: Math.max(60, data.session.expires_in),
    });
    return response;
  } catch (error) {
    console.error("Staff login failed:", error);
    return NextResponse.json({ error: "Layanan login belum tersedia. Periksa konfigurasi Supabase." }, { status: 503 });
  }
}
