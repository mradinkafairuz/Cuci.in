import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type StaffOrAdminAccess =
  | { ok: true; user: User; role: "admin" | "petugas"; supabase: ReturnType<typeof createSupabaseAdminClient> }
  | { ok: false; response: NextResponse };
type AdminAccess =
  | { ok: true; user: User; role: "admin"; supabase: ReturnType<typeof createSupabaseAdminClient> }
  | { ok: false; response: NextResponse };

export async function requireStaffOrAdmin(request: Request): Promise<StaffOrAdminAccess> {
  const token = request.headers.get("authorization")?.match(/^Bearer (.+)$/i)?.[1];
  if (!token) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Silakan masuk sebagai admin atau petugas." }, { status: 401 }),
    };
  }

  try {
    const supabase = createSupabaseAdminClient();
    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData.user) {
      return {
        ok: false,
        response: NextResponse.json({ error: "Sesi login tidak valid atau sudah berakhir." }, { status: 401 }),
      };
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", authData.user.id)
      .maybeSingle();
    if (profileError) throw profileError;
    if (profile?.role !== "admin" && profile?.role !== "petugas") {
      return {
        ok: false,
        response: NextResponse.json({ error: "Akun ini tidak memiliki akses operasional." }, { status: 403 }),
      };
    }

    return { ok: true, user: authData.user, role: profile.role, supabase };
  } catch (error) {
    console.error("Failed to verify staff access:", error);
    return {
      ok: false,
      response: NextResponse.json({ error: "Akses operasional belum dapat diverifikasi." }, { status: 503 }),
    };
  }
}

export async function requireAdmin(request: Request): Promise<AdminAccess> {
  const access = await requireStaffOrAdmin(request);
  if (!access.ok) return access;
  if (access.role === "admin") return { ...access, role: "admin" };
  return {
    ok: false,
    response: NextResponse.json({ error: "Akun ini tidak memiliki akses admin." }, { status: 403 }),
  };
}
