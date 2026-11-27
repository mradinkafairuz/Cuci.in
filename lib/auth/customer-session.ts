import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

type CustomerSessionResult =
  | { ok: true; customerId: string | null }
  | { ok: false; status: 401 | 403; error: string };

export async function getOptionalCustomerSession(
  request: Request,
  supabase: SupabaseClient<Database>,
): Promise<CustomerSessionResult> {
  const authorization = request.headers.get("authorization");
  if (!authorization) return { ok: true, customerId: null };

  const token = authorization.match(/^Bearer (.+)$/i)?.[1];
  if (!token) return { ok: false, status: 401, error: "Sesi pelanggan tidak valid." };

  const { data, error } = await supabase.auth.getUser(token);
  if (error) {
    if (error.status && error.status >= 500) throw error;
    return { ok: false, status: 401, error: "Sesi pelanggan tidak valid atau sudah berakhir." };
  }
  if (!data.user) return { ok: false, status: 401, error: "Sesi pelanggan tidak valid atau sudah berakhir." };

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();
  if (profileError) throw profileError;
  if (profile?.role !== "pelanggan") {
    return { ok: false, status: 403, error: "Akun ini tidak memiliki akses pelanggan." };
  }

  return { ok: true, customerId: data.user.id };
}
