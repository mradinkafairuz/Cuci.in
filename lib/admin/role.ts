import { getBrowserSupabaseClient } from "@/lib/supabase/browser";

export type OperationalRole = "admin" | "petugas";

export async function getOperationalRole(userId: string): Promise<OperationalRole | null> {
  const { data, error } = await getBrowserSupabaseClient()
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return data?.role === "admin" || data?.role === "petugas" ? data.role : null;
}
