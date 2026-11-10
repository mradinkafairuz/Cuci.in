import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type StaffRole = "admin" | "petugas";
export const STAFF_SESSION_COOKIE = "cuci_staff_session";

export async function getStaffSession() {
  const accessToken = (await cookies()).get(STAFF_SESSION_COOKIE)?.value;
  if (!accessToken) return null;

  try {
    const supabase = createSupabaseAdminClient();
    const { data: userResult, error: userError } = await supabase.auth.getUser(accessToken);
    if (userError || !userResult.user) return null;
    const { data: profile, error: profileError } = await supabase.from("profiles").select("id, full_name, role").eq("id", userResult.user.id).maybeSingle();
    if (profileError || !profile || (profile.role !== "admin" && profile.role !== "petugas")) {
      return null;
    }
    return { id: userResult.user.id, email: userResult.user.email ?? "", name: profile.full_name, role: profile.role as StaffRole };
  } catch {
    return null;
  }
}

export async function requireStaffRole(role: StaffRole) {
  const session = await getStaffSession();
  if (!session || session.role !== role) redirect(`/login?role=${role}`);
  return session;
}
